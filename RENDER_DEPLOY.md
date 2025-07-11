# 🚀 Деплой Django TODO Manager на Render

## 📋 Предва```
DEBUG=0
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
DATABASE_URL=postgresql://todo_user:WONidQuWC3YGSTwfC7aFi2TrGeJNYRvs@dpg-d1odl4vfte5s73b6ngp0-a.oregon-postgres.render.com/todo_manager_db_zgdn
ALLOWED_HOSTS=your-app-name.onrender.com
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=your-admin-password
```

**Важно**: 
- `DATABASE_URL` - уже указан URL вашей реальной БД
- `SECRET_KEY` - сгенерируйте новый длинный ключ (можно использовать: https://djecrety.ir/)
- `ALLOWED_HOSTS` - замените на ваше имя приложенияования

1. **GitHub аккаунт** с репозиторием проекта
2. **Render аккаунт** (бесплатный на render.com)
3. **Git** установлен локально

## 🔧 Подготовка к деплою

### 1. Убедитесь, что все файлы готовы:
- ✅ `Procfile` - команда запуска
- ✅ `render.yaml` - конфигурация сервиса
- ✅ `runtime.txt` - версия Python
- ✅ `build.sh` - скрипт сборки
- ✅ `requirements.txt` - зависимости Python
- ✅ `.gitattributes` - настройки Git

### 2. Загрузите код в GitHub:
```bash
git add .
git commit -m "Готов к деплою на Render"
git push origin main
```

## 🌐 Деплой на Render

### Шаг 1: Создание PostgreSQL базы данных

1. Войдите в [Render Dashboard](https://dashboard.render.com)
2. Нажмите **"New +"** → **"PostgreSQL"**
3. Заполните данные:
   - **Name**: `django-todo-manager-db`
   - **Database**: `todo_manager_db`
   - **User**: `todo_user`
   - **Region**: выберите ближайший регион
   - **Plan**: Free (или Starter для production)
4. Нажмите **"Create Database"**
5. **Сохраните External Database URL** - он понадобится!

### Шаг 2: Создание Web Service

1. Нажмите **"New +"** → **"Web Service"**
2. Выберите **"Build and deploy from a Git repository"**
3. Подключите ваш GitHub репозиторий
4. Заполните данные:
   - **Name**: `django-todo-manager`
   - **Region**: тот же, что и для БД
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `cd todo_manager && gunicorn todo_manager.wsgi:application --bind 0.0.0.0:$PORT`

### Шаг 3: Настройка переменных окружения

В разделе **Environment Variables** добавьте:

```
DEBUG=0
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
DATABASE_URL=postgresql://todo_user:WONidQuWC3YGSTwfC7aFi2TrGeJNYRvs@dpg-d1odl4vfte5s73b6ngp0-a.oregon-postgres.render.com/todo_manager_db_zgdn
ALLOWED_HOSTS=your-app-name.onrender.com
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=your-admin-password
```

**Важно**: 
- `DATABASE_URL` - скопируйте из созданной БД
- `SECRET_KEY` - сгенерируйте новый длинный ключ (можно использовать: https://djecrety.ir/)
- `ALLOWED_HOSTS` - замените на ваше имя приложения

### Шаг 4: Деплой

1. Нажмите **"Create Web Service"**
2. Дождитесь завершения сборки (5-10 минут)
3. Откройте ваше приложение по ссылке

## 🔧 Альтернативный способ (через render.yaml)

Если у вас есть файл `render.yaml`, можно использовать автоматический деплой:

1. Войдите в Render Dashboard
2. Нажмите **"New +"** → **"Blueprint"**
3. Подключите GitHub репозиторий
4. Render автоматически настроит сервисы согласно `render.yaml`

## ✅ Проверка деплоя

После успешного деплоя:

1. **Откройте приложение** по предоставленной ссылке
2. **Проверьте регистрацию** нового пользователя
3. **Войдите в админку** `/admin/` с учетными данными суперпользователя
4. **Создайте тестовую задачу** для проверки функционала

## 🐛 Устранение проблем

### Частые ошибки:

1. **Build failed**: проверьте `requirements.txt` и `build.sh`
2. **Database connection**: убедитесь в правильности `DATABASE_URL`
3. **Static files 404**: проверьте настройки `STATIC_ROOT` в settings.py
4. **SECRET_KEY error**: убедитесь, что переменная установлена
5. **psycopg2 module error**: используйте Python 3.11.5 и psycopg2-binary==2.9.9
6. **Module import errors**: убедитесь что все зависимости в requirements.txt

### Логи деплоя:
- Во время сборки смотрите логи в реальном времени
- После деплоя логи доступны в разделе "Events"

## 📱 Дополнительные настройки

### Custom Domain:
1. В настройках сервиса перейдите в "Settings"
2. В разделе "Custom Domains" добавьте ваш домен
3. Настройте DNS записи согласно инструкции

### Автоматические деплои:
- Render автоматически деплоит при push в main ветку
- Можно настроить деплой из других веток

## 🎉 Готово!

Ваш Django TODO Manager теперь доступен в интернете!

**URL вашего приложения**: `https://your-app-name.onrender.com`

### Учетные данные по умолчанию:
- **Логин**: admin
- **Пароль**: admin123 (измените в production!)

---

💡 **Совет**: После первого деплоя смените пароль администратора через админку Django!
