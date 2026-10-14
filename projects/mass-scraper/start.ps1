# Default: serve the built UI and API on http://127.0.0.1:8787
# -Dev:    API on 8787 + Vite hot-reload UI on http://127.0.0.1:5173
param([switch]$Dev)
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    if ($Dev) {
        $api = Start-Process -PassThru -NoNewWindow backend/.venv/Scripts/python -ArgumentList 'app.py' -WorkingDirectory backend
        Write-Host 'UI (dev): http://127.0.0.1:5173' -ForegroundColor Green
        try { Push-Location frontend; npm run dev } finally { Pop-Location; Stop-Process $api.Id -ErrorAction SilentlyContinue }
    } else {
        if (-not (Test-Path frontend/dist)) { Push-Location frontend; npm run build; Pop-Location }
        Write-Host 'Open http://127.0.0.1:8787' -ForegroundColor Green
        backend/.venv/Scripts/python backend/app.py
    }
} finally { Pop-Location }
