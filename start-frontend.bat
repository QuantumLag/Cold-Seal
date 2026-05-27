@echo off
REM Clean frontend and start dev server

echo.
echo ========================================
echo PharmaTrace Frontend Dev Server Starter
echo ========================================
echo.

cd /d "VaccineLedger\frontend"

echo.
echo Cleaning previous build artifacts...
if exist ".next" rmdir /s /q .next >nul 2>&1
if exist "node_modules\.next" rmdir /s /q node_modules\.next >nul 2>&1

echo ✅ Starting Next.js dev server...
echo.
npm run dev

pause
