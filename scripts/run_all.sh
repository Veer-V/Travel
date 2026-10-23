#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting Backend..."
"$SCRIPT_DIR/run_backend.sh" &
BACKEND_PID=$!

sleep 3

echo "Starting Mobile Frontend..."
"$SCRIPT_DIR/run_mobile.sh" &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT SIGTERM EXIT
wait
