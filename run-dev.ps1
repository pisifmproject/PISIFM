# PISIFM Development Server Starter
# Menjalankan Frontend dan Backend sekaligus

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  PISIFM Development Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot

# Get local IP address
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet" | Select-Object -First 1).IPAddress
if (-not $ipAddress) {
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "169.254.*" -and $_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1).IPAddress
}

Write-Host "Detected IP Address: $ipAddress" -ForegroundColor Magenta
Write-Host ""

# Start Backend
Write-Host "[1/2] Starting Backend Server..." -ForegroundColor Yellow
$backendPath = Join-Path $rootPath "server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal
Write-Host "      Backend starting on http://localhost:3026" -ForegroundColor Green

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath'; npm run dev" -WindowStyle Normal
Write-Host "      Frontend starting on http://0.0.0.0:5173" -ForegroundColor Green

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Servers Started!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Local Access:" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "  Backend:  http://localhost:3026" -ForegroundColor Gray
Write-Host ""
Write-Host "Network Access (dari laptop lain):" -ForegroundColor Yellow
Write-Host "  Frontend: http://$ipAddress`:5173" -ForegroundColor Cyan -BackgroundColor DarkBlue
Write-Host "  Backend:  http://$ipAddress`:3026" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tekan Enter untuk buka browser..." -ForegroundColor Gray
Read-Host
Start-Process "http://localhost:5173"
