@echo off
REM Clean Next.js cache and reinstall dependencies
REM Run this in the frontend directory when experiencing build issues

echo Cleaning Next.js build artifacts...
if exist ".next" rmdir /s /q .next
if exist "node_modules\.next" rmdir /s /q node_modules\.next

echo Cleaning TypeScript cache...
if exist ".tsbuildinfo" del .tsbuildinfo

echo Reinstalling dependencies...
call npm install

echo.
echo ✅ Cleanup complete! You can now run: npm run dev
echo.
pause
