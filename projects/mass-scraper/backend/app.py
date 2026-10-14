"""Mass Scraper — a localhost FastAPI wrapper around Scrapling.

Submit seed URLs, pick a fetcher and a discovery mode, and stream per-URL progress over SSE.

Discovery modes:
  list     scrape exactly the URLs given
  sitemap  also scrape every URL listed in the seeds' sitemaps (robots.txt -> sitemap.xml, nested indexes, .gz)
  links    breadth-first crawl of internal links from the seeds, up to max_depth
"""

from __future__ import annotations

import asyncio
import csv
import gzip
import io
import json
import os
import time
import uuid
from contextlib import AsyncExitStack
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Awaitable, Callable, Literal
from urllib.parse import urlsplit, urlunsplit

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response, StreamingResponse
from fastapi.staticfiles import StaticFiles
from lxml import etree
from protego import Protego
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT.parent / "data"
DIST_DIR = ROOT.parent / "frontend" / "dist"
DATA_DIR.mkdir(exist_ok=True)

ROBOTS_UA = "MassScraper"
MAX_SITEMAP_FILES = 500
SKIP_EXTENSIONS = (
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".avif", ".bmp",
    ".pdf", ".zip", ".gz", ".rar", ".7z", ".tar", ".dmg", ".exe", ".msi",
    ".mp3", ".mp4", ".webm", ".mov", ".avi", ".wav",
    ".css", ".js", ".json", ".xml", ".txt", ".rss", ".atom",
    ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".csv",
    ".woff", ".woff2", ".ttf", ".eot",
)  # fmt: skip

Mode = Literal["http", "dynamic", "stealth"]
Discovery = Literal["list", "sitemap", "links"]
Fetch = Callable[[str], Awaitable[Any]]


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
    discovery: Discovery = "list"
    max_pages: int = Field(default=500, ge=1, le=20000)
    max_depth: int = Field(default=3, ge=0, le=20)  # links mode only
    respect_robots: bool = True  # sitemap / links modes only


@dataclass
class Job:
    id: str
    req: JobRequest
    seeds: list[str]
    urls: list[str] = field(default_factory=list)  # every URL queued for scraping, index = row id
    seen: set[str] = field(default_factory=set)
    status: str = "queued"  # queued | starting | running | done | cancelled | error
    created: float = field(default_factory=time.time)
    finished: float | None = None
    results: dict[int, dict[str, Any]] = field(default_factory=dict)
    discovery: dict[str, Any] = field(
        default_factory=lambda: {"sitemaps": 0, "sitemap_errors": 0, "robots_blocked": 0, "capped": False}
    )
    events: list[dict[str, Any]] = field(default_factory=list)
    cond: asyncio.Condition = field(default_factory=asyncio.Condition)
    task: asyncio.Task | None = None
    error: str | None = None
    last_tick: float = 0.0

    def counts(self) -> dict[str, int]:
        states = [r["state"] for r in self.results.values()]
        ok, failed, active, skipped = (states.count(s) for s in ("ok", "failed", "active", "skipped"))
        return {
            "total": len(self.urls),
            "ok": ok,
            "failed": failed,
            "active": active,
            "skipped": skipped,  # never started because the job was cancelled
            "queued": len(self.urls) - ok - failed - active - skipped,
        }

    def summary(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "status": self.status,
            "mode": self.req.mode,
            "discovery_mode": self.req.discovery,
            "concurrency": self.req.concurrency,
            "created": self.created,
            "finished": self.finished,
            "error": self.error,
            "discovery": self.discovery,
            **self.counts(),
        }

    async def emit(self, kind: str, **payload: Any) -> None:
        async with self.cond:
            self.events.append({"type": kind, "job": self.summary(), **payload})
            self.cond.notify_all()

    async def tick(self) -> None:
        """Throttled progress event, so discovery counters move without flooding the stream."""
        now = time.monotonic()
        if now - self.last_tick > 0.25:
            self.last_tick = now
            await self.emit("progress")


JOBS: dict[str, Job] = {}


# ---------------------------------------------------------------- URL helpers


def normalize_seeds(raw: list[str]) -> list[str]:
    seen, out = set(), []
    for line in raw:
        u = line.strip()
        if not u or u.startswith("#"):
            continue
        if not u.startswith(("http://", "https://")):
            u = "https://" + u
        u = canonical(u)
        if u and u not in seen:
            seen.add(u)
            out.append(u)
    return out


def canonical(url: str) -> str | None:
    """Lowercase scheme/host, drop the fragment. Returns None for non-http(s) URLs."""
    try:
        p = urlsplit(url.strip())
    except ValueError:
        return None
    if p.scheme not in ("http", "https") or not p.netloc:
        return None
    return urlunsplit((p.scheme, p.netloc.lower(), p.path or "/", p.query, ""))


