# 🚀 Быстрый старт Django TODO Manager

## Development (разработка)
```bash
# Клонировать репозиторий
git clone <repository-url>
cd 025.django-todo-manager

# Запустить development версию
docker-compose -f docker-compose.dev.yml up --build

# Открыть в браузере
http://localhost:8000
```

## Production (продакшн)
```bash
# Запустить production версию с nginx
docker-compose up --build

# Открыть в браузере
http://localhost:80
```

## Вход в систему
- **URL**: /auth/login/
- **Логин**: admin
- **Пароль**: admin123

## Остановка
```bash
# Остановить контейнеры
docker-compose down

# Полная очистка
docker-compose down --volumes --remove-orphans
docker system prune -f
```

## Деплой на Render
1. Подключить GitHub репозиторий к Render
2. Создать PostgreSQL database 
3. Создать Web Service
4. Настроить environment variables:
   - `DEBUG=0`
   - `SECRET_KEY=your-secret-key`
   - `DATABASE_URL=postgresql://...`
   - `ALLOWED_HOSTS=your-app.onrender.com`
5. Build Command: `./build.sh`
6. Start Command: `gunicorn todo_manager.wsgi:application --bind 0.0.0.0:$PORT`

Готово! 🎉
