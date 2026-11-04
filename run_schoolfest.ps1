# SchoolFest Launch Script for Windows PowerShell
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
Set-Location $scriptDir

$pyExe = if (Test-Path "$scriptDir\backend_venv\Scripts\python.exe") { "$scriptDir\backend_venv\Scripts\python.exe" } else { "python" }

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  SchoolFest - School Event & Achievement Management System" -ForegroundColor Yellow
Write-Host "  Chaldean Syrian Higher Secondary School, Thrissur (Est. 1927)" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Starting Django REST Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"$pyExe`" manage.py runserver 127.0.0.1:8000" -WorkingDirectory $scriptDir

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k npm --prefix frontend run dev" -WorkingDirectory $scriptDir

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Both services have been launched!" -ForegroundColor Green
Write-Host "  Open your browser: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Demo Credentials:" -ForegroundColor White
Write-Host "    - Admin:   binu          / Binu@123" -ForegroundColor Magenta
Write-Host "    - Teacher: teacher       / Teacher@123" -ForegroundColor Blue
Write-Host "    - Parent:  parent        / Parent@123" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