def site_of(url: str) -> str:
    """Host without a leading www., so example.com and www.example.com count as one site."""
    host = (urlsplit(url).hostname or "").lower()
    return host[4:] if host.startswith("www.") else host


def origin_of(url: str) -> str:
    p = urlsplit(url)
    return f"{p.scheme}://{p.netloc}"


def looks_like_sitemap(url: str) -> bool:
    path = urlsplit(url).path.lower()
    return path.endswith((".xml", ".xml.gz")) or "sitemap" in path


def is_page_like(url: str) -> bool:
    return not urlsplit(url).path.lower().endswith(SKIP_EXTENSIONS)


# ---------------------------------------------------------------- extraction


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


def parse_sitemap(body: bytes) -> tuple[list[str], list[str]]:
    """Returns (page_urls, child_sitemap_urls) from a <urlset> or <sitemapindex>."""
    if body[:2] == b"\x1f\x8b":
        body = gzip.decompress(body)
    parser = etree.XMLParser(recover=True, resolve_entities=False, no_network=True, huge_tree=True)
    root = etree.fromstring(body, parser)
    if root is None:
        return [], []
    kind = etree.QName(root).localname
    locs = [el.text.strip() for el in root.iter("{*}loc") if el.text and el.text.strip()]
    if kind == "sitemapindex":
        return [], locs
    if kind == "urlset":
        return locs, []
    return [], []


# ---------------------------------------------------------------- crawler


async def open_session(stack: AsyncExitStack, req: JobRequest) -> Fetch:
    """Returns an async `fetch(url)` callable backed by one shared Scrapling session."""
    if req.mode == "http":
        return await open_http(stack, req)

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


async def open_http(stack: AsyncExitStack, req: JobRequest) -> Fetch:
    from scrapling.fetchers import FetcherSession

    s = await stack.enter_async_context(FetcherSession(impersonate="chrome", timeout=req.timeout, retries=2))
    return s.get


class Crawler:
    """Worker pool over a growing queue. Discovery (sitemaps, internal links) feeds the same queue."""

    def __init__(self, job: Job, fetch: Fetch, http: Fetch):
        self.job = job
        self.req = job.req
        self.fetch = fetch  # page fetcher for the chosen mode
        self.http = http  # always plain HTTP; used for robots.txt and sitemaps
        self.queue: asyncio.Queue[tuple[int, str, int]] = asyncio.Queue()
        self.sites = {site_of(u) for u in job.seeds}
        self._robots: dict[str, asyncio.Future] = {}

    async def run(self) -> None:
        sitemap_seeds = []
        for url in self.job.seeds:
            if self.req.discovery == "sitemap" and looks_like_sitemap(url):
                sitemap_seeds.append(url)
            else:
                await self.add(url, depth=0, via="seed")

        workers = [asyncio.create_task(self.worker()) for _ in range(self.req.concurrency)]
        try:
            if self.req.discovery == "sitemap":
                await self.discover_sitemaps(sitemap_seeds)
            await self.queue.join()
        finally:
            for w in workers:
                w.cancel()
            for f in self._robots.values():
                f.cancel()
            await asyncio.gather(*workers, return_exceptions=True)

    async def add(self, url: str, depth: int, via: str) -> bool:
        job = self.job
        url = canonical(url)
        if not url or url in job.seen:
            return False
        if len(job.urls) >= self.req.max_pages:
            job.discovery["capped"] = True
            return False
        job.seen.add(url)
        if via != "seed" and not await self.allowed(url):
            job.discovery["robots_blocked"] += 1
            return False
        if len(job.urls) >= self.req.max_pages:  # re-check: the robots lookup may have yielded
            job.discovery["capped"] = True
            return False
        i = len(job.urls)
        job.urls.append(url)
        job.results[i] = {"i": i, "url": url, "state": "queued", "via": via, "depth": depth}
        self.queue.put_nowait((i, url, depth))
        await job.tick()
        return True

    async def worker(self) -> None:
        while True:
            i, url, depth = await self.queue.get()
            try:
                await self.scrape(i, url, depth)
            finally:
                self.queue.task_done()

    async def scrape(self, i: int, url: str, depth: int) -> None:
        job = self.job
        base = {k: job.results[i][k] for k in ("i", "url", "via", "depth")}
        job.results[i] = {**base, "state": "active"}
        await job.emit("row", row=job.results[i])
        t0 = time.perf_counter()
        page = None
        try:
            page = await self.fetch(url)
            row = {
                **base,
                "final_url": str(page.url),
                "state": "ok" if page.status < 400 else "failed",
                "status": page.status,
                "data": extract(page, self.req),
            }
        except Exception as e:  # one bad URL must not sink the batch
            row = {**base, "state": "failed", "error": f"{type(e).__name__}: {e}"[:500]}
        row["ms"] = round((time.perf_counter() - t0) * 1000)
        job.results[i] = row
        await job.emit("row", row=row)

        if page is not None and row["state"] == "ok":
            final = canonical(str(page.url))
            if final:
                job.seen.add(final)  # don't re-scrape a redirect target under its own URL
            if self.req.discovery == "links" and depth < self.req.max_depth:
                await self.follow_links(page, depth)

    async def follow_links(self, page: Any, depth: int) -> None:
        try:
            hrefs = page.css("a::attr(href)").getall()
        except Exception:
            return
        for href in hrefs:
            href = str(href).strip()
            if not href or href.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
                continue
            url = canonical(page.urljoin(href))
            if url and site_of(url) in self.sites and is_page_like(url):
                await self.add(url, depth=depth + 1, via="link")
            if len(self.job.urls) >= self.req.max_pages:
                self.job.discovery["capped"] = True
                return

    # -- robots.txt

    def robots_for(self, origin: str) -> asyncio.Future:
        if origin not in self._robots:
            self._robots[origin] = asyncio.ensure_future(self._fetch_robots(origin))
        return self._robots[origin]

    async def _fetch_robots(self, origin: str) -> Protego | None:
        try:
            r = await self.http(origin + "/robots.txt")
            if r.status >= 400:
                return None
            return Protego.parse(r.body.decode(r.encoding or "utf-8", errors="replace"))
        except Exception:
            return None

    async def allowed(self, url: str) -> bool:
        if not self.req.respect_robots:
            return True
        rp = await self.robots_for(origin_of(url))
        return rp is None or rp.can_fetch(url, ROBOTS_UA)

    # -- sitemaps

    async def discover_sitemaps(self, explicit: list[str]) -> None:
        job = self.job
        pending: list[str] = list(explicit)
        self.sites.update(site_of(u) for u in explicit)

        # robots.txt Sitemap: lines first, then the conventional locations.
        for origin in dict.fromkeys(origin_of(u) for u in job.seeds if u not in explicit):
            rp = await self.robots_for(origin)
            listed = list(rp.sitemaps) if rp else []
            pending += listed or [origin + "/sitemap.xml", origin + "/sitemap_index.xml"]

        visited: set[str] = set()
        while pending and len(visited) < MAX_SITEMAP_FILES and len(job.urls) < self.req.max_pages:
            sm = pending.pop(0)
            if sm in visited:
                continue
            visited.add(sm)
            try:
                r = await self.http(sm)
                if r.status >= 400:
                    raise ValueError(f"HTTP {r.status}")
                pages, children = parse_sitemap(r.body)
            except Exception:
                job.discovery["sitemap_errors"] += 1
                await job.tick()
                continue
            job.discovery["sitemaps"] += 1
            pending += [c for c in children if c not in visited]
            for url in pages:
                if site_of(url) in self.sites and is_page_like(url):
                    await self.add(url, depth=0, via="sitemap")
                if len(job.urls) >= self.req.max_pages:
                    job.discovery["capped"] = True
                    break
            await job.tick()


