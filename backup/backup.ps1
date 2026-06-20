# InfraStack Backup Script
# Sauvegarde PostgreSQL + Redis avec rotation

param(
    [int]$KeepDays = 7
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir/.."
$BackupDir = Join-Path $ProjectRoot "backup"

# Ensure backup directory exists
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

Write-Host "[INFO] Starting backup at $Timestamp" -ForegroundColor Cyan

# PostgreSQL backup
$PgDumpFile = Join-Path $BackupDir "postgresql-$Timestamp.sql"
Write-Host "[INFO] Backing up PostgreSQL to $PgDumpFile" -ForegroundColor Cyan

try {
    docker exec -i infrastack-postgres pg_dump -U postgres infrastack > $PgDumpFile 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }
    Write-Host "[OK] PostgreSQL backup completed" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] PostgreSQL backup failed: $_" -ForegroundColor Red
    exit 1
}

# Redis backup
$RedisDumpFile = Join-Path $BackupDir "redis-$Timestamp.rdb"
Write-Host "[INFO] Backing up Redis to $RedisDumpFile" -ForegroundColor Cyan

try {
    docker exec infrastack-redis redis-cli BGSAVE 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    docker cp infrastack-redis:/data/dump.rdb $RedisDumpFile 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "redis backup copy failed"
    }
    Write-Host "[OK] Redis backup completed" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Redis backup failed: $_" -ForegroundColor Red
    exit 1
}

# Rotation (supprimer les backups plus vieux que $KeepDays jours)
Write-Host "[INFO] Rotating backups (keeping last $KeepDays days)" -ForegroundColor Cyan

$Cutoff = (Get-Date).AddDays(-$KeepDays)

Get-ChildItem -Path $BackupDir -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt $Cutoff } | Remove-Item -Force
Get-ChildItem -Path $BackupDir -Filter "*.rdb" | Where-Object { $_.LastWriteTime -lt $Cutoff } | Remove-Item -Force

Write-Host "[OK] Backup completed successfully at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green