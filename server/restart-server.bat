@echo off
echo Stopping server (if running)...
taskkill /F /IM node.exe 2>nul

echo.
echo Regenerating Prisma Client...
cd /d "%~dp0"
call npx prisma generate

echo.
echo Starting server...
call npm run dev

pause
