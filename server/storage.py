import os
import shutil
import hashlib
import mimetypes
from pathlib import Path
import database

DEFAULT_FOLDERS = ["Projects", "Firmware", "Documents", "Resume", "Backups", "Incoming", "Trash"]

def get_storage_root() -> Path:
    env_root = os.environ.get("BUNNY_STORAGE_ROOT")
    candidate_paths = []
    if env_root:
        candidate_paths.append(env_root)
    if os.path.exists("/sdcard"):
        candidate_paths.append("/sdcard/CloudStorage")
    candidate_paths.append(os.path.join(os.path.expanduser("~"), "CloudStorage"))

    for p in candidate_paths:
        try:
            root = Path(p).resolve()
            root.mkdir(parents=True, exist_ok=True)
            test_sub = root / ".test_sub"
            test_sub.mkdir(parents=True, exist_ok=True)
            test_file = test_sub / ".perm_check"
            test_file.touch()
            test_file.unlink()
            test_sub.rmdir()
            return root
        except Exception:
            continue

    root = Path(os.path.expanduser("~/CloudStorage")).resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root

def init_storage_structure():
    root = get_storage_root()
    conn = database.get_db()
    cursor = conn.cursor()

    for folder in DEFAULT_FOLDERS:
        try:
            folder_dir = root / folder
            folder_dir.mkdir(parents=True, exist_ok=True)
        except PermissionError:
            root = Path(os.path.expanduser("~/CloudStorage")).resolve()
            root.mkdir(parents=True, exist_ok=True)
            folder_dir = root / folder
            folder_dir.mkdir(parents=True, exist_ok=True)

        rel_path = folder.strip("/")
        cursor.execute("SELECT id FROM folders WHERE relative_path = ?", (rel_path,))
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO folders (name, relative_path, parent_path) VALUES (?, ?, ?)",
                (folder, rel_path, "")
            )

    conn.commit()
    conn.close()

    # Index any pre-existing physical files on disk without modifying or deleting them
    sync_existing_physical_files()

def sync_existing_physical_files():
    root = get_storage_root()
    if not root.exists():
        return

    conn = database.get_db()
    cursor = conn.cursor()

    for current_dir, dirs, files in os.walk(root):
        curr_path = Path(current_dir)
        try:
            rel_dir = curr_path.relative_to(root).as_posix()
        except ValueError:
            continue

        if rel_dir == ".":
            rel_dir = ""

        # Index folders
        if rel_dir:
            name = curr_path.name
            parent = curr_path.parent.relative_to(root).as_posix() if curr_path.parent != root else ""
            cursor.execute("SELECT id FROM folders WHERE relative_path = ?", (rel_dir,))
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO folders (name, relative_path, parent_path) VALUES (?, ?, ?)",
                    (name, rel_dir, parent)
                )

        # Index files
        for filename in files:
            file_path = curr_path / filename
            if rel_dir:
                rel_file = f"{rel_dir}/{filename}"
            else:
                rel_file = filename

            cursor.execute("SELECT id FROM files WHERE relative_path = ?", (rel_file,))
            if not cursor.fetchone():
                try:
                    size = file_path.stat().st_size
                    mime = get_mime_type(filename)
                    sha256 = calculate_sha256(file_path)
                    cursor.execute(
                        """
                        INSERT INTO files (filename, relative_path, folder_path, size_bytes, mime_type, checksum_sha256, source)
                        VALUES (?, ?, ?, ?, ?, ?, 'existing_storage')
                        """,
                        (filename, rel_file, rel_dir, size, mime, sha256)
                    )
                except Exception as e:
                    print(f"Warning: Failed to index file {file_path}: {e}")

    conn.commit()
    conn.close()

def check_traversal_attempt(*paths: str):
    for p in paths:
        if not p:
            continue
        p_str = str(p).replace("\\", "/")
        parts = [part for part in p_str.split("/") if part]
        if ".." in parts or ".." in p_str or p_str.startswith("/") or p_str.startswith("\\") or ":" in p_str:
            raise ValueError(f"Path traversal attempt detected: {p}")

def sanitize_path_segment(name: str) -> str:
    cleaned = name.replace("\\", "/").strip("/ ")
    parts = [p for p in cleaned.split("/") if p and p != ".." and p != "."]
    return "/".join(parts)

def resolve_safe_path(relative_path: str) -> Path:
    check_traversal_attempt(relative_path)
    root = get_storage_root()
    clean_rel = sanitize_path_segment(relative_path)
    target = (root / clean_rel).resolve()
    
    if not (target == root or root in target.parents):
        raise ValueError(f"Path traversal attempt detected: {relative_path}")
    return target


def calculate_sha256(file_path: Path) -> str:
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

def get_mime_type(filename: str) -> str:
    mime, _ = mimetypes.guess_type(filename)
    return mime or "application/octet-stream"

