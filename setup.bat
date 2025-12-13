@echo off
echo ========================================
echo muktiAp Setup Script
echo ========================================
echo.

echo [1/4] Installing Frontend Dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed
    pause
    exit /b 1
)

echo.
echo [2/4] Installing Backend Dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed
    pause
    exit /b 1
)

echo.
echo [3/4] Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generation failed
    pause
    exit /b 1
)

echo.
echo [4/4] Pushing Database Schema...
call npx prisma db push
if %errorlevel% neq 0 (
    echo WARNING: Database push failed. Check your DATABASE_URL in server/.env
)

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure your .env.local file in the root directory
echo 2. Configure your server/.env file
echo 3. Run 'start-dev.bat' to start the application
echo.
pause
