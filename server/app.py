import http.server
import socketserver
import json
import os
import sys
import shutil
import urllib.parse
import re
import time
from pathlib import Path

import database
import storage

PORT = int(os.environ.get("BUNNY_PORT", 8082))
HOST = os.environ.get("BUNNY_HOST", "127.0.0.1")

FAILED_ATTEMPTS = {}

class BunnyRequestHandler(http.server.BaseHTTPRequestHandler):

    def send_cors_headers(self):
        origin = self.headers.get("Origin", "")
        allowed_env = os.environ.get("BUNNY_ALLOWED_ORIGIN", "").strip()

        if allowed_env and allowed_env != "*":
            allowed_list = [o.strip() for o in allowed_env.split(",") if o.strip()]
            if origin in allowed_list:
                self.send_header("Access-Control-Allow-Origin", origin)
            else:
                self.send_header("Access-Control-Allow-Origin", allowed_list[0])
        elif origin:
            self.send_header("Access-Control-Allow-Origin", origin)
        else:
            self.send_header("Access-Control-Allow-Origin", "*")

        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Telegram-Secret")
        self.send_header("Access-Control-Allow-Credentials", "true")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def send_json(self, data, status=200, headers=None):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if headers:
            for k, v in headers.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message, status=400):
        self.send_json({"error": message}, status=status)

    def get_auth_token(self):
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header[7:].strip()
        cookie_header = self.headers.get("Cookie", "")
        for item in cookie_header.split(";"):
            item = item.strip()
            if item.startswith("bunny_token="):
                return item[12:].strip()
        return None

    def require_auth(self):
        token = self.get_auth_token()
        session = database.validate_session(token)
        if not session:
            self.send_error_json("Unauthorized access", status=401)
            return None
        return session

    def read_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        raw = self.rfile.read(content_length)
        try:
            return json.loads(raw.decode("utf-8"))
        except Exception:
            return None

    def parse_multipart_data(self):
        content_type = self.headers.get("Content-Type", "")
        if "boundary=" not in content_type:
            return None, None, None
        
        boundary = content_type.split("boundary=")[1].encode("utf-8")
        content_length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_length)

        parts = raw_body.split(b"--" + boundary)
        filename = None
        folder_path = ""
        file_data = None

        for part in parts:
            if not part or part == b"--\r\n" or part == b"--":
                continue
            
            headers_part, _, content = part.partition(b"\r\n\r\n")
            if content.endswith(b"\r\n"):
                content = content[:-2]
            
            headers_str = headers_part.decode("utf-8", errors="ignore")
            
            if 'name="folder"' in headers_str:
                folder_path = content.decode("utf-8", errors="ignore").strip()
            elif 'name="file"' in headers_str or 'filename="' in headers_str:
                match = re.search(r'filename="([^"]+)"', headers_str)
                if match:
                    filename = match.group(1)
                    file_data = content

        return filename, folder_path, file_data

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        # Health endpoint
        if path == "/api/health":
            self.send_json({"status": "online", "system": "BUNNY CLOUD Moto G3", "version": "1.0.0"})
            return

        # Auth Check
        if path == "/api/auth/check":
            token = self.get_auth_token()
            session = database.validate_session(token)
            if session:
                self.send_json({"authenticated": True, "username": session["username"], "role": session["role"]})
            else:
                self.send_json({"authenticated": False}, status=401)
            return

        # Protected Endpoints
        session = self.require_auth()
        if not session:
            return

        try:
            if path == "/api/storage":
                stats = storage.get_storage_stats()
                self.send_json(stats)
                return

            if path == "/api/files":
                folder = query.get("folder", [""])[0]
                data = storage.list_files_and_folders(folder)
                self.send_json(data)
                return

            # Download file: /api/files/{id}/download
            file_download_match = re.match(r"^/api/files/(\d+)/download$", path)
            if file_download_match:
                file_id = int(file_download_match.group(1))
                conn = database.get_db()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM files WHERE id = ?", (file_id,))
                file_record = cursor.fetchone()
                conn.close()

                if not file_record:
                    self.send_error_json("File not found", status=404)
                    return

                file_record = dict(file_record)
                abs_path = storage.resolve_safe_path(file_record["relative_path"])
                if not abs_path.exists():
                    self.send_error_json("Physical file not found", status=404)
                    return

                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", file_record["mime_type"])
                self.send_header("Content-Length", str(file_record["size_bytes"]))
                self.send_header("Content-Disposition", f'attachment; filename="{file_record["filename"]}"')
                self.end_headers()

                with open(abs_path, "rb") as f:
                    while True:
                        chunk = f.read(65536)
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                return

            # Single file info: /api/files/{id}
            file_info_match = re.match(r"^/api/files/(\d+)$", path)
            if file_info_match:
                file_id = int(file_info_match.group(1))
                conn = database.get_db()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM files WHERE id = ?", (file_id,))
                file_record = cursor.fetchone()
                conn.close()
                if not file_record:
                    self.send_error_json("File not found", status=404)
                else:
                    self.send_json(dict(file_record))
                return

            if path == "/api/folders":
                folder = query.get("parent", [""])[0]
                data = storage.list_files_and_folders(folder)
                self.send_json({"folders": data["folders"]})
                return

            self.send_error_json("Endpoint not found", status=404)
        except ValueError as e:
            self.send_error_json(str(e), status=400)

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # Login endpoint
        if path == "/auth/login" or path == "/api/auth/login":
            client_ip = self.client_address[0]
            now = time.time()
            max_attempts = int(os.environ.get("BUNNY_MAX_LOGIN_ATTEMPTS", "5"))
            lockout_mins = int(os.environ.get("BUNNY_LOCKOUT_MINUTES", "5"))

            ip_data = FAILED_ATTEMPTS.get(client_ip, {"count": 0, "lockout_until": 0})
            if now < ip_data["lockout_until"]:
                remaining = int(ip_data["lockout_until"] - now)
                self.send_error_json(f"Too many failed login attempts. Locked out for {remaining}s.", status=429)
                return

            body = self.read_json_body()
            if not body or "username" not in body or "password" not in body:
                self.send_error_json("Username and password required", status=400)
                return

            user = database.authenticate_user(body["username"], body["password"])
            if not user:
                ip_data["count"] += 1
                if ip_data["count"] >= max_attempts:
                    ip_data["lockout_until"] = now + (lockout_mins * 60)
                FAILED_ATTEMPTS[client_ip] = ip_data
                self.send_error_json("Invalid credentials", status=401)
                return

            # Clear failed attempts on successful login
            if client_ip in FAILED_ATTEMPTS:
                del FAILED_ATTEMPTS[client_ip]

            token = database.create_session(user["id"])
            cookie_val = f"bunny_token={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=259200"
            self.send_json({
                "success": True,
                "token": token,
                "username": user["username"],
                "role": user["role"]
            }, headers={"Set-Cookie": cookie_val})
            return

        # Internal Telegram Ingestion API Endpoint
        if path == "/internal/telegram/ingest":
            secret_header = self.headers.get("X-Telegram-Secret", "")
            expected_secret = os.environ.get("TELEGRAM_INTERNAL_SECRET", "bunny_internal_secret")
            if secret_header != expected_secret:
                self.send_error_json("Unauthorized internal call", status=401)
                return

            try:
                filename, folder_path, file_data = self.parse_multipart_data()
                if not filename or file_data is None:
                    body = self.read_json_body()
                    if body and "filename" in body and "file_base64" in body:
                        import base64
                        filename = body["filename"]
                        folder_path = body.get("folder", "Incoming")
                        file_data = base64.b64decode(body["file_base64"])
                        msg_id = body.get("telegram_message_id")
                    else:
                        self.send_error_json("Missing file data", status=400)
                        return
                else:
                    msg_id = None

                saved = storage.save_file(
                    filename=filename,
                    folder_path=folder_path or "Incoming",
                    file_bytes=file_data,
                    source="telegram",
                    telegram_msg_id=msg_id
                )
                self.send_json({"success": True, "file": saved})
            except ValueError as e:
                self.send_error_json(str(e), status=400)
            return

        # Protected Endpoints
        session = self.require_auth()
        if not session:
            return

        if path == "/auth/logout" or path == "/api/auth/logout":
            token = self.get_auth_token()
            database.delete_session(token)
            self.send_json({"success": True})
            return

        try:
            if path == "/api/files/upload":
                filename, folder_path, file_data = self.parse_multipart_data()
                if not filename or file_data is None:
                    self.send_error_json("No file uploaded", status=400)
                    return

                saved = storage.save_file(
                    filename=filename,
                    folder_path=folder_path,
                    file_bytes=file_data,
                    source="web"
                )
                self.send_json({"success": True, "file": saved})
                return

            if path == "/api/folders":
                body = self.read_json_body() or {}
                folder_name = body.get("name")
                parent_path = body.get("parent_path", "")

                if not folder_name:
                    self.send_error_json("Folder name required", status=400)
                    return

                created = storage.create_folder(folder_name, parent_path)
                self.send_json({"success": True, "folder": created})
                return

            self.send_error_json("Endpoint not found", status=404)
        except ValueError as e:
            self.send_error_json(str(e), status=400)

    def do_PATCH(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        session = self.require_auth()
        if not session:
            return

        try:
            file_rename_match = re.match(r"^/api/files/(\d+)$", path)
            if file_rename_match:
                file_id = int(file_rename_match.group(1))
                body = self.read_json_body() or {}
                new_name = body.get("name")
                if not new_name:
                    self.send_error_json("New filename required", status=400)
                    return

                updated = storage.rename_file(file_id, new_name)
                if not updated:
                    self.send_error_json("File not found", status=404)
                else:
                    self.send_json({"success": True, "file": updated})
                return

            self.send_error_json("Endpoint not found", status=404)
        except ValueError as e:
            self.send_error_json(str(e), status=400)

    def do_DELETE(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        session = self.require_auth()
        if not session:
            return

        try:
            file_delete_match = re.match(r"^/api/files/(\d+)$", path)
            if file_delete_match:
                file_id = int(file_delete_match.group(1))
                success = storage.delete_file(file_id)
                if success:
                    self.send_json({"success": True, "id": file_id})
                else:
                    self.send_error_json("File not found or delete failed", status=404)
                return

            self.send_error_json("Endpoint not found", status=404)
        except ValueError as e:
            self.send_error_json(str(e), status=400)

def run_server():
    database.init_db()
    storage.init_storage_structure()

    admin_user = os.environ.get("BUNNY_ADMIN_USER", "BUNNY")
    admin_pass = os.environ.get("BUNNY_ADMIN_PASS", "123456")

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ?", (admin_user,))
    if not cursor.fetchone():
        database.create_user(admin_user, admin_pass, role="admin")
        print(f"Created initial admin user: '{admin_user}'")
    else:
        # If BUNNY_ADMIN_PASS is explicitly overridden in environment, sync it
        if "BUNNY_ADMIN_PASS" in os.environ:
            database.update_user_password(admin_user, admin_pass)
    conn.close()

    server_address = (HOST, PORT)
    httpd = socketserver.TCPServer(server_address, BunnyRequestHandler)
    print(f"BUNNY CLOUD Server running at http://{HOST}:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()

