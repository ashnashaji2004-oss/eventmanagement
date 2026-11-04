@echo off
cd /d "%~dp0"
title SchoolFest - Chaldean Syrian Higher Secondary School
echo ======================================================================
echo   SchoolFest - School Event & Achievement Management System
echo   Chaldean Syrian Higher Secondary School, Thrissur (Est. 1927)
echo ======================================================================
echo.

if exist "backend_venv\Scripts\python.exe" (
    set "PYTHON_CMD=backend_venv\Scripts\python.exe"
) else (
    set "PYTHON_CMD=python"
)

echo [1/2] Launching Django REST API on http://127.0.0.1:8000 ...
start "SchoolFest Backend (Django)" cmd /k "%PYTHON_CMD% manage.py runserver 127.0.0.1:8000"
timeout /t 3 >nul

echo [2/2] Launching React Vite Frontend on http://localhost:5173 ...
start "SchoolFest Frontend (React)" cmd /k "npm --prefix frontend run dev"

echo.
echo ======================================================================
echo   Both services are now running!
echo   Open your browser at: http://localhost:5173
echo.
echo   One-Click Demo Access Accounts:
echo     - Admin:   Username: binu          Password: Binu@123
echo     - Teacher: Username: teacher       Password: Teacher@123
echo     - Parent:  Username: parent        Password: Parent@123
echo ======================================================================
echo.
pause
