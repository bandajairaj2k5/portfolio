import os
import sys
import time
import json
import urllib.request
import urllib.parse
import hashlib
from pathlib import Path

import database
import storage

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
ALLOWED_USER_ID = os.environ.get("TELEGRAM_ALLOWED_USER_ID", "")
POLL_INTERVAL = 3.0

# Temporary state for pending file ingestion choices
# { message_id: { "file_id": ..., "file_name": ..., "file_size": ... } }
pending_files = {}

def telegram_api_call(method: str, payload: dict = None):
    if not BOT_TOKEN:
        print("[Telegram Bot] TELEGRAM_BOT_TOKEN is not configured in .env.")
        return None

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    data = None
    headers = {}

    if payload:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            res_bytes = resp.read()
            return json.loads(res_bytes.decode("utf-8"))
    except Exception as e:
        print(f"[Telegram Bot API Error] {method}: {e}")
        return None

def download_telegram_file(file_id: str) -> bytes:
    res = telegram_api_call("getFile", {"file_id": file_id})
    if not res or not res.get("ok"):
        return None
    file_path = res["result"]["file_path"]
    download_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}"
    req = urllib.request.Request(download_url)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return resp.read()
    except Exception as e:
        print(f"[Telegram Download Error] {e}")
        return None

def get_folder_keyboard():
    data = storage.list_files_and_folders("")
    folders = [f["name"] for f in data["folders"]]
    if not folders:
        folders = ["Projects", "Firmware", "Documents", "Resume", "Backups"]

    keyboard = []
    row = []
    for f in folders:
        row.append({"text": f"📁 {f}", "callback_data": f"save:{f}"})
        if len(row) == 2:
            keyboard.append(row)
            row = []
    if row:
        keyboard.append(row)
    
    keyboard.append([{"text": "➕ Incoming", "callback_data": "save:Incoming"}])
    return {"inline_keyboard": keyboard}

def process_message(msg: dict):
    chat_id = msg["chat"]["id"]
    from_user_id = str(msg["from"]["id"])

    if ALLOWED_USER_ID and from_user_id != str(ALLOWED_USER_ID):
        print(f"[Telegram Bot] Unauthorized user message from ID: {from_user_id}")
        telegram_api_call("sendMessage", {
            "chat_id": chat_id,
            "text": "⛔ Access Denied: You are not authorized to store files in this BUNNY CLOUD instance."
        })
        return

    # Check for document / photo / video / audio
    doc = msg.get("document") or msg.get("audio") or msg.get("video")
    photos = msg.get("photo")

    if not doc and not photos and msg.get("text") == "/start":
        telegram_api_call("sendMessage", {
            "chat_id": chat_id,
            "text": "👋 Welcome to **BUNNY CLOUD** Telegram Bot!\n\nSend any file, document, code, firmware, or photo here and choose a destination folder to store it on your Moto G3 server."
        })
        return

    if not doc and not photos:
        telegram_api_call("sendMessage", {
            "chat_id": chat_id,
            "text": "Send me a file, document, firmware, or photo to save to BUNNY CLOUD."
        })
        return

    file_id = None
    file_name = "received_file"
    file_size = 0

    if doc:
        file_id = doc.get("file_id")
        file_name = doc.get("file_name", "document.bin")
        file_size = doc.get("file_size", 0)
    elif photos:
        largest_photo = photos[-1]
        file_id = largest_photo.get("file_id")
        file_name = f"photo_{msg['message_id']}.jpg"
        file_size = largest_photo.get("file_size", 0)

    pending_files[msg["message_id"]] = {
        "file_id": file_id,
        "file_name": file_name,
        "file_size": file_size,
        "chat_id": chat_id,
        "telegram_message_id": msg["message_id"]
    }

    size_mb = round(file_size / (1024 * 1024), 2) if file_size else 0

    telegram_api_call("sendMessage", {
        "chat_id": chat_id,
        "text": f"📁 **BUNNY CLOUD Ingestion**\n\nFile: `{file_name}`\nSize: {size_mb} MB\n\nWhere should I save this?",
        "parse_mode": "Markdown",
        "reply_markup": get_folder_keyboard(),
        "reply_to_message_id": msg["message_id"]
    })

def process_callback_query(cq: dict):
    cq_id = cq["id"]
    callback_data = cq.get("data", "")
    msg = cq.get("message", {})
    chat_id = msg.get("chat", {}).get("id")
    reply_to = msg.get("reply_to_message", {}).get("message_id") or msg.get("message_id")

    if not callback_data.startswith("save:"):
        return

    folder = callback_data.split("save:", 1)[1]
    pending = pending_files.get(reply_to)

    if not pending:
        # Check if we stored message_id
        for k, v in list(pending_files.items()):
            if v["chat_id"] == chat_id:
                pending = v
                break

    if not pending:
        telegram_api_call("answerCallbackQuery", {
            "callback_query_id": cq_id,
            "text": "Session expired or file info missing.",
            "show_alert": True
        })
        return

    telegram_api_call("answerCallbackQuery", {
        "callback_query_id": cq_id,
        "text": f"Downloading & saving to {folder}..."
    })

    file_bytes = download_telegram_file(pending["file_id"])
    if not file_bytes:
        telegram_api_call("sendMessage", {
            "chat_id": chat_id,
            "text": f"❌ Failed to download `{pending['file_name']}` from Telegram server.",
            "parse_mode": "Markdown"
        })
        return

    saved_record = storage.save_file(
        filename=pending["file_name"],
        folder_path=folder,
        file_bytes=file_bytes,
        source="telegram",
        telegram_msg_id=pending["telegram_message_id"]
    )

    size_mb = round(saved_record["size_bytes"] / (1024 * 1024), 2)
    sha256_short = saved_record["checksum_sha256"][:12] + "..."

    telegram_api_call("editMessageText", {
        "chat_id": chat_id,
        "message_id": msg["message_id"],
        "text": f"✓ **Saved**\n\n`{saved_record['relative_path']}`\n\n• Size: {size_mb} MB\n• SHA-256: `{sha256_short}`\n• Storage: Moto G3",
        "parse_mode": "Markdown"
    })

    if reply_to in pending_files:
        del pending_files[reply_to]

def run_bot():
    database.init_db()
    storage.init_storage_structure()

    if not BOT_TOKEN:
        print("[Telegram Bot] Error: TELEGRAM_BOT_TOKEN environment variable is missing.")
        sys.exit(1)

    print("[Telegram Bot] Bot service started. Polling updates...")
    offset = 0

    while True:
        try:
            res = telegram_api_call("getUpdates", {"offset": offset, "timeout": 20})
            if res and res.get("ok"):
                for update in res["result"]:
                    offset = update["update_id"] + 1
                    if "message" in update:
                        process_message(update["message"])
                    elif "callback_query" in update:
                        process_callback_query(update["callback_query"])
            time.sleep(POLL_INTERVAL)
        except KeyboardInterrupt:
            print("[Telegram Bot] Bot stopped.")
            break
        except Exception as e:
            print(f"[Telegram Bot Error] Loop exception: {e}")
            time.sleep(5)

if __name__ == "__main__":
    run_bot()
