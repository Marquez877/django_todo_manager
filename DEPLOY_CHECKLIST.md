# ✅ Чеклист для деплоя на Render

## Перед деплоем убедитесь:

### 📁 Файлы проекта
- [ ] `Procfile` создан
- [ ] `render.yaml` создан  
- [ ] `runtime.txt` создан
- [ ] `build.sh` обновлен
- [ ] `requirements.txt` актуальный
- [ ] `.gitignore` настроен
- [ ] `settings.py` настроен для production

### 🔧 Локальное тестирование
- [ ] Docker dev версия запускается
- [ ] Docker production версия запускается
- [ ] Миграции применяются без ошибок
- [ ] Статические файлы собираются
- [ ] Суперпользователь создается
- [ ] SECRET_KEY сгенерирован (`python generate_secret_key.py`)
- [ ] Python версия 3.11.5 в runtime.txt

### 📤 GitHub
- [ ] Код залит в GitHub репозиторий
- [ ] Все изменения зафиксированы
- [ ] Ветка main актуальная

### 🌐 Render настройка
- [ ] PostgreSQL база данных создана
- [ ] Environment Variables настроены:
  - [ ] `DEBUG=0`
  - [ ] `SECRET_KEY=...`
  - [ ] `DATABASE_URL=...`
  - [ ] `ALLOWED_HOSTS=...`
  - [ ] `DJANGO_SUPERUSER_USERNAME=admin`
  - [ ] `DJANGO_SUPERUSER_EMAIL=...`
  - [ ] `DJANGO_SUPERUSER_PASSWORD=...`

### 🚀 Деплой
- [ ] Web Service создан
- [ ] Build Command: `./build.sh`
- [ ] Start Command: `cd todo_manager && gunicorn todo_manager.wsgi:application --bind 0.0.0.0:$PORT`
- [ ] Сборка прошла успешно
- [ ] Приложение доступно по URL

### ✔️ Проверка после деплоя
- [ ] Главная страница загружается
- [ ] Регистрация работает
- [ ] Авторизация работает
- [ ] CRUD задач функционирует
- [ ] Админка доступна
- [ ] Статические файлы отображаются

## 🎯 Команды для быстрого старта:

```bash
# 0. Генерация SECRET_KEY
python generate_secret_key.py

# 1. Финальный commit
git add .
git commit -m "Ready for Render deployment"
git push origin main

# 2. Локальная проверка
docker-compose -f docker-compose.dev.yml up --build

# 3. После деплоя - проверка
curl https://your-app.onrender.com
```

## 📞 Если что-то не работает:
1. Проверьте логи в Render Dashboard
2. Убедитесь в правильности переменных окружения
3. Проверьте DATABASE_URL
4. Убедитесь, что все файлы закоммичены в Git
