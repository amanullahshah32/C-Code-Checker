# C Autograder - Startup Script for Windows PowerShell
# ============================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║   🎓 C Programming Autograder                             ║" -ForegroundColor Cyan
Write-Host "║   Starting all services...                                ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check for Node.js
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found! Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check for Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Python not found! Please install Python from https://python.org/" -ForegroundColor Red
    exit 1
}

# Check for gcc
try {
    $gccVersion = gcc --version 2>&1 | Select-Object -First 1
    Write-Host "   ✅ GCC: $gccVersion" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  GCC not found! Compilation features won't work." -ForegroundColor Yellow
    Write-Host "      Install MinGW-w64 and add to PATH" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow

# Install root dependencies
Write-Host "   Installing root dependencies..."
Set-Location $scriptDir
npm install --silent 2>$null

# Install client dependencies
Write-Host "   Installing client dependencies..."
Set-Location "$scriptDir\client"
npm install --silent 2>$null

# Install server dependencies  
Write-Host "   Installing server dependencies..."
Set-Location "$scriptDir\server"
npm install --silent 2>$null

# Install Python dependencies
Write-Host "   Installing Python dependencies..."
Set-Location "$scriptDir\python"
pip install -r requirements.txt --quiet 2>$null

Write-Host "   ✅ Dependencies installed!" -ForegroundColor Green
Write-Host ""

# Return to root
Set-Location $scriptDir

Write-Host "🚀 Starting services..." -ForegroundColor Yellow
Write-Host ""

# Start Python API in new window
Write-Host "   Starting Python API (port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\python'; Write-Host '🐍 Python Grading API' -ForegroundColor Cyan; python app.py"

# Wait a moment for Python to start
Start-Sleep -Seconds 2

# Start Express server in new window
Write-Host "   Starting Express Server (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\server'; Write-Host '🟢 Express Server' -ForegroundColor Green; npm run dev"

# Wait a moment
Start-Sleep -Seconds 2

# Start React frontend in new window
Write-Host "   Starting React Frontend (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\client'; Write-Host '⚛️ React Frontend' -ForegroundColor Blue; npm run dev"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "   🌐 Open your browser and go to:" -ForegroundColor White
Write-Host "      http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "   📋 Services:" -ForegroundColor White
Write-Host "      React Frontend:  http://localhost:3000" -ForegroundColor Gray
Write-Host "      Express Server:  http://localhost:5000" -ForegroundColor Gray
Write-Host "      Python API:      http://localhost:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "   💡 To stop: Close all the terminal windows" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Open browser after a delay
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"
