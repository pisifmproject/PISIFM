# Stop Project Script
# File: stop-project.ps1

Write-Host "================================" -ForegroundColor Red
Write-Host "  Stopping React Project        " -ForegroundColor Red
Write-Host "================================" -ForegroundColor Red
Write-Host ""

# Stop Nginx
Write-Host "[*] Stopping Nginx..." -ForegroundColor Yellow
Set-Location "C:\nginx"
.\nginx.exe -s quit
Start-Sleep -Seconds 2

$nginxProcess = Get-Process nginx -ErrorAction SilentlyContinue
if (!$nginxProcess) {
    Write-Host "[OK] Nginx stopped successfully" -ForegroundColor Green
} else {
    Write-Host "[!] Force killing Nginx processes..." -ForegroundColor Yellow
    taskkill /F /IM nginx.exe
    Write-Host "[OK] Nginx processes terminated" -ForegroundColor Green
}

Write-Host ""

# Find and stop Node.js backend process on port 5000
Write-Host "[*] Stopping backend server..." -ForegroundColor Yellow
$backendPID = netstat -ano | findstr ":5000" | findstr "LISTENING" | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -First 1

if ($backendPID) {
    taskkill /PID $backendPID /F
    Write-Host "[OK] Backend server stopped (PID: $backendPID)" -ForegroundColor Green
} else {
    Write-Host "[OK] Backend server was not running" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  All services stopped!         " -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
