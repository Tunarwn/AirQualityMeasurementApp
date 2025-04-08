#!/bin/sh

# Beklenecek servis ismi ve portu (db:5432)
host="$POSTGRES_HOST"
port="$POSTGRES_PORT"

echo "⏳ Waiting for PostgreSQL at $host:$port..."

while ! nc -z $host $port; do
  sleep 1
done

echo "✅ PostgreSQL is up! Starting Django..."
exec "$@"
