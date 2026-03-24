#!/bin/bash
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Flask backend..."
cd "$ROOT/backend" && ./venv/bin/python app.py &
BACKEND_PID=$!

echo "Starting Vite frontend..."
cd "$ROOT" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Backend running on http://localhost:5000"
echo "✅ Frontend running on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
