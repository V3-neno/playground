# Mass Scraper

A localhost tool for scraping lots of URLs at once with [Scrapling](https://github.com/D4Vinci/Scrapling). It shows live progress using [thinking-orbs](https://github.com/Jakubantalik/thinking-orbs).

- Paste URLs (one per line, `#` lines are skipped, and `https://` is added when missing). Duplicates are removed.
- Choose a fetcher:
  - **HTTP** uses `FetcherSession`. It's fast, uses curl_cffi with a Chrome TLS fingerprint, and does not run JavaScript.
  - **Browser** uses `AsyncDynamicSession`, which is headless Chromium and renders JavaScript.
  - **Stealth** uses `AsyncStealthySession`, a patched browser for protected sites.
- Set the concurrency (1–64) and a per-request timeout.
- Extract fields with CSS (`.price::text`, `a::attr(href)`) or XPath (`//h1/text()`). Turn on "all" to collect every match.
- Progress streams live over SSE. Each URL in flight shows a small orb, and the large orb shows the job's phase.
- Export results as CSV or JSON. Every finished job is also saved to `data/<job-id>.json`.

## Run

**Easiest:** double-click `start.cmd`. It starts the server and opens http://127.0.0.1:8787. Close the window to stop it.

From PowerShell (in this folder):

```powershell
./setup.ps1        # first time: venv, browsers (~300 MB), frontend build
./start.ps1        # http://127.0.0.1:8787
./start.ps1 -Dev   # API on 8787 + Vite hot reload on http://127.0.0.1:5173
```

## Orb states

| Phase                         | Orb          |
| ----------------------------- | ------------ |
| Idle                          | `breathing`  |
| Opening session / browsers    | `connecting` |
| Running (HTTP)                | `searching`  |
| Running (Browser)             | `working`    |
| Running (Stealth)             | `weaving`    |
| Done                          | `shaping` (paused) |
| Error                         | `solving` (paused) |

## API

| Method | Path                               | Notes                                        |
| ------ | ---------------------------------- | -------------------------------------------- |
| POST   | `/api/jobs`                        | `{urls, mode, concurrency, timeout, fields, include_defaults}` |
| GET    | `/api/jobs`                        | Job summaries                                |
| GET    | `/api/jobs/{id}`                   | Summary + rows                               |
| GET    | `/api/jobs/{id}/events`            | SSE stream (replays from start)              |
| POST   | `/api/jobs/{id}/cancel`            |                                              |
| GET    | `/api/jobs/{id}/export?format=csv` | or `json`                                    |

Example:

```powershell
curl -X POST http://127.0.0.1:8787/api/jobs -H "Content-Type: application/json" `
  -d '{"urls":["https://quotes.toscrape.com/"],"fields":[{"name":"quotes","selector":".quote .text::text","all":true}]}'
```

## Layout

```
mass-scraper/
├── backend/app.py        # FastAPI + Scrapling job runner
├── frontend/src/App.jsx  # React UI
├── data/                 # saved job results (git-ignored)
├── setup.ps1
└── start.ps1
```

## Notes

- Jobs are kept in memory. Restarting the server clears the job list, but `data/` keeps the results.
- The server binds to `127.0.0.1` only. Scrape responsibly: respect robots.txt and rate limits, and use a sensible concurrency.
