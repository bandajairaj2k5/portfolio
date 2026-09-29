# 🔒 BUNNY CLOUD - Motorola Moto G3 Private Cloud Storage Server

BUNNY CLOUD is a private personal cloud storage system built to run directly on a **Motorola Moto G3 (3rd gen)** using Termux / Linux environment, integrated with Telegram Bot ingestion and a Cyberpunk portfolio web interface.

---

## 🛠 System Architecture

```
                                  INTERNET
                                     |
                             Secure Tunnel (Cloudflared/SSH)
                                     |
                                     v
                       +---------------------------+
                       | Portfolio Web Interface   |
                       |    ("🔒 My Storage")      |
                       +-------------+-------------+
                                     |
                           REST API / WebSockets
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
                             (BUNNY_CLOUD/)
```

---

## 🚀 Setup on Motorola Moto G3 (Termux)

1. **Install Termux** on Moto G3.
2. **Grant Storage Permissions**:
   ```bash
   termux-setup-storage
   ```
3. **Install Python & Git**:
   ```bash
   pkg update && pkg upgrade
   pkg install python git openssh
   ```
4. **Clone / Copy Codebase to Termux**:
   ```bash
   git clone https://github.com/bandajairaj2k5/portfolio.git
   cd portfolio
   ```
5. **Configure Environment (`.env`)**:
   Create a `.env` file in the project root:
   ```env
   BUNNY_PORT=8082
   BUNNY_ADMIN_USER=admin
   BUNNY_ADMIN_PASS=your_strong_password
   TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
   TELEGRAM_ALLOWED_USER_ID=your_telegram_id
   ```
6. **Start the BUNNY CLOUD Server**:
   ```bash
   python server/app.py
   ```
7. **Start Telegram Bot Service**:
   ```bash
   python server/telegram_bot.py
   ```

---

## 📱 Telegram Ingestion Workflow

1. Send any document, photo, firmware (`robot_v2.bin`), or zip to your Telegram Bot.
2. The bot responds with interactive folder choice buttons:
   `[ Projects ]` `[ Firmware ]` `[ Documents ]` `[ Resume ]` `[ Backups ]` `[ Incoming ]`
3. Click a folder.
4. The bot downloads the file directly to Moto G3 physical storage, calculates SHA-256 checksum, updates SQLite database, and returns confirmation:
   ```
   ✓ Saved

   Firmware/robot_v2.bin
   Size: 2.4 MB
   SHA-256: 4f8a...
   ```

---

## 🔒 Security Features

- **PBKDF2-HMAC-SHA256 Password Hashing** (600,000 iterations).
- **Session Tokens** with expiration and authorization headers.
- **Strict Path Traversal Protection**: rejects `../` or escapes outside `BUNNY_CLOUD/`.
- **SHA-256 Verification** on all stored files.
- **Zero Hardcoded Secrets**: environment variable separation & `.gitignore` enforcement.

---

## ⚡ Automatic Sync Client (Laptop)

To synchronize files from your laptop to Moto G3 automatically:
```bash
python server/bunny_sync.py --server http://<MOTO_G3_IP>:8082 --dir ./BUNNY_CLOUD_SYNC --user admin --password your_password
```
