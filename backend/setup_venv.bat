@echo off
setlocal
cd /d "%~dp0"
echo Creating Python virtual environment...
if not exist venv py -m venv venv
if not exist venv\Scripts\python.exe (
  echo Failed to create venv. Make sure Python 3.10+ is installed and added to PATH.
  pause
  exit /b 1
)
echo Installing backend dependencies...
venv\Scripts\python.exe -m pip install --upgrade pip
venv\Scripts\python.exe -m pip install -r requirements.txt
if errorlevel 1 (
  echo Dependency installation failed.
  pause
  exit /b 1
)
echo.
echo Backend environment is ready.
echo Run start_backend.bat next.
pause
