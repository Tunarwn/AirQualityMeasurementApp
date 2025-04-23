#!/bin/sh

echo "⏳ Veritabanı bekleniyor..."

while ! nc -z db 5432; do
  sleep 1
done

echo "✅ Veritabanı hazır!"

# entrypoint.sh'i çağır ve ardından gelen komutu çalıştır (örn: runserver)
exec ./entrypoint.sh "$@"
