#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Navigate to Django project directory
cd todo_manager

# Collect static files
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate
