#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
fi

echo "Starting Uvicorn backend on http://127.0.0.1:8000 ..."
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
