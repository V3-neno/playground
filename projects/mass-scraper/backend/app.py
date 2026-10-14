"""Mass Scraper — a localhost FastAPI wrapper around Scrapling.

Submit seed URLs, pick a fetcher and a discovery mode, and stream per-URL progress over SSE.

Discovery modes:
  list     scrape exactly the URLs given
  sitemap  also scrape every URL listed in the seeds' sitemaps (robots.txt -> sitemap.xml, nested indexes, .gz)
  links    breadth-first crawl of internal links from the seeds, up to max_depth

Limits: `max_seeds` caps the pasted list; `max_pages_per_site` caps pages *discovered* on each site
(seeds don't count towards it).
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
from functools import lru_cache
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
from tld import get_fld
from pydantic import BaseModel, Field, field_validator

from extractors import DEFAULT_FIND, FIELD_GROUPS, FIELD_IDS, clean, extract_fields

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT.parent / "data"
DIST_DIR = ROOT.parent / "frontend" / "dist"
DATA_DIR.mkdir(exist_ok=True)

ROBOTS_UA = "MassScraper"
MAX_SITEMAP_FILES = 500  # per site
SITEMAP_READERS = 8  # sitemap files fetched in parallel per site
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
    find: list[str] = Field(default_factory=lambda: list(DEFAULT_FIND))  # "What to find" field ids, see extractors.py
    discovery: Discovery = "list"
    max_seeds: int = Field(default=1000, ge=1, le=20000)  # hard cap on the pasted seed list
    max_pages_per_site: int = Field(default=500, ge=1, le=20000)  # discovered pages per site, seeds excluded
    max_depth: int = Field(default=3, ge=0, le=20)  # links mode only
    respect_robots: bool = True  # sitemap / links modes only

    @field_validator("find")
    @classmethod
    def known_fields(cls, v: list[str]) -> list[str]:
        unknown = set(v) - FIELD_IDS
        if unknown:
            raise ValueError(f"unknown fields: {sorted(unknown)}")
        return v


@dataclass
class Job:
    id: str
    req: JobRequest
    seeds: list[str]
    urls: list[str] = field(default_factory=list)  # every URL queued for scraping, index = row id
    seen: set[str] = field(default_factory=set)
    site_counts: dict[str, int] = field(default_factory=dict)  # discovered (non-seed) URLs per site
    seed_totals: dict[str, int] = field(default_factory=dict)  # URLs queued under each seed, the seed included
    status: str = "queued"  # queued | starting | running | done | cancelled | error
    created: float = field(default_factory=time.time)
    finished: float | None = None
    results: dict[int, dict[str, Any]] = field(default_factory=dict)
    discovery: dict[str, Any] = field(
        default_factory=lambda: {
            "sitemaps": 0,
            "sitemap_errors": 0,
            "robots_blocked": 0,
            "seeds_dropped": 0,  # pasted URLs beyond max_seeds
            "sites": 0,
            "capped_sites": [],  # sites that hit max_pages_per_site
        }
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
        if kind != "row":  # rows are frequent; per-seed totals ride on the throttled events only
            payload["seed_totals"] = dict(self.seed_totals)
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


@lru_cache(maxsize=50_000)
def registrable_domain(host: str) -> str:
    """svv.se for www.svv.se, example.co.uk for shop.example.co.uk; falls back to the host (localhost, IPs)."""
    return get_fld("http://" + host, fail_silently=True) or host


def origin_of(url: str) -> str:
    p = urlsplit(url)
    return f"{p.scheme}://{p.netloc}"


def looks_like_sitemap(url: str) -> bool:
    path = urlsplit(url).path.lower()
    return path.endswith((".xml", ".xml.gz")) or "sitemap" in path


def is_page_like(url: str) -> bool:
    return not urlsplit(url).path.lower().endswith(SKIP_EXTENSIONS)


# ---------------------------------------------------------------- extraction


def extract(page: Any, req: JobRequest, is_internal: Callable[[str], bool]) -> dict[str, Any]:
    data = extract_fields(page, req.find, is_internal)
    for rule in req.fields:
        sel = rule.selector.strip()
        found = page.xpath(sel) if sel.startswith(("/", "(")) else page.css(sel)
        if rule.all:
            data[rule.name] = [clean(v) for v in found.getall()]
        else:
            data[rule.name] = clean(found.get())
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
        self.queue: asyncio.Queue[tuple[int, str, int, str]] = asyncio.Queue()  # (row, url, depth, seed)
        self.sites = {site_of(u) for u in job.seeds}  # every host we may crawl, including redirect aliases
        self.alias: dict[str, str] = {}  # redirected-to host -> the seed site whose budget it shares
        self._robots: dict[str, asyncio.Future] = {}
        # robots.txt + sitemap requests across all sites, so discovery can't flood beyond the chosen concurrency
        self.discovery_sem = asyncio.Semaphore(self.req.concurrency)

    async def run(self) -> None:
        sitemap_seeds = []
        for url in self.job.seeds:
            if self.req.discovery == "sitemap" and looks_like_sitemap(url):
                sitemap_seeds.append(url)
            else:
                await self.add(url, depth=0, via="seed", seed=url)

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

    async def add(self, url: str, depth: int, via: str, seed: str) -> bool:
        """Queue a URL for scraping. `seed` is the pasted URL it was discovered from (rows are grouped by it)."""
        job = self.job
        url = canonical(url)
        if not url or url in job.seen:
            return False
        site = self.budget_site(url)
        if via != "seed" and self.site_full(site):
            return False
        job.seen.add(url)
        if via != "seed":
            if not await self.allowed(url):
                job.discovery["robots_blocked"] += 1
                return False
            if self.site_full(site):  # re-check: the robots lookup may have yielded
                return False
            job.site_counts[site] = job.site_counts.get(site, 0) + 1
        i = len(job.urls)
        job.urls.append(url)
        job.results[i] = {"i": i, "url": url, "seed": seed, "state": "queued", "via": via, "depth": depth}
        job.seed_totals[seed] = job.seed_totals.get(seed, 0) + 1
        self.queue.put_nowait((i, url, depth, seed))
        await job.tick()
        return True

    def budget_site(self, url: str) -> str:
        site = site_of(url)
        return self.alias.get(site, site)

    def register_alias(self, final_url: str, site: str) -> None:
        """A seed site redirected to another host (e.g. old-brand.se -> new-brand.com): crawl it as the same site."""
        final = site_of(final_url)
        if final and final != site and final not in self.sites:
            self.alias[final] = site
            self.sites.add(final)

    def internal_matcher(self, seed: str) -> Callable[[str], bool]:
        """For link counts: a link is internal if it's on the seed's domain (any subdomain) or a domain it redirected to."""
        site = self.budget_site(seed)
        hosts = {site, *(a for a, s in self.alias.items() if s == site)}
        domains = {registrable_domain(h) for h in hosts}
        return lambda url: registrable_domain(urlsplit(url).hostname or "") in domains

    def site_full(self, site: str) -> bool:
        if self.job.site_counts.get(site, 0) < self.req.max_pages_per_site:
            return False
        capped = self.job.discovery["capped_sites"]
        if site not in capped:
            capped.append(site)
        return True

    async def worker(self) -> None:
        while True:
            i, url, depth, seed = await self.queue.get()
            try:
                await self.scrape(i, url, depth, seed)
            finally:
                self.queue.task_done()

    async def scrape(self, i: int, url: str, depth: int, seed: str) -> None:
        job = self.job
        base = {k: job.results[i][k] for k in ("i", "url", "seed", "via", "depth")}
        job.results[i] = {**base, "state": "active"}
        await job.emit("row", row=job.results[i])
        t0 = time.perf_counter()
        page = None
        try:
            page = await self.fetch(url)
            if base["via"] == "seed":  # before extracting, so links on a redirected seed count as internal
                self.register_alias(str(page.url), site_of(url))
            row = {
                **base,
                "final_url": str(page.url),
                "state": "ok" if page.status < 400 else "failed",
                "status": page.status,
            }
            try:
                row["data"] = extract(page, self.req, self.internal_matcher(seed))
            except Exception as e:  # a parsing problem shouldn't turn a fetched page into a failure
                row["data"] = {"extract_error": f"{type(e).__name__}: {e}"[:300]}
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
                await self.follow_links(page, depth, seed)

    async def follow_links(self, page: Any, depth: int, seed: str) -> None:
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
                await self.add(url, depth=depth + 1, via="link", seed=seed)

    # -- robots.txt

    def robots_for(self, origin: str) -> asyncio.Future:
        if origin not in self._robots:
            self._robots[origin] = asyncio.ensure_future(self._fetch_robots(origin))
        return self._robots[origin]

    async def _fetch_robots(self, origin: str) -> Protego | None:
        try:
            async with self.discovery_sem:
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
        """Reads every seed site's sitemaps in parallel; each site fills its own page budget."""
        self.sites.update(site_of(u) for u in explicit)
        groups: dict[str, tuple[list[str], list[str]]] = {}  # site -> (explicit sitemaps, origins)
        for sm in explicit:
            groups.setdefault(site_of(sm), ([], []))[0].append(sm)
        for url in self.job.seeds:
            if url not in explicit:
                origins = groups.setdefault(site_of(url), ([], []))[1]
                if origin_of(url) not in origins:
                    origins.append(origin_of(url))

        first_seed: dict[str, str] = {}
        for url in self.job.seeds:
            first_seed.setdefault(site_of(url), url)
        await asyncio.gather(
            *(self.site_sitemaps(site, first_seed[site], sm, og) for site, (sm, og) in groups.items())
        )

    async def site_sitemaps(self, site: str, seed: str, explicit: list[str], origins: list[str]) -> None:
        job = self.job
        pending: list[str] = list(explicit)
        # robots.txt Sitemap: lines first, then the conventional locations.
        for origin in origins:
            rp = await self.robots_for(origin)
            listed = list(rp.sitemaps) if rp else []
            pending += listed or [origin + "/sitemap.xml", origin + "/sitemap_index.xml"]

        # Sitemap indexes can list dozens of child sitemaps; read up to SITEMAP_READERS of them at once.
        files: asyncio.Queue[str] = asyncio.Queue()
        visited: set[str] = set()

        def push(sm: str) -> None:
            if sm not in visited and len(visited) < MAX_SITEMAP_FILES:
                visited.add(sm)
                files.put_nowait(sm)

        async def read(sm: str) -> None:
            try:
                async with self.discovery_sem:
                    r = await self.http(sm)
                if r.status >= 400:
                    raise ValueError(f"HTTP {r.status}")
                pages, children = parse_sitemap(r.body)
                self.register_alias(str(r.url), site)
            except Exception:
                job.discovery["sitemap_errors"] += 1
                await job.tick()
                return
            job.discovery["sitemaps"] += 1
            for child in children:
                push(child)
            for url in pages:
                if site_of(url) in self.sites and is_page_like(url):
                    await self.add(url, depth=0, via="sitemap", seed=seed)
                if self.site_full(site):
                    break
            await job.tick()

        async def reader() -> None:
            while True:
                sm = await files.get()
                try:
                    if not self.site_full(site):
                        await read(sm)
                finally:
                    files.task_done()

        for sm in pending:
            push(sm)
        readers = [asyncio.create_task(reader()) for _ in range(SITEMAP_READERS)]
        try:
            await files.join()
        finally:
            for t in readers:
                t.cancel()
            await asyncio.gather(*readers, return_exceptions=True)


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


