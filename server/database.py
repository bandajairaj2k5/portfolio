from __future__ import annotations
import sqlite3
import os
import time
import hashlib
import hmac
import secrets
from pathlib import Path

def load_dotenv():
    base_dir = Path(__file__).resolve().parent.parent
    for candidate in [base_dir / ".env", base_dir / ".env.local", Path.cwd() / ".env"]:
        if candidate.exists() and candidate.is_file():
            with open(candidate, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    if key and key not in os.environ:
                        os.environ[key] = val
            break

load_dotenv()

DB_FILE = os.environ.get("BUNNY_DB_PATH", os.path.join(os.path.dirname(__file__), "bunny_cloud.db"))

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at REAL NOT NULL,
        last_activity REAL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # Check if last_activity column exists in existing DB
    cursor.execute("PRAGMA table_info(sessions);")
    columns = [row[1] for row in cursor.fetchall()]
    if "last_activity" not in columns:
        cursor.execute("ALTER TABLE sessions ADD COLUMN last_activity REAL;")

    # Folders table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        relative_path TEXT UNIQUE NOT NULL,
        parent_path TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Files table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        relative_path TEXT UNIQUE NOT NULL,
        folder_path TEXT NOT NULL DEFAULT '',
        size_bytes INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        checksum_sha256 TEXT NOT NULL,
        source TEXT DEFAULT 'web',
        telegram_message_id INTEGER,
        is_deleted INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()

def hash_password(password: str, salt: bytes = None) -> tuple[str, str]:
    if salt is None:
        salt = os.urandom(16)
    else:
        if isinstance(salt, str):
            salt = bytes.fromhex(salt)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 600000)
    return pwd_hash.hex(), salt.hex()

def verify_password(password: str, password_hash: str, salt_hex: str) -> bool:
    salt = bytes.fromhex(salt_hex)
    computed_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(computed_hash, password_hash)

def create_user(username: str, password: str, role: str = 'admin'):
    pwd_hash, salt_hex = hash_password(password)
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)",
            (username, pwd_hash, salt_hex, role)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return user_id
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def update_user_password(username: str, new_password: str) -> bool:
    pwd_hash, salt_hex = hash_password(new_password)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET password_hash = ?, salt = ? WHERE username = ?",
        (pwd_hash, salt_hex, username)
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def authenticate_user(username: str, password: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return None

    if verify_password(password, user['password_hash'], user['salt']):
        return dict(user)
    return None

def create_session(user_id: int, duration_hours: int = 72) -> str:
    token = secrets.token_hex(32)
    now = time.time()
    expires_at = now + (duration_hours * 3600)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO sessions (token, user_id, expires_at, last_activity) VALUES (?, ?, ?, ?)",
        (token, user_id, expires_at, now)
    )
    conn.commit()
    conn.close()
    return token

def validate_session(token: str):
    if not token:
        return None
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT s.*, u.username, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?",
        (token,)
    )
    session = cursor.fetchone()
    conn.close()

    if not session:
        return None

    now = time.time()
    # Check hard expiration
    if session['expires_at'] < now:
        delete_session(token)
        return None

    # Check inactivity timeout (default 30 minutes, or configured BUNNY_SESSION_TIMEOUT_MINUTES)
    timeout_minutes = int(os.environ.get("BUNNY_SESSION_TIMEOUT_MINUTES", "30"))
    last_act = session['last_activity'] if session['last_activity'] is not None else session['expires_at'] - (72 * 3600)
    if (now - last_act) > (timeout_minutes * 60):
        delete_session(token)
        return None

    # Update last_activity timestamp
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE sessions SET last_activity = ? WHERE token = ?", (now, token))
    conn.commit()
    conn.close()

    return dict(session)

def delete_session(token: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")

