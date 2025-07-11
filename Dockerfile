FROM python:3.11-slim

# Устанавливаем переменные окружения
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Копируем requirements.txt
COPY requirements.txt /app/

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем проект
COPY . /app/

# Создаем директорию для статических файлов
RUN mkdir -p /app/staticfiles

# Устанавливаем права на выполнение для скриптов
RUN chmod +x /app/entrypoint.sh

# Экспонируем порт
EXPOSE 8000

# Запуск приложения
ENTRYPOINT ["/app/entrypoint.sh"]