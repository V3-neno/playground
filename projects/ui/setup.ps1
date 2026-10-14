# One-time setup: install the workshop's npm dependencies.
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    npm install
    Write-Host "`nDone. Run ./start.ps1 (or double-click start.cmd)" -ForegroundColor Green
} finally { Pop-Location }
