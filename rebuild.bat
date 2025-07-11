@echo off
echo Stopping and removing containers...
docker-compose down -v

echo Removing images...
docker-compose down --rmi all

echo Building and starting fresh containers...
docker-compose up --build

pause
