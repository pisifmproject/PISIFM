# Quick Start Script - React Project with Nginx
# File: start-project.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Starting React Project Setup  " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Nginx is running
$nginxProcess = Get-Process nginx -ErrorAction SilentlyContinue

if ($nginxProcess) {
    Write-Host "[OK] Nginx is running (PID: $($nginxProcess.Id -join ', '))" -ForegroundColor Green
} else {
    Write-Host "[!] Nginx is not running. Starting Nginx..." -ForegroundColor Yellow
    Set-Location "C:\nginx"
    Start-Process "nginx.exe" -WindowStyle Hidden
    Start-Sleep -Seconds 2
    $nginxProcess = Get-Process nginx -ErrorAction SilentlyContinue
    if ($nginxProcess) {
        Write-Host "[OK] Nginx started successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to start Nginx" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Check if backend is running on port 5000
$backendPort = netstat -ano | findstr ":5000" | findstr "LISTENING"

if ($backendPort) {
    Write-Host "[OK] Backend server is running on port 5000" -ForegroundColor Green
} else {
    Write-Host "[!] Backend server is not running on port 5000" -ForegroundColor Yellow
    Write-Host "    Starting backend server..." -ForegroundColor Yellow
    Set-Location "D:\Githhub Project\server"
    Start-Process "cmd.exe" -ArgumentList "/c node index.js" -WindowStyle Normal
    Write-Host "[OK] Backend server started in new window" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  URLs to Access:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Frontend:  http://localhost:8080" -ForegroundColor Green
Write-Host "API:       http://localhost:8080/api/health" -ForegroundColor Green
Write-Host "Backend:   http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to open frontend in browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:8080"
