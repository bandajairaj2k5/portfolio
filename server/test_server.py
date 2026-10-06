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
from pathlib import Path

# Add server directory to path
sys.path.insert(0, os.path.dirname(__file__))

import database
import storage
import app

class TestBunnyCloudServer(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.db_file = os.path.join(self.temp_dir, "test_bunny.db")
        self.storage_root = os.path.join(self.temp_dir, "test_storage")

        os.environ["BUNNY_DB_PATH"] = self.db_file
        os.environ["BUNNY_STORAGE_ROOT"] = self.storage_root

        database.DB_FILE = self.db_file
        storage.DEFAULT_STORAGE_ROOT = self.storage_root

        database.init_db()
        storage.init_storage_structure()

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_database_and_auth(self):
        # Create user
        user_id = database.create_user("testuser", "secretpass123")
        self.assertIsNotNone(user_id)

        # Duplicate user fails
        dup_id = database.create_user("testuser", "secretpass123")
        self.assertIsNone(dup_id)

        # Authenticate user
        auth_success = database.authenticate_user("testuser", "secretpass123")
        self.assertIsNotNone(auth_success)
        self.assertEqual(auth_success["username"], "testuser")

        auth_fail = database.authenticate_user("testuser", "wrongpass")
        self.assertIsNone(auth_fail)

        # Create session
        token = database.create_session(user_id)
        self.assertIsNotNone(token)

        # Validate session
        session = database.validate_session(token)
        self.assertIsNotNone(session)
        self.assertEqual(session["username"], "testuser")

        # Delete session
        database.delete_session(token)
        self.assertIsNone(database.validate_session(token))

    def test_storage_and_path_security(self):
        # Test safe path resolution
        safe_path = storage.resolve_safe_path("Projects/robot.txt")
        self.assertTrue(safe_path.is_relative_to(Path(self.storage_root).resolve()))

        # Test path traversal prevention
        with self.assertRaises(ValueError):
            storage.resolve_safe_path("../../../etc/passwd")

        with self.assertRaises(ValueError):
            storage.resolve_safe_path("Projects/../../secret.txt")

        # Save file
        test_content = b"Binary firmware payload v1.0"
        file_rec = storage.save_file("firmware_v1.bin", "Firmware", test_content, source="unit_test")
        self.assertEqual(file_rec["filename"], "firmware_v1.bin")
        self.assertEqual(file_rec["size_bytes"], len(test_content))
        self.assertEqual(file_rec["folder_path"], "Firmware")

        # Verify physical file existence
        physical_path = storage.resolve_safe_path("Firmware/firmware_v1.bin")
        self.assertTrue(physical_path.exists())
        self.assertEqual(physical_path.read_bytes(), test_content)

        # List files
        data = storage.list_files_and_folders("Firmware")
        self.assertEqual(len(data["files"]), 1)
        self.assertEqual(data["files"][0]["filename"], "firmware_v1.bin")

        # Rename file
        renamed = storage.rename_file(file_rec["id"], "firmware_v1_final.bin")
        self.assertEqual(renamed["filename"], "firmware_v1_final.bin")
        self.assertTrue(storage.resolve_safe_path("Firmware/firmware_v1_final.bin").exists())

        # Delete file
        deleted = storage.delete_file(file_rec["id"])
        self.assertTrue(deleted)
        self.assertFalse(storage.resolve_safe_path("Firmware/firmware_v1_final.bin").exists())

    def test_pre_existing_files_preservation(self):
        # Create physical files on disk before storage initialization
        custom_dir = Path(self.storage_root) / "PreExistingFolder"
        custom_dir.mkdir(parents=True, exist_ok=True)
        sample_file = custom_dir / "my_secret_notes.txt"
        sample_file.write_bytes(b"Do not modify or delete this pre-existing physical data")

        # Run storage indexing
        storage.sync_existing_physical_files()

        # Check that file was indexed in database
        data = storage.list_files_and_folders("PreExistingFolder")
        self.assertEqual(len(data["files"]), 1)
        self.assertEqual(data["files"][0]["filename"], "my_secret_notes.txt")

        # Check physical file is intact and unchanged
        self.assertTrue(sample_file.exists())
        self.assertEqual(sample_file.read_bytes(), b"Do not modify or delete this pre-existing physical data")

    def test_session_inactivity_timeout(self):
        user_id = database.create_user("timeout_user", "pass12345")
        token = database.create_session(user_id)

        # Session should be valid initially
        session = database.validate_session(token)
        self.assertIsNotNone(session)

        # Manually set last_activity to 1 hour ago
        conn = database.get_db()
        cursor = conn.cursor()
        one_hour_ago = time.time() - 3600
        cursor.execute("UPDATE sessions SET last_activity = ? WHERE token = ?", (one_hour_ago, token))
        conn.commit()
        conn.close()

        # With 30 minute timeout (default), session should now be expired due to inactivity
        os.environ["BUNNY_SESSION_TIMEOUT_MINUTES"] = "30"
        expired_session = database.validate_session(token)
        self.assertIsNone(expired_session)

    def test_extended_path_traversal_protection(self):
        invalid_paths = [
            "../../../etc/passwd",
            "Projects/../../secret.txt",
            "..\\..\\windows\\system32",
            "/etc/shadow",
            "C:\\boot.ini",
            "Projects/subdir/../../../root.txt"
        ]
        for path_str in invalid_paths:
            with self.assertRaises(ValueError, msg=f"Should fail for path: {path_str}"):
                storage.resolve_safe_path(path_str)

if __name__ == "__main__":
    unittest.main()

