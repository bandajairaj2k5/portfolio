import os
import sys
import time
import argparse
import hashlib
import urllib.request
import urllib.parse
import json
from pathlib import Path

DEFAULT_SERVER_URL = "http://localhost:8082"
DEFAULT_SYNC_DIR = "./BUNNY_CLOUD_SYNC"

def calculate_sha256(file_path: Path) -> str:
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

class BunnySyncClient:
    def __init__(self, server_url: str, sync_dir: str):
        self.server_url = server_url.rstrip("/")
        self.sync_dir = Path(sync_dir).resolve()
        self.token = None

    def login(self, username: str, password: str) -> bool:
        url = f"{self.server_url}/auth/login"
        payload = json.dumps({"username": username, "password": password}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                if res.get("success"):
                    self.token = res["token"]
                    print(f"✓ Authenticated as '{username}' on {self.server_url}")
                    return True
        except Exception as e:
            print(f"❌ Login failed: {e}")
            return False
        return False

    def upload_file(self, file_path: Path, remote_folder: str) -> bool:
        url = f"{self.server_url}/api/files/upload"
        boundary = "----BunnySyncBoundary" + hashlib.md5(str(time.time()).encode()).hexdigest()
        
        with open(file_path, "rb") as f:
            file_bytes = f.read()

        body = []
        body.append(f"--{boundary}".encode())
        body.append(f'Content-Disposition: form-data; name="folder"'.encode())
        body.append(b"")
        body.append(remote_folder.encode())

        body.append(f"--{boundary}".encode())
        body.append(f'Content-Disposition: form-data; name="file"; filename="{file_path.name}"'.encode())
        body.append(b"Content-Type: application/octet-stream")
        body.append(b"")
        body.append(file_bytes)
        body.append(f"--{boundary}--".encode())
        body.append(b"")

        payload = b"\r\n".join(body)
        headers = {
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Authorization": f"Bearer {self.token}"
        }

        req = urllib.request.Request(url, data=payload, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                return res.get("success", False)
        except Exception as e:
            print(f"❌ Failed to upload {file_path.name}: {e}")
            return False

    def sync_once(self):
        if not self.sync_dir.exists():
            self.sync_dir.mkdir(parents=True, exist_ok=True)
            print(f"Created sync directory: {self.sync_dir}")

        print(f"Scanning local directory: {self.sync_dir}")
        for path in self.sync_dir.rglob("*"):
            if path.is_file():
                rel_path = path.relative_to(self.sync_dir)
                folder = str(rel_path.parent).replace("\\", "/")
                if folder == ".":
                    folder = "Incoming"

                print(f"Syncing [{folder}] {path.name}...")
                success = self.upload_file(path, folder)
                if success:
                    print(f"  ✓ Uploaded successfully")
                else:
                    print(f"  ❌ Sync failed")

def main():
    parser = argparse.ArgumentParser(description="BUNNY CLOUD Automatic Sync Client")
    parser.add_argument("--server", default=DEFAULT_SERVER_URL, help="BUNNY CLOUD server URL")
    parser.add_argument("--dir", default=DEFAULT_SYNC_DIR, help="Local directory to sync")
    parser.add_argument("--user", default="admin", help="Username")
    parser.add_argument("--password", default="bunny1234", help="Password")
    args = parser.parse_args()

    client = BunnySyncClient(args.server, args.dir)
    if client.login(args.user, args.password):
        client.sync_once()

if __name__ == "__main__":
    main()
