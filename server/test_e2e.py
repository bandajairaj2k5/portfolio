import unittest
import os
import sys
import shutil
import tempfile
import json
import urllib.request
import urllib.parse
import threading
import time

sys.path.insert(0, os.path.dirname(__file__))

import database
import storage
import app

class TestE2EFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.mkdtemp()
        cls.db_file = os.path.join(cls.temp_dir, "e2e_bunny.db")
        cls.storage_root = os.path.join(cls.temp_dir, "e2e_storage")

        os.environ["BUNNY_DB_PATH"] = cls.db_file
        os.environ["BUNNY_STORAGE_ROOT"] = cls.storage_root

        database.DB_FILE = cls.db_file
        storage.DEFAULT_STORAGE_ROOT = cls.storage_root

        app.PORT = 8999
        app.HOST = "127.0.0.1"

        database.init_db()
        storage.init_storage_structure()

        # Start server in thread
        cls.server_thread = threading.Thread(target=app.run_server, daemon=True)
        cls.server_thread.start()
        time.sleep(1.0) # Wait for server startup

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.temp_dir, ignore_errors=True)

    def test_full_http_e2e(self):
        base_url = "http://127.0.0.1:8999"

        # 1. Health check
        req = urllib.request.Request(f"{base_url}/api/health")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            self.assertEqual(data["status"], "online")

        # 2. Login
        login_data = json.dumps({"username": "BUNNY", "password": "123456"}).encode()
        req = urllib.request.Request(f"{base_url}/auth/login", data=login_data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode())
            self.assertTrue(res["success"])
            token = res["token"]

        headers = {"Authorization": f"Bearer {token}"}

        # 3. Storage stats
        req = urllib.request.Request(f"{base_url}/api/storage", headers=headers)
        with urllib.request.urlopen(req) as resp:
            stats = json.loads(resp.read().decode())
            self.assertIn("free_bytes", stats)

        # 4. List files
        req = urllib.request.Request(f"{base_url}/api/files?folder=Firmware", headers=headers)
        with urllib.request.urlopen(req) as resp:
            files_data = json.loads(resp.read().decode())
            self.assertEqual(files_data["folder"], "Firmware")

        # 5. Internal Telegram ingestion test
        ingest_data = json.dumps({
            "filename": "firmware_test_v2.bin",
            "file_base64": "SGVsbG8gQlVOTlkgQ0xPVUQ=", # "Hello BUNNY CLOUD"
            "folder": "Firmware",
            "telegram_message_id": 9999
        }).encode()

        req = urllib.request.Request(
            f"{base_url}/internal/telegram/ingest",
            data=ingest_data,
            headers={
                "Content-Type": "application/json",
                "X-Telegram-Secret": "bunny_internal_secret"
            }
        )
        with urllib.request.urlopen(req) as resp:
            ingest_res = json.loads(resp.read().decode())
            self.assertTrue(ingest_res["success"])
            file_record = ingest_res["file"]
            self.assertEqual(file_record["filename"], "firmware_test_v2.bin")

        # 6. Download ingested file
        file_id = file_record["id"]
        req = urllib.request.Request(f"{base_url}/api/files/{file_id}/download", headers=headers)
        with urllib.request.urlopen(req) as resp:
            content = resp.read()
            self.assertEqual(content, b"Hello BUNNY CLOUD")

        # 7. Delete file
        req = urllib.request.Request(f"{base_url}/api/files/{file_id}", headers=headers, method="DELETE")
        with urllib.request.urlopen(req) as resp:
            del_res = json.loads(resp.read().decode())
            self.assertTrue(del_res["success"])

    def test_unauthenticated_requests_return_401(self):
        base_url = "http://127.0.0.1:8999"
        protected_endpoints = [
            ("/api/storage", "GET"),
            ("/api/files?folder=Firmware", "GET"),
            ("/api/files/1/download", "GET"),
            ("/api/files/1", "DELETE"),
        ]

        for ep, method in protected_endpoints:
            req = urllib.request.Request(f"{base_url}{ep}", method=method)
            try:
                with urllib.request.urlopen(req) as resp:
                    self.fail(f"Endpoint {ep} should have failed with 401, got HTTP {resp.status}")
            except urllib.error.HTTPError as err:
                self.assertEqual(err.code, 401, f"Expected 401 for {ep}, got {err.code}")

    def test_path_traversal_returns_400(self):
        base_url = "http://127.0.0.1:8999"
        
        # Get valid token
        login_data = json.dumps({"username": "BUNNY", "password": "123456"}).encode()
        req = urllib.request.Request(f"{base_url}/auth/login", data=login_data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as resp:
            token = json.loads(resp.read().decode())["token"]

        headers = {"Authorization": f"Bearer {token}"}
        
        # Test folder creation with path traversal
        body = json.dumps({"name": "../../../hacked", "parent_path": "Projects"}).encode()
        req = urllib.request.Request(f"{base_url}/api/folders", data=body, headers={"Content-Type": "application/json", **headers})
        try:
            with urllib.request.urlopen(req) as resp:
                self.fail("Path traversal folder creation should fail with 400")
        except urllib.error.HTTPError as err:
            self.assertEqual(err.code, 400)

    def test_rate_limiting(self):
        base_url = "http://127.0.0.1:8999"
        bad_login = json.dumps({"username": "BUNNY", "password": "wrong_password_xyz"}).encode()

        # Perform failed login attempts up to max threshold (5)
        for i in range(5):
            req = urllib.request.Request(f"{base_url}/auth/login", data=bad_login, headers={"Content-Type": "application/json"})
            try:
                urllib.request.urlopen(req)
            except urllib.error.HTTPError as err:
                self.assertEqual(err.code, 401)

        # 6th attempt should return 429 Too Many Requests
        req = urllib.request.Request(f"{base_url}/auth/login", data=bad_login, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req) as resp:
                self.fail("Should have been rate limited with 429")
        except urllib.error.HTTPError as err:
            self.assertEqual(err.code, 429)

if __name__ == "__main__":
    unittest.main()

