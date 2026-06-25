#!/bin/sh
set -e

export PYTHONPATH="/usr/lib/python3.12/site-packages:/app:/usr/local/lib/python3.12/site-packages:${PYTHONPATH:-}"

echo "Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

echo "Starting uvicorn..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level info 2>&1 | tee /tmp/uvicorn.log &
UVICORN_PID=$!

sleep 3

if ! kill -0 $UVICORN_PID 2>/dev/null; then
    echo "Uvicorn crashed. Logs:"
    cat /tmp/uvicorn.log
    exit 1
fi

echo "Both services started. Nginx PID: $NGINX_PID, Uvicorn PID: $UVICORN_PID"

wait $NGINX_PID $UVICORN_PID