#!/usr/bin/env python3
"""
Скрипт для тестирования работы Django приложения в Docker
"""
import requests
import json
import time

def test_app():
    """Тестирует основные функции приложения"""
    base_url = "http://localhost:8000"
    
    print("🧪 Тестирование Django TODO Manager в Docker...")
    
    try:
        # Тест 1: Главная страница
        print("\n1. Тестируем главную страницу...")
        response = requests.get(base_url, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Главная страница загружается")
            
            # Проверяем содержимое
            content = response.text.lower()
            if "django" in content and "todo" in content:
                print("   ✅ Содержимое корректное")
            else:
                print("   ⚠️ Содержимое не найдено")
        else:
            print("   ❌ Ошибка загрузки главной страницы")
            
        # Тест 2: Страница входа
        print("\n2. Тестируем страницу входа...")
        login_response = requests.get(f"{base_url}/auth/login/", timeout=10)
        print(f"   Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            print("   ✅ Страница входа доступна")
        else:
            print("   ❌ Ошибка загрузки страницы входа")
            
        # Тест 3: Статические файлы
        print("\n3. Тестируем статические файлы...")
        static_files = [
            "/static/css/custom.css",
            "/static/js/main.js",
            "/static/css/animations.css"
        ]
        
        for static_file in static_files:
            static_response = requests.get(f"{base_url}{static_file}", timeout=5)
            if static_response.status_code == 200:
                print(f"   ✅ {static_file}")
            else:
                print(f"   ❌ {static_file}")
                
        print("\n🎉 Тестирование завершено!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Не удалось подключиться к приложению")
        print("   Убедитесь, что контейнеры запущены:")
        print("   docker-compose -f docker-compose.dev.yml up -d")
    except Exception as e:
        print(f"❌ Ошибка: {e}")

if __name__ == "__main__":
    test_app()
