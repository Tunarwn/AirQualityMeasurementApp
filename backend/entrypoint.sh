echo "📦 Migrating database..."
python manage.py migrate

echo "👤 Creating superuser if not exists..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='tturna').exists():
    User.objects.create_superuser('tturna', '', 'sifre123')
EOF

echo "🚀 Starting server..."
exec "$@"
