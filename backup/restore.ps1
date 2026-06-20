# InfraStack Restore Script
# Restauration PostgreSQL + Redis depuis les backups

param(
    [Parameter(Mandatory=$true)]
    [string]$PgDumpFile,
    
    [Parameter(Mandatory=$true)]
    [string]$RedisDumpFile
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir/.."

Write-Host "[WARNING] This will OVERWRITE current data!" -ForegroundColor Yellow
Write-Host "  PostgreSQL restore from: $PgDumpFile"
Write-Host "  Redis restore from: $RedisDumpFile"
$Confirm = Read-Host "Are you sure? (yes/no)"

if ($Confirm -ne "yes") {
    Write-Host "Aborted." -ForegroundColor Yellow
    exit 0
}

# Restore PostgreSQL
Write-Host "[INFO] Restoring PostgreSQL..." -ForegroundColor Cyan

try {
    # Drop and recreate database
    docker exec -i infrastack-postgres psql -U postgres -c "DROP DATABASE IF EXISTS infrastack;" 2>&1 | Out-Null
    docker exec -i infrastack-postgres psql -U postgres -c "CREATE DATABASE infrastack;" 2>&1 | Out-Null
    
    # Restore from dump
    Get-Content $PgDumpFile | docker exec -i infrastack-postgres psql -U postgres -d infrastack 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL restore failed"
    }
    Write-Host "[OK] PostgreSQL restored" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] PostgreSQL restore failed: $_" -ForegroundColor Red
    exit 1
}

# Restore Redis
Write-Host "[INFO] Restoring Redis..." -ForegroundColor Cyan

try {
    # Stop Redis temporarily
    docker exec infrastack-redis redis-cli SHUTDOWN NOSAVE 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    
    # Copy dump file
    docker cp $RedisDumpFile infrastack-redis:/data/dump.rdb 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Redis dump copy failed"
    }
    
    # Restart Redis
    docker compose up -d redis 2>&1 | Out-Null
    Start-Sleep -Seconds 3
    
    Write-Host "[OK] Redis restored" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Redis restore failed: $_" -ForegroundColor Red
    # Try to restart Redis anyway
    docker compose up -d redis 2>&1 | Out-Null
    exit 1
}

Write-Host "[OK] Restore completed successfully" -ForegroundColor Green