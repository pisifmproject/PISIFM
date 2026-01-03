# Setup After Pull - Install dependencies and deploy
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Setup After Pull" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot
if (-not $rootPath) {
    $rootPath = Get-Location
}

# 1. Install Frontend Dependencies
Write-Host "[1/3] Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location "$rootPath\pisifmfe\frontend"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "X Frontend npm install failed" -ForegroundColor Red
    Set-Location $rootPath
    exit 1
}
Write-Host ""

# 2. Install Backend Dependencies
Write-Host "[2/3] Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location "$rootPath\pisifmbe"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "X Backend npm install failed" -ForegroundColor Red
    Set-Location $rootPath
    exit 1
}
Write-Host ""

# 3. Run Deploy Script
Write-Host "[3/3] Running Deploy Script..." -ForegroundColor Yellow
Set-Location $rootPath
& "$rootPath\deploy.ps1"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
