#!/usr/bin/env pwsh
# Check Backend Status

$PORT = 8000

Write-Host "🔍 Backend Status Check" -ForegroundColor Cyan
Write-Host "=" * 50

# Check if port is listening
$portInUse = Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue

if ($portInUse) {
    $process = Get-Process -Id $portInUse.OwningProcess -ErrorAction SilentlyContinue
    Write-Host "`n✅ Backend is RUNNING" -ForegroundColor Green
    Write-Host "   URL: http://localhost:$PORT" -ForegroundColor Cyan
    Write-Host "   Process: $($process.Name) (PID: $($process.Id))" -ForegroundColor Gray
    
    Write-Host "`n🧪 Testing endpoints..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$PORT/" -Method Get -TimeoutSec 3
        Write-Host "   ✅ Root (/) - Status: $($response.status)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Root (/) - Failed" -ForegroundColor Red
    }
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$PORT/health" -Method Get -TimeoutSec 3
        Write-Host "   ✅ Health - Models: $($response.models_loaded)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Health - Failed" -ForegroundColor Red
    }
    
    Write-Host "`n💡 To stop: Get-Process -Id $($process.Id) | Stop-Process" -ForegroundColor Yellow
    
} else {
    Write-Host "`n❌ Backend is NOT RUNNING" -ForegroundColor Red
    Write-Host "   Port $PORT is not in use" -ForegroundColor Gray
    Write-Host "`n💡 To start: .\start.ps1" -ForegroundColor Yellow
}

Write-Host "`n" + "=" * 50
