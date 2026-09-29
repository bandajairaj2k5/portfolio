#!/usr/bin/env bash

echo "=========================================="
echo "  🔒 BUNNY CLOUD - Moto G3 Setup & Launch"
echo "=========================================="

# Grant storage permissions if needed
if [ -d "$HOME/storage" ]; then
    echo "✓ Termux storage already granted."
else
    echo "Requesting Termux storage permissions..."
    termux-setup-storage
fi

# Ensure Python is installed
if ! command -v python &> /dev/null; then
    echo "Installing Python..."
    pkg update && pkg install -y python
fi

# Set storage root to internal storage or Termux home
export BUNNY_STORAGE_ROOT="${BUNNY_STORAGE_ROOT:-$HOME/storage/shared/BUNNY_CLOUD}"
mkdir -p "$BUNNY_STORAGE_ROOT"

echo "Storage root set to: $BUNNY_STORAGE_ROOT"

# Initialize database and storage
python server/database.py
python server/storage.py

echo "Starting BUNNY CLOUD API Server on port 8082..."
python server/app.py &
APP_PID=$!

echo "Server started with PID: $APP_PID"

if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
    echo "Starting Telegram Bot Service..."
    python server/telegram_bot.py &
    BOT_PID=$!
    echo "Telegram Bot started with PID: $BOT_PID"
else
    echo "Notice: TELEGRAM_BOT_TOKEN is not set in environment or .env. Telegram ingestion is paused."
fi

echo "=========================================="
echo "✓ BUNNY CLOUD is running on your Moto G3!"
echo "  Server URL: http://localhost:8082"
echo "=========================================="

wait $APP_PID
