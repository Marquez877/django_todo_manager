#!/usr/bin/env python3
"""
Скрипт для конвертации окончаний строк в Unix формат (LF)
"""
import os

def fix_line_endings(filepath):
    """Конвертирует CRLF в LF"""
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
        
        # Заменяем CRLF на LF
        content = content.replace(b'\r\n', b'\n')
        
        with open(filepath, 'wb') as f:
            f.write(content)
        
        print(f"✓ Fixed line endings in {filepath}")
        return True
    except Exception as e:
        print(f"✗ Error fixing {filepath}: {e}")
        return False

def main():
    """Основная функция"""
    files_to_fix = [
        'entrypoint.sh',
        'Dockerfile',
        'docker-compose.yml',
        'docker-compose.dev.yml',
        'nginx.conf',
        '.env',
        'build.sh'
    ]
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    for filename in files_to_fix:
        filepath = os.path.join(current_dir, filename)
        if os.path.exists(filepath):
            fix_line_endings(filepath)
        else:
            print(f"⚠ File not found: {filepath}")

if __name__ == "__main__":
    main()