async def run_job(job: Job) -> None:
    job.status = "starting"
    await job.emit("status")
    try:
        async with AsyncExitStack() as stack:
            fetch = await open_session(stack, job.req)
            http = fetch if job.req.mode == "http" else await open_http(stack, job.req)
            job.status = "running"
            await job.emit("status")
            await Crawler(job, fetch, http).run()
        job.status = "done"
    except asyncio.CancelledError:
        job.status = "cancelled"
        for r in job.results.values():
            if r["state"] == "active":
                r.update(state="failed", error="cancelled")
            elif r["state"] == "queued":
                r["state"] = "skipped"
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
    seeds = normalize_seeds(req.urls)
    if not seeds:
        raise HTTPException(400, "no valid URLs")
    job = Job(id=uuid.uuid4().hex[:10], req=req, seeds=seeds)
    JOBS[job.id] = job
    job.task = asyncio.create_task(run_job(job))
    return job.summary()


@app.get("/api/jobs")
async def list_jobs():
    return sorted((j.summary() for j in JOBS.values()), key=lambda j: -j["created"])


@app.get("/api/jobs/{job_id}")
async def job_detail(job_id: str):
    job = get_job(job_id)
    return {"job": job.summary(), "seeds": job.seeds, "rows": rows(job)}


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
        w.writerow(["url", "final_url", "via", "depth", "state", "status", "ms", "error", *keys])
        for r in data:
            d = r.get("data", {})
            w.writerow([
                r["url"], r.get("final_url", ""), r.get("via", ""), r.get("depth", ""), r["state"],
                r.get("status", ""), r.get("ms", ""), r.get("error", ""),
                *(" | ".join(map(str, v)) if isinstance(v, list) else ("" if v is None else v) for v in (d.get(k) for k in keys)),
            ])  # fmt: skip
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

    uvicorn.run("app:app", host="127.0.0.1", port=int(os.environ.get("PORT", 8787)), reload=False)
