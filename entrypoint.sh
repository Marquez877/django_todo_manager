#!/bin/bash
set -e

echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

echo "Working directory: $(pwd)"
echo "Contents: $(ls -la)"

# Переходим в директорию с manage.py
cd todo_manager
echo "Changed to directory: $(pwd)"
echo "Contents: $(ls -la)"

# Выполняем миграции
echo "Running migrations..."
python manage.py migrate --noinput

# Собираем статические файлы
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Создаем суперпользователя если его нет
echo "Creating superuser if not exists..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
" || echo "Superuser creation skipped"

echo "Starting application..."
exec "$@"