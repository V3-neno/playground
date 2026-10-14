# One-time setup: Python venv + Scrapling browsers + frontend build.
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    Write-Host '==> Python venv + dependencies' -ForegroundColor Cyan
    if (-not (Test-Path backend/.venv)) { python -m venv backend/.venv }
    backend/.venv/Scripts/python -m pip install --upgrade pip -q
    backend/.venv/Scripts/python -m pip install -r backend/requirements.txt -q

    Write-Host '==> Browsers (Browser + Stealth modes)' -ForegroundColor Cyan
    backend/.venv/Scripts/scrapling install
    backend/.venv/Scripts/python -m patchright install chromium

    Write-Host '==> Frontend' -ForegroundColor Cyan
    Push-Location frontend
    npm install
    npm run build
    Pop-Location

    Write-Host "`nDone. Run ./start.ps1" -ForegroundColor Green
} finally { Pop-Location }
