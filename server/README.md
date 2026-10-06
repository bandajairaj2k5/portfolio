# 🔒 MY CLOUD - Motorola Moto G3 Private Personal Cloud Storage Server

MY CLOUD is a private personal cloud storage system running directly on a **Motorola Moto G3** (`/sdcard/CloudStorage`) via Termux / Linux environment, accessible through a **“My Cloud”** button on your public portfolio web interface.

---

## 🛠 System Architecture

```
                                  INTERNET
                                     |
                       HTTPS Tunnel (Cloudflared / Tailscale)
                                     |
                                     v
                       +---------------------------+
                       | Public Portfolio Web UI   |
                       |      ("🔒 My Cloud")      |
                       +-------------+-------------+
                                     |
                          REST API (Cookies/Bearer)
                                     |
                                     v
                       +---------------------------+
                       |    Motorola Moto G3       |
                       |                           |
                       |    Termux / Linux         |
                       |    Python API Server      |
                       |    SQLite Metadata DB     |
                       |    Telegram Bot Service   |
                       +-------------+-------------+
                                     |
                                     v
                           Physical File Storage
                           (/sdcard/CloudStorage)
```

---

## 🔑 How to Set / Change the Cloud Password

1. **Via Environment File (`.env`)**:
   Open or create `.env` in the root folder of your project:
   ```env
   BUNNY_ADMIN_USER=BUNNY
   BUNNY_ADMIN_PASS=YourNewSuperSecurePasswordHere
   ```
   Restart the server (`python server/app.py` or `bash server/start_moto.sh`). The server automatically updates the salted PBKDF2 hash in SQLite on startup.

2. **Via Python Command Line**:
   Run this single command on your Moto G3 / server:
   ```bash
   python -c "import server.database as db; db.update_user_password('BUNNY', 'YourNewPasswordHere')"
   ```

---

## 🚀 How to Start the Moto G3 Server

1. **Install & Setup Termux on Moto G3**:
   ```bash
   termux-setup-storage
   pkg update && pkg upgrade
   pkg install python git
   ```
2. **Launch with Startup Script**:
   ```bash
   bash server/start_moto.sh
   ```
   Or run the Python server directly:
   ```bash
   python server/app.py
   ```
3. **Exposing Externally via HTTPS (Recommended)**:
   Do not expose raw HTTP directly on public ports. Use a Cloudflare Tunnel:
   ```bash
   cloudflared tunnel --url http://localhost:8082
   ```
   Copy the generated HTTPS URL (e.g. `https://your-tunnel.trycloudflare.com`).

---

## 🌐 How the Portfolio Connects to Moto G3

1. Click **🔒 My Cloud** in the portfolio navigation bar.
2. The password login screen will appear.
3. Open **⚙️ Server Connection Settings** in the modal and paste your Moto G3 HTTPS tunnel address (or local IP e.g. `http://192.168.1.50:8082`).
4. Enter your credentials and click **UNLOCK MY CLOUD**.
5. Client saves only the secure session token in `localStorage` (never the plaintext password).

---

## 🔒 Security Features & Controls

- **Password Security**: Server-side PBKDF2-HMAC-SHA256 password hashing (600,000 iterations + 16-byte random salt). Plaintext passwords are never stored in source code, GitHub, or frontend.
- **Session Protection**: Automatic inactivity expiration (default 30 mins) and HttpOnly session cookies / Bearer tokens.
- **Path Traversal Shield**: Blocks `../`, `..\`, absolute paths, and escaping outside `/sdcard/CloudStorage`.
- **Brute-force Rate Limiting**: Temporary 5-minute lockout (HTTP 429) after 5 failed login attempts per IP.
- **CORS Restriction**: Restricted to your portfolio domain (`BUNNY_ALLOWED_ORIGIN`).
- **Data Preservation**: Pre-existing files in `/sdcard/CloudStorage` are automatically indexed into SQLite on startup without deleting or modifying your physical files.

---

## 🧪 Security Tests Performed

Run the unit and end-to-end test suites:

```bash
python -m unittest server/test_server.py
python -m unittest server/test_e2e.py
```

### Verified Test Assertions:
1. **Unauthenticated API Rejection**: All file endpoints return HTTP `401 Unauthorized` without a valid session token.
2. **Path Traversal Defense**: Requests attempting `../` or path traversal return HTTP `400 Bad Request`.
3. **Brute-Force Lockout**: 5 consecutive invalid login attempts trigger HTTP `429 Too Many Requests`.
4. **Session Inactivity Timeout**: Inactive sessions automatically expire after the configured timeout.
5. **Physical Data Preservation**: Pre-existing files on `/sdcard/CloudStorage` are indexed cleanly without modification.

