#!/usr/bin/env python3
"""
Генератор SECRET_KEY для Django
"""
import secrets
import string

def generate_secret_key(length=50):
    """Генерирует безопасный SECRET_KEY для Django"""
    # Символы для генерации ключа
    alphabet = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
    
    # Генерируем случайный ключ
    secret_key = ''.join(secrets.choice(alphabet) for _ in range(length))
    
    return secret_key

if __name__ == "__main__":
    print("🔑 Новый SECRET_KEY для Django:")
    print(f"SECRET_KEY={generate_secret_key()}")
    print("\n💡 Скопируйте этот ключ в переменные окружения Render!")
    print("⚠️  Никогда не делитесь этим ключом публично!")
