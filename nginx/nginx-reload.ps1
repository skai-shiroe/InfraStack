# InfraStack Nginx Reload Script
# Recharge Nginx avec vérification de la config et rollback automatique

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path "$PSScriptRoot/.."

Write-Host "[INFO] Testing Nginx configuration..." -ForegroundColor Cyan

# Test de la configuration (stderr redirigé vers stdout, on filtre les warnings)
$TestOutput = docker exec infrastack-nginx nginx -t 2>&1 | Out-String
$HasError = $TestOutput -match "test failed|emerg|alert|crit"

if ($HasError) {
    Write-Host "[ERROR] Nginx configuration test failed:" -ForegroundColor Red
    Write-Host $TestOutput
    exit 1
}

Write-Host "[OK] Configuration valid" -ForegroundColor Green

# Sauvegarde de la config courante
$ConfigBackup = Join-Path $ProjectRoot "nginx\nginx.conf.backup"
Copy-Item "$ProjectRoot\nginx\nginx.conf" $ConfigBackup -Force
Write-Host "[INFO] Current config backed up" -ForegroundColor Cyan

# Reload de Nginx
Write-Host "[INFO] Reloading Nginx..." -ForegroundColor Cyan
docker exec infrastack-nginx nginx -s reload 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Nginx reloaded successfully" -ForegroundColor Green
    
    # Vérification post-reload
    Start-Sleep -Seconds 2
    $HealthCheck = curl -sk https://localhost/health 2>&1
    if ($HealthCheck -match '"status":"healthy"') {
        Write-Host "[OK] Health check passed after reload" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "[WARNING] Health check failed after reload, rolling back..." -ForegroundColor Yellow
        Rollback-NginxConfig -BackupPath $ConfigBackup -ProjectRoot $ProjectRoot
        exit 1
    }
} else {
    Write-Host "[ERROR] Nginx reload failed, rolling back..." -ForegroundColor Red
    Rollback-NginxConfig -BackupPath $ConfigBackup -ProjectRoot $ProjectRoot
    exit 1
}

function Rollback-NginxConfig {
    param(
        [string]$BackupPath,
        [string]$ProjectRoot
    )
    
    Write-Host "[INFO] Rolling back Nginx configuration..." -ForegroundColor Yellow
    Copy-Item $BackupPath "$ProjectRoot\nginx\nginx.conf" -Force
    docker exec infrastack-nginx nginx -s reload 2>&1 | Out-Null
    Write-Host "[OK] Rollback completed" -ForegroundColor Green
}