def rows_by_seed(job: Job) -> list[dict[str, Any]]:
    """Rows ordered seed by seed (in pasted order), each seed's pages in discovery order."""
    order = {seed: n for n, seed in enumerate(job.seeds)}
    return sorted(rows(job), key=lambda r: (order.get(r.get("seed"), len(order)), r["i"]))


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
    dropped = max(0, len(seeds) - req.max_seeds)
    job = Job(id=uuid.uuid4().hex[:10], req=req, seeds=seeds[: req.max_seeds])
    job.discovery["seeds_dropped"] = dropped
    job.discovery["sites"] = len({site_of(u) for u in job.seeds})
    JOBS[job.id] = job
    job.task = asyncio.create_task(run_job(job))
    return job.summary()


@app.get("/api/fields")
async def fields():
    return FIELD_GROUPS


@app.get("/api/jobs")
async def list_jobs():
    return sorted((j.summary() for j in JOBS.values()), key=lambda j: -j["created"])


@app.get("/api/jobs/{job_id}")
async def job_detail(job_id: str):
    job = get_job(job_id)
    return {"job": job.summary(), "seeds": job.seeds, "seed_totals": job.seed_totals, "rows": rows(job)}


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
    data = rows_by_seed(job)
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
        w.writerow(["seed", "url", "final_url", "via", "depth", "state", "status", "ms", "error", *keys])
        for r in data:
            d = r.get("data", {})
            w.writerow([
                r.get("seed", ""), r["url"], r.get("final_url", ""), r.get("via", ""), r.get("depth", ""), r["state"],
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
