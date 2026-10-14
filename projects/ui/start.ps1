# Runs the component workshop with hot reload on http://127.0.0.1:5180
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    if (-not (Test-Path node_modules)) { npm install }
    Write-Host 'UI workshop: http://127.0.0.1:5180' -ForegroundColor Green
    npm run dev
} finally { Pop-Location }
