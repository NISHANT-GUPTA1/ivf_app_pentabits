# Backend Startup Script with Port Conflict Resolution

$PORT = 8000
$BackendDir = "c:\Pentabits\ivf_app_pentabits\backend"

Write-Host "EMBRYA Backend Startup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check if port is already in use
Write-Host ""
Write-Host "Checking port $PORT..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "Port $PORT is already in use!" -ForegroundColor Yellow
    $process = Get-Process -Id $portInUse.OwningProcess -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "Process: $($process.Name) (PID: $($process.Id))" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Kill existing process and restart? (Y/N): " -ForegroundColor Yellow -NoNewline
        $response = Read-Host
        
        if ($response -eq 'Y' -or $response -eq 'y') {
            Write-Host "Stopping process..." -ForegroundColor Gray
            Stop-Process -Id $portInUse.OwningProcess -Force
            Start-Sleep -Seconds 2
            Write-Host "Process stopped" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "Cancelled. Backend is already running at http://localhost:$PORT" -ForegroundColor Red
            exit 0
        }
    }
}

# Change to backend directory
Set-Location $BackendDir

# Start the server
Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "URL: http://localhost:$PORT" -ForegroundColor Cyan
Write-Host "Docs: http://localhost:$PORT/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Yellow
Write-Host "  admin / admin123" -ForegroundColor Gray
Write-Host "  embryologist / embryo123" -ForegroundColor Gray
Write-Host "  auditor / audit123" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

uvicorn main:app --host 0.0.0.0 --port $PORT
