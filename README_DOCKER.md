# 🚀 Django TODO Manager

Современное веб-приложение для управления задачами с поддержкой категорий, приоритетов и темной темы.

## ✨ Возможности

- **Система аутентификации** - регистрация, вход, выход
- **Персональные задачи** - каждый пользователь видит только свои задачи
- **Категории и приоритеты** для организации задач
- **Фильтрация и сортировка** задач
- **Темная/светлая тема**
- **AJAX интерфейс** для быстрого взаимодействия
- **Адаптивный дизайн** Bootstrap 5
- **Статистика и прогресс** выполнения

## 🐳 Запуск с Docker

### Локальная разработка

```bash
# Клонируем репозиторий
git clone <repository-url>
cd django-todo-manager

# Запуск для разработки (SQLite)
docker-compose -f docker-compose.dev.yml up --build

# Приложение будет доступно на http://localhost:8000
```

### Продакшн (с PostgreSQL и Nginx)

```bash
# Запуск полного стека
docker-compose up --build

# Запуск в фоновом режиме
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f web

# Остановка
docker-compose down
```

### Полезные команды Docker

```bash
# Проверить запущенные контейнеры
docker-compose ps

# Зайти в контейнер Django
docker-compose exec web bash

# Выполнить миграции
docker-compose exec web python todo_manager/manage.py migrate

# Создать суперпользователя
docker-compose exec web python todo_manager/manage.py createsuperuser

# Собрать статические файлы
docker-compose exec web python todo_manager/manage.py collectstatic
```

## 🛠️ Локальная установка (без Docker)

```bash
# Создаем виртуальное окружение
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# или
.venv\Scripts\activate  # Windows

# Устанавливаем зависимости
pip install -r requirements.txt

# Переходим в папку проекта
cd todo_manager

# Применяем миграции
python manage.py migrate

# Создаем суперпользователя
python manage.py createsuperuser

# Собираем статические файлы
python manage.py collectstatic

# Запускаем сервер
python manage.py runserver
```

## 🌍 Деплой на Render

1. Создайте новый Web Service на Render
2. Подключите ваш GitHub репозиторий
3. Установите следующие настройки:
   - **Build Command**: `./build.sh`
   - **Start Command**: `cd todo_manager && gunicorn todo_manager.wsgi:application`
   - **Environment**: Python 3

4. Добавьте переменные окружения:
   ```
   DJANGO_SECRET_KEY=your-very-secret-key-here
   DEBUG=0
   DATABASE_URL=postgresql://user:password@host:port/database
   ALLOWED_HOSTS=your-app-name.onrender.com
   ```

## 📂 Структура проекта

```
django-todo-manager/
├── todo_manager/           # Django проект
│   ├── todo_manager/      # Настройки проекта
│   ├── todo_list/         # Основное приложение
│   ├── templates/         # HTML шаблоны
│   ├── static/           # Статические файлы
│   └── manage.py
├── Dockerfile            # Docker образ
├── docker-compose.yml    # Продакшн конфигурация
├── docker-compose.dev.yml # Конфигурация для разработки
├── requirements.txt      # Python зависимости
├── entrypoint.sh        # Скрипт запуска
├── nginx.conf           # Конфигурация Nginx
├── build.sh            # Скрипт сборки для Render
└── .env                # Переменные окружения
```

## 🔧 Переменные окружения

Создайте файл `.env` со следующими переменными:

```env
DJANGO_SECRET_KEY=your-very-secret-key-here
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
DATABASE_URL=sqlite:///db.sqlite3
```

Для продакшена:
```env
DJANGO_SECRET_KEY=very-long-random-secret-key
DEBUG=0
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://user:password@host:port/database
```

## 👤 Пользователи по умолчанию

После запуска с Docker автоматически создается суперпользователь:
- **Username**: admin
- **Email**: admin@example.com
- **Password**: admin123

## 🛠️ Технологии

- **Backend**: Django 5.2.3
- **Database**: PostgreSQL / SQLite
- **Frontend**: Bootstrap 5, JavaScript (ES6+)
- **Server**: Gunicorn + Nginx
- **Deployment**: Docker, Render
- **Styles**: Custom CSS with animations

## 📝 API Endpoints

- `/` - Главная страница
- `/todo/` - Список задач
- `/todo/register/` - Регистрация
- `/todo/login/` - Вход
- `/todo/logout/` - Выход
- `/todo/categories/` - Управление категориями
- `/admin/` - Админ панель Django

## 🤝 Разработка

Для разработки используйте `docker-compose.dev.yml`:

```bash
# Запуск в режиме разработки
docker-compose -f docker-compose.dev.yml up

# Применение изменений в коде происходит автоматически
```

## 📄 Лицензия

MIT License
