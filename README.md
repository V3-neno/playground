# Playground

A collection of small, self-contained projects that run on localhost.

```
playground/
├── projects/
│   └── mass-scraper/     # Bulk URL scraper (Scrapling + FastAPI + React)
└── README.md
```

## Conventions

- **One folder per project** in `projects/<kebab-name>/`, each with its own `README.md`.
- **Self-contained.** Each project has its own dependencies (Python `.venv`, `node_modules`). Nothing is shared at the root.
- **`setup.ps1` / `start.ps1`.** Every project can be installed and run with these two scripts from its folder.
- **Localhost only.** Servers bind to `127.0.0.1`. Pick a unique port and record it below.
- **Generated data** goes in `projects/<name>/data/`, which git ignores.

## Port registry

| Project        | Port | Notes                          |
| -------------- | ---- | ------------------------------ |
| mass-scraper   | 8787 | API + built UI                 |
| mass-scraper   | 5173 | Vite dev server (dev mode only)|
| ui             | 5180 | Component workshop (Vite)      |

## Adding a project

```powershell
mkdir projects/my-thing
# add README.md, setup.ps1, start.ps1, and claim a port in the table above
```
