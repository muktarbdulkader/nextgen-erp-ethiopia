@echo off
echo ========================================
echo MuktiAP ERP System Verification
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    exit /b 1
)
echo ✓ Node.js installed
echo.

echo [2/5] Checking frontend dependencies...
cd /d "%~dp0"
if not exist "node_modules" (
    echo ERROR: Frontend dependencies not installed!
    echo Run: npm install
    exit /b 1
)
echo ✓ Frontend dependencies OK
echo.

echo [3/5] Checking backend dependencies...
if not exist "server\node_modules" (
    echo ERROR: Backend dependencies not installed!
    echo Run: cd server ^&^& npm install
    exit /b 1
)
echo ✓ Backend dependencies OK
echo.

echo [4/5] Checking environment files...
if not exist ".env.local" (
    echo WARNING: .env.local not found!
    echo Create it with: GEMINI_API_KEY and VITE_API_URL
)
if not exist "server\.env" (
    echo WARNING: server\.env not found!
    echo Create it with: DATABASE_URL, JWT_SECRET, GOOGLE_AI_API_KEY
)
echo ✓ Environment files checked
echo.

echo [5/5] Testing TypeScript compilation...
npm run build > nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Build failed! Run 'npm run build' to see errors
    exit /b 1
)
echo ✓ Build successful
echo.

echo ========================================
echo ✓ ALL CHECKS PASSED!
echo ========================================
echo.
echo To start the system:
echo   1. Start backend:  cd server ^&^& npm run dev
echo   2. Start frontend: npm run dev
echo.
echo Or use: start-dev.bat
echo.
pause
