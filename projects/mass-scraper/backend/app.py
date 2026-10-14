"""Mass Scraper — a localhost FastAPI wrapper around Scrapling.

Submit a list of URLs, pick a fetcher mode, and stream per-URL progress over SSE.
"""

from __future__ import annotations

import asyncio
import csv
import io
import json
import time
import uuid
from contextlib import AsyncExitStack
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT.parent / "data"
DIST_DIR = ROOT.parent / "frontend" / "dist"
DATA_DIR.mkdir(exist_ok=True)

Mode = Literal["http", "dynamic", "stealth"]


class FieldRule(BaseModel):
    name: str
    selector: str  # CSS (supports ::text / ::attr(x)) or XPath if it starts with "/" or "("
    all: bool = False


class JobRequest(BaseModel):
    urls: list[str] = Field(min_length=1)
    mode: Mode = "http"
    concurrency: int = Field(default=8, ge=1, le=64)
    timeout: int = Field(default=30, ge=1, le=180)  # seconds
    fields: list[FieldRule] = []
    include_defaults: bool = True  # title, meta description, h1, link count


@dataclass
class Job:
    id: str
    req: JobRequest
    urls: list[str]
    status: str = "queued"  # queued | starting | running | done | cancelled | error
    created: float = field(default_factory=time.time)
    finished: float | None = None
    results: dict[int, dict[str, Any]] = field(default_factory=dict)
    events: list[dict[str, Any]] = field(default_factory=list)
    cond: asyncio.Condition = field(default_factory=asyncio.Condition)
    task: asyncio.Task | None = None
    error: str | None = None

    def counts(self) -> dict[str, int]:
        states = [r["state"] for r in self.results.values()]
        return {
            "total": len(self.urls),
            "ok": states.count("ok"),
            "failed": states.count("failed"),
            "active": states.count("active"),
        }

    def summary(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "status": self.status,
            "mode": self.req.mode,
            "concurrency": self.req.concurrency,
            "created": self.created,
            "finished": self.finished,
            "error": self.error,
            **self.counts(),
        }

    async def emit(self, kind: str, **payload: Any) -> None:
        async with self.cond:
            self.events.append({"type": kind, "job": self.summary(), **payload})
            self.cond.notify_all()


JOBS: dict[str, Job] = {}


def normalize_urls(raw: list[str]) -> list[str]:
    seen, out = set(), []
    for line in raw:
        u = line.strip()
        if not u or u.startswith("#"):
            continue
        if not u.startswith(("http://", "https://")):
            u = "https://" + u
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def _clean(value: Any) -> Any:
    if value is None:
        return None
    s = str(value).strip()
    return s[:2000]


def extract(page: Any, req: JobRequest) -> dict[str, Any]:
    data: dict[str, Any] = {}
    if req.include_defaults:
        data["title"] = _clean(page.css("title::text").get())
        data["description"] = _clean(page.css('meta[name="description"]::attr(content)').get())
        data["h1"] = _clean(page.css("h1::text").get())
        data["links"] = len(page.css("a::attr(href)").getall())
    for rule in req.fields:
        sel = rule.selector.strip()
        found = page.xpath(sel) if sel.startswith(("/", "(")) else page.css(sel)
        if rule.all:
            data[rule.name] = [_clean(v) for v in found.getall()]
        else:
            data[rule.name] = _clean(found.get())
    return data


async def open_session(stack: AsyncExitStack, req: JobRequest):
    """Returns an async `fetch(url)` callable backed by one shared Scrapling session."""
    if req.mode == "http":
        from scrapling.fetchers import FetcherSession

        s = await stack.enter_async_context(
            FetcherSession(impersonate="chrome", timeout=req.timeout, retries=2)
        )
        return s.get

    browser_opts = dict(
        headless=True,
        max_pages=req.concurrency,
        timeout=req.timeout * 1000,  # browser sessions take milliseconds
        disable_resources=True,
    )
    if req.mode == "dynamic":
        from scrapling.fetchers import AsyncDynamicSession

        s = await stack.enter_async_context(AsyncDynamicSession(**browser_opts))
    else:
        from scrapling.fetchers import AsyncStealthySession

        s = await stack.enter_async_context(AsyncStealthySession(**browser_opts))
    return s.fetch


