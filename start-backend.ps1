# Quick Test Script - Run backend locally (Windows)

Write-Host "🚀 Starting EMBRYA Backend..." -ForegroundColor Green
Write-Host ""

Set-Location backend

# Check if virtual environment exists
if (-Not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Run the server
Write-Host "✅ Starting server on http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Test credentials:" -ForegroundColor Cyan
Write-Host "   Admin: admin / admin123"
Write-Host "   Embryologist: embryologist / embryo123"
Write-Host "   Auditor: auditor / audit123"
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
