# PEAK Development Server Starter
# Menjalankan Frontend dan Backend sekaligus

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  PEAK Development Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot

# Start Backend
Write-Host "[1/2] Starting Backend Server..." -ForegroundColor Yellow
$backendPath = Join-Path $rootPath "server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal
Write-Host "      Backend starting on http://localhost:5001" -ForegroundColor Green

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "[2/2] Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath'; npm run dev" -WindowStyle Normal
Write-Host "      Frontend starting on http://localhost:5173" -ForegroundColor Green

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Servers Started!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "Tekan Enter untuk buka browser..." -ForegroundColor Gray
Read-Host
Start-Process "http://localhost:5173"
