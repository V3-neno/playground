@echo off
rem Double-click to start Mass Scraper. Close this window to stop it.
cd /d "%~dp0"
start "" cmd /c "timeout /t 4 >nul & start http://127.0.0.1:8787"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
pause