def save_file(filename: str, folder_path: str, file_bytes: bytes, source: str = "web", telegram_msg_id: int = None):
    check_traversal_attempt(filename, folder_path)
    clean_folder = sanitize_path_segment(folder_path)
    folder_dir = resolve_safe_path(clean_folder)
    folder_dir.mkdir(parents=True, exist_ok=True)

    clean_filename = Path(filename).name
    if not clean_filename or clean_filename == ".":
        clean_filename = "unnamed_file"

    file_path = folder_dir / clean_filename
    rel_path = f"{clean_folder}/{clean_filename}".strip("/")

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    size = len(file_bytes)
    sha256_hash = calculate_sha256(file_path)
    mime = get_mime_type(clean_filename)

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO files (filename, relative_path, folder_path, size_bytes, mime_type, checksum_sha256, source, telegram_message_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(relative_path) DO UPDATE SET
            size_bytes=excluded.size_bytes,
            checksum_sha256=excluded.checksum_sha256,
            mime_type=excluded.mime_type,
            updated_at=CURRENT_TIMESTAMP,
            is_deleted=0
        """,
        (clean_filename, rel_path, clean_folder, size, mime, sha256_hash, source, telegram_msg_id)
    )
    conn.commit()

    cursor.execute("SELECT * FROM files WHERE relative_path = ?", (rel_path,))
    record = dict(cursor.fetchone())
    conn.close()

    return record

def list_files_and_folders(folder_path: str = ""):
    check_traversal_attempt(folder_path)
    clean_folder = sanitize_path_segment(folder_path)
    conn = database.get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM folders WHERE parent_path = ? ORDER BY name ASC",
        (clean_folder,)
    )
    folders = [dict(row) for row in cursor.fetchall()]

    cursor.execute(
        "SELECT * FROM files WHERE folder_path = ? AND is_deleted = 0 ORDER BY filename ASC",
        (clean_folder,)
    )
    files = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return {"folder": clean_folder, "folders": folders, "files": files}

def delete_file(file_id: int):
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM files WHERE id = ?", (file_id,))
    file_record = cursor.fetchone()
    if not file_record:
        conn.close()
        return False

    file_record = dict(file_record)
    rel_path = file_record["relative_path"]

    try:
        abs_path = resolve_safe_path(rel_path)
        if abs_path.exists():
            abs_path.unlink()
    except Exception as e:
        print(f"Error removing physical file {rel_path}: {e}")

    cursor.execute("DELETE FROM files WHERE id = ?", (file_id,))
    conn.commit()
    conn.close()
    return True

def rename_file(file_id: int, new_name: str):
    check_traversal_attempt(new_name)
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM files WHERE id = ?", (file_id,))
    file_record = cursor.fetchone()
    if not file_record:
        conn.close()
        return None

    file_record = dict(file_record)
    clean_new_name = Path(new_name).name
    folder = file_record["folder_path"]
    old_rel = file_record["relative_path"]
    new_rel = f"{folder}/{clean_new_name}".strip("/")

    old_abs = resolve_safe_path(old_rel)
    new_abs = resolve_safe_path(new_rel)

    if old_abs.exists():
        old_abs.rename(new_abs)

    cursor.execute(
        "UPDATE files SET filename = ?, relative_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (clean_new_name, new_rel, file_id)
    )
    conn.commit()

    cursor.execute("SELECT * FROM files WHERE id = ?", (file_id,))
    updated = dict(cursor.fetchone())
    conn.close()
    return updated

def create_folder(folder_name: str, parent_path: str = ""):
    check_traversal_attempt(folder_name, parent_path)
    clean_parent = sanitize_path_segment(parent_path)
    clean_name = Path(folder_name).name
    new_rel = f"{clean_parent}/{clean_name}".strip("/")

    abs_path = resolve_safe_path(new_rel)
    abs_path.mkdir(parents=True, exist_ok=True)

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO folders (name, relative_path, parent_path) VALUES (?, ?, ?)",
        (clean_name, new_rel, clean_parent)
    )
    conn.commit()
    folder_id = cursor.lastrowid
    cursor.execute("SELECT * FROM folders WHERE id = ?", (folder_id,))
    created = dict(cursor.fetchone())
    conn.close()
    return created

def get_storage_stats():
    root = get_storage_root()
    total, used, free = shutil.disk_usage(root)

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT SUM(size_bytes) as total_size, COUNT(*) as file_count FROM files WHERE is_deleted = 0")
    row = cursor.fetchone()
    conn.close()

    cloud_bytes = row["total_size"] or 0
    file_count = row["file_count"] or 0

    return {
        "total_bytes": total,
        "used_bytes": used,
        "free_bytes": free,
        "cloud_used_bytes": cloud_bytes,
        "file_count": file_count,
        "used_percentage": round((used / total) * 100, 2) if total else 0
    }

if __name__ == "__main__":
    init_storage_structure()
    print("Storage initialized successfully.")
    print("Stats:", get_storage_stats())