async def run_job(job: Job) -> None:
    job.status = "starting"
    await job.emit("status")
    sem = asyncio.Semaphore(job.req.concurrency)

    async def worker(i: int, url: str, fetch) -> None:
        async with sem:
            job.results[i] = {"i": i, "url": url, "state": "active"}
            await job.emit("row", row=job.results[i])
            t0 = time.perf_counter()
            try:
                page = await fetch(url)
                row = {
                    "i": i,
                    "url": url,
                    "final_url": str(page.url),
                    "state": "ok" if page.status < 400 else "failed",
                    "status": page.status,
                    "data": extract(page, job.req),
                }
            except Exception as e:  # one bad URL must not sink the batch
                row = {"i": i, "url": url, "state": "failed", "error": f"{type(e).__name__}: {e}"[:500]}
            row["ms"] = round((time.perf_counter() - t0) * 1000)
            job.results[i] = row
            await job.emit("row", row=row)

    try:
        async with AsyncExitStack() as stack:
            fetch = await open_session(stack, job.req)
            job.status = "running"
            await job.emit("status")
            await asyncio.gather(*(worker(i, u, fetch) for i, u in enumerate(job.urls)))
        job.status = "done"
    except asyncio.CancelledError:
        job.status = "cancelled"
        for r in job.results.values():
            if r["state"] == "active":
                r.update(state="failed", error="cancelled")
    except Exception as e:
        job.status = "error"
        job.error = f"{type(e).__name__}: {e}"
    finally:
        job.finished = time.time()
        (DATA_DIR / f"{job.id}.json").write_text(
            json.dumps({"job": job.summary(), "rows": rows(job)}, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        await job.emit("status")


def rows(job: Job) -> list[dict[str, Any]]:
    return [job.results[i] for i in sorted(job.results)]


# ---------------------------------------------------------------- API

app = FastAPI(title="Mass Scraper")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_job(job_id: str) -> Job:
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    return job


@app.post("/api/jobs")
async def create_job(req: JobRequest):
    urls = normalize_urls(req.urls)
    if not urls:
        raise HTTPException(400, "no valid URLs")
    job = Job(id=uuid.uuid4().hex[:10], req=req, urls=urls)
    JOBS[job.id] = job
    job.task = asyncio.create_task(run_job(job))
    return job.summary()


@app.get("/api/jobs")
async def list_jobs():
    return sorted((j.summary() for j in JOBS.values()), key=lambda j: -j["created"])


@app.get("/api/jobs/{job_id}")
async def job_detail(job_id: str):
    job = get_job(job_id)
    return {"job": job.summary(), "urls": job.urls, "rows": rows(job)}


@app.post("/api/jobs/{job_id}/cancel")
async def cancel_job(job_id: str):
    job = get_job(job_id)
    if job.task and not job.task.done():
        job.task.cancel()
    return job.summary()


@app.get("/api/jobs/{job_id}/events")
async def job_events(job_id: str):
    job = get_job(job_id)

    async def stream():
        idx = 0
        while True:
            async with job.cond:
                if idx >= len(job.events):
                    try:
                        await asyncio.wait_for(job.cond.wait(), timeout=15)
                    except asyncio.TimeoutError:
                        yield ": keepalive\n\n"
                        continue
                batch = job.events[idx:]
            idx += len(batch)
            for ev in batch:
                yield f"data: {json.dumps(ev, ensure_ascii=False)}\n\n"
            if job.finished:
                break

    return StreamingResponse(stream(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})


@app.get("/api/jobs/{job_id}/export")
async def export_job(job_id: str, format: Literal["json", "csv"] = "json"):
    job = get_job(job_id)
    data = rows(job)
    if format == "json":
        body = json.dumps(data, indent=2, ensure_ascii=False)
        media = "application/json"
    else:
        keys: list[str] = []
        for r in data:
            for k in r.get("data", {}):
                if k not in keys:
                    keys.append(k)
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow(["url", "final_url", "state", "status", "ms", "error", *keys])
        for r in data:
            d = r.get("data", {})
            w.writerow([
                r["url"], r.get("final_url", ""), r["state"], r.get("status", ""), r.get("ms", ""), r.get("error", ""),
                *(" | ".join(map(str, v)) if isinstance(v, list) else ("" if v is None else v) for v in (d.get(k) for k in keys)),
            ])
        body, media = buf.getvalue(), "text/csv"
    return Response(
        body,
        media_type=media,
        headers={"Content-Disposition": f'attachment; filename="scrape-{job.id}.{format}"'},
    )


# Serve the built frontend (npm run build) so one port is enough.
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

    @app.get("/{path:path}")
    async def spa(path: str):
        return FileResponse(DIST_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="127.0.0.1", port=8787, reload=False)
