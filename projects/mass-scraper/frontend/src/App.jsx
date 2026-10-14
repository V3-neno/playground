import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ThinkingOrb } from 'thinking-orbs'

const MODES = [
  { id: 'http', label: 'HTTP', hint: 'Fast. curl_cffi with Chrome TLS fingerprint. No JS.' },
  { id: 'dynamic', label: 'Browser', hint: 'Headless Chromium. Renders JavaScript.' },
  { id: 'stealth', label: 'Stealth', hint: 'Patched browser for protected sites. Slowest.' },
]

const DISCOVERY = [
  { id: 'list', label: 'List only', hint: 'Scrape exactly the URLs above.' },
  {
    id: 'sitemap',
    label: 'Sitemap',
    hint: "Read each site's sitemap (robots.txt → sitemap.xml, nested indexes) and scrape every URL in it. You can also paste sitemap URLs directly.",
  },
  { id: 'links', label: 'Internal links', hint: 'Follow links that stay on the same site, breadth-first, up to the max depth.' },
]
const ROW_RENDER_LIMIT = 1000

// Which orb animation represents each phase of a job.
const RUNNING_ORB = { http: 'searching', dynamic: 'working', stealth: 'weaving' }
function orbFor(job) {
  if (!job) return { state: 'breathing', label: 'Idle' }
  switch (job.status) {
    case 'queued':
    case 'starting':
      return { state: 'connecting', label: job.mode === 'http' ? 'Opening session…' : 'Launching browsers…' }
    case 'running':
      if (job.discovery_mode === 'sitemap' && job.ok + job.failed + job.active === 0)
        return { state: 'connecting', label: 'Reading sitemaps…' }
      return { state: RUNNING_ORB[job.mode], label: job.discovery_mode === 'list' ? 'Scraping…' : 'Crawling…' }
    case 'done':
      return { state: 'shaping', label: 'Done', paused: true }
    case 'cancelled':
      return { state: 'breathing', label: 'Cancelled', paused: true }
    default:
      return { state: 'solving', label: 'Error', paused: true }
  }
}

const EXAMPLE_URLS = `https://quotes.toscrape.com/
https://quotes.toscrape.com/page/2/
https://quotes.toscrape.com/page/3/
https://books.toscrape.com/
https://example.com`

const loadSaved = () => {
  try {
    return JSON.parse(localStorage.getItem('mass-scraper:form')) || {}
  } catch {
    return {}
  }
}

export default function App() {
  const saved = useMemo(loadSaved, [])
  const [urlsText, setUrlsText] = useState(saved.urlsText ?? EXAMPLE_URLS)
  const [mode, setMode] = useState(saved.mode ?? 'http')
  const [concurrency, setConcurrency] = useState(saved.concurrency ?? 8)
  const [timeout, setTimeoutSec] = useState(saved.timeout ?? 30)
  const [includeDefaults, setIncludeDefaults] = useState(saved.includeDefaults ?? true)
  const [fields, setFields] = useState(saved.fields ?? [{ name: 'quotes', selector: '.quote .text::text', all: true }])
  const [discovery, setDiscovery] = useState(saved.discovery ?? 'list')
  const [maxSeeds, setMaxSeeds] = useState(saved.maxSeeds ?? 1000)
  const [maxPagesPerSite, setMaxPagesPerSite] = useState(saved.maxPagesPerSite ?? 500)
  const [maxDepth, setMaxDepth] = useState(saved.maxDepth ?? 3)
  const [respectRobots, setRespectRobots] = useState(saved.respectRobots ?? true)

  const [job, setJob] = useState(null)
  const [rows, setRows] = useState({})
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(null)
  const esRef = useRef(null)

  const urlCount = useMemo(
    () => urlsText.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#')).length,
    [urlsText],
  )

  useEffect(() => {
    try {
      localStorage.setItem(
        'mass-scraper:form',
        JSON.stringify({
          urlsText, mode, concurrency, timeout, includeDefaults, fields,
          discovery, maxSeeds, maxPagesPerSite, maxDepth, respectRobots,
        }),
      )
    } catch {}
  }, [urlsText, mode, concurrency, timeout, includeDefaults, fields, discovery, maxSeeds, maxPagesPerSite, maxDepth, respectRobots])

  const refreshHistory = () =>
    fetch('/api/jobs')
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => {})

  useEffect(() => {
    refreshHistory()
    return () => esRef.current?.close()
  }, [])

  // SSE events are buffered and applied once per animation frame, so big crawls stay smooth.
  const pending = useRef({ job: null, rows: {} })
  const frame = useRef(0)
  function flush() {
    frame.current = 0
    const { job: j, rows: r } = pending.current
    pending.current = { job: null, rows: {} }
    if (Object.keys(r).length) setRows((prev) => ({ ...prev, ...r }))
    if (j) {
      setJob(j)
      setHistory((h) => h.map((x) => (x.id === j.id ? j : x)))
    }
  }

  function subscribe(id) {
    esRef.current?.close()
    const es = new EventSource(`/api/jobs/${id}/events`)
    esRef.current = es
    es.onmessage = (e) => {
      const ev = JSON.parse(e.data)
      pending.current.job = ev.job
      if (ev.type === 'row') pending.current.rows[ev.row.i] = ev.row
      if (!frame.current) frame.current = requestAnimationFrame(flush)
      if (ev.job.finished) {
        es.close()
        refreshHistory()
      }
    }
    es.onerror = () => es.close()
  }

  async function start() {
    setError('')
    const urls = urlsText.split(/\r?\n/)
    const body = {
      urls,
      mode,
      concurrency: Number(concurrency),
      timeout: Number(timeout),
      include_defaults: includeDefaults,
      discovery,
      max_seeds: Number(maxSeeds),
      max_pages_per_site: Number(maxPagesPerSite),
      max_depth: Number(maxDepth),
      respect_robots: respectRobots,
      fields: fields.filter((f) => f.name.trim() && f.selector.trim()),
    }
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).detail?.toString() || res.statusText)
      const j = await res.json()
      setRows({})
      setOpen(null)
      setJob(j)
      subscribe(j.id)
      refreshHistory()
    } catch (e) {
      setError(String(e.message || e))
    }
  }

  async function openJob(id) {
    const res = await fetch(`/api/jobs/${id}`)
    const d = await res.json()
    setJob(d.job)
    setRows(Object.fromEntries(d.rows.filter((r) => r.state !== 'queued').map((r) => [r.i, r])))
    setOpen(null)
    if (!d.job.finished) subscribe(id)
  }

  const toggleRow = useCallback((i) => setOpen((o) => (o === i ? null : i)), [])

  const cancel = () => job && fetch(`/api/jobs/${job.id}/cancel`, { method: 'POST' })

  const running = job && !job.finished
  const usedSeeds = Math.min(urlCount, Number(maxSeeds) || urlCount)
  const orb = orbFor(job)
  const done = job ? job.ok + job.failed : 0
  const pct = job?.total ? Math.round((done / job.total) * 100) : 0
  const elapsed = job ? ((job.finished ?? Date.now() / 1000) - job.created) : 0
  const rate = elapsed > 0 ? done / elapsed : 0
  const eta = rate > 0 && job ? Math.max(0, (job.total - done) / rate) : null

  const rowList = useMemo(
    () =>
      Object.values(rows)
        .sort((a, b) => a.i - b.i)
        .filter((r) => filter === 'all' || r.state === filter),
    [rows, filter],
  )

  // Re-render once a second while running so elapsed/ETA tick.
  const [, tick] = useState(0)
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [running])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <ThinkingOrb state={orb.state} size={20} paused={orb.paused} aria-label={orb.label} />
          <span>Mass Scraper</span>
          <span className="muted">· Scrapling</span>
        </div>
        <span className="muted small">localhost playground</span>
      </header>

      <main className="layout">
        <section className="panel config">
          <label className="label">
            {discovery === 'list' ? 'URLs' : 'Seed URLs'} <span className="muted">({urlCount})</span>
          </label>
          <textarea
            className="urls"
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            spellCheck={false}
            placeholder="One URL per line. Lines starting with # are ignored."
          />
          <div className="inline-field">
            <label className="label" htmlFor="max-seeds">
              Seed URL limit
            </label>
            <input id="max-seeds" type="number" min="1" max="20000" value={maxSeeds} onChange={(e) => setMaxSeeds(e.target.value)} />
          </div>
          <p className="muted small">
            Caps how many of the URLs pasted above are used.
            {discovery !== 'list' && ' Pages found through sitemaps or links have their own per-site limit below.'}
          </p>
          {urlCount > Number(maxSeeds) && (
            <p className="warn small">
              {urlCount} URLs pasted, so only the first {maxSeeds} will be used.
            </p>
          )}

          <label className="label">Discovery</label>
          <div className="segmented">
            {DISCOVERY.map((d) => (
              <button key={d.id} className={discovery === d.id ? 'on' : ''} onClick={() => setDiscovery(d.id)}>
                {d.label}
              </button>
            ))}
          </div>
          <p className="muted small">{DISCOVERY.find((d) => d.id === discovery).hint}</p>
          {discovery !== 'list' && (
            <>
              <div className="grid2">
                <div>
                  <label className="label">Max pages per site</label>
                  <input
                    type="number"
                    min="1"
                    max="20000"
                    value={maxPagesPerSite}
                    onChange={(e) => setMaxPagesPerSite(e.target.value)}
                  />
                </div>
                {discovery === 'links' && (
                  <div>
                    <label className="label">Max depth</label>
                    <input type="number" min="0" max="20" value={maxDepth} onChange={(e) => setMaxDepth(e.target.value)} />
                  </div>
                )}
              </div>
              <p className="muted small">
                Each site gets its own budget of discovered pages. Seed URLs don't count toward it.
              </p>
              <label className="label row">
                <input type="checkbox" checked={respectRobots} onChange={(e) => setRespectRobots(e.target.checked)} />
                Respect robots.txt
              </label>
            </>
          )}

          <label className="label">Fetcher</label>
          <div className="segmented">
            {MODES.map((m) => (
              <button key={m.id} className={mode === m.id ? 'on' : ''} onClick={() => setMode(m.id)}>
                {m.label}
              </button>
            ))}
          </div>
          <p className="muted small">{MODES.find((m) => m.id === mode).hint}</p>

          <div className="grid2">
            <div>
              <label className="label">
                Concurrency <span className="mono">{concurrency}</span>
              </label>
              <input type="range" min="1" max="64" value={concurrency} onChange={(e) => setConcurrency(e.target.value)} />
            </div>
            <div>
              <label className="label">Timeout (s)</label>
              <input type="number" min="1" max="180" value={timeout} onChange={(e) => setTimeoutSec(e.target.value)} />
            </div>
          </div>

          <label className="label row">
            <input type="checkbox" checked={includeDefaults} onChange={(e) => setIncludeDefaults(e.target.checked)} />
            Extract title, description, h1 and link count
          </label>

          <label className="label">Custom fields</label>
          <p className="muted small">
            CSS with <code>::text</code> / <code>::attr(href)</code>, or XPath starting with <code>/</code>.
          </p>
          {fields.map((f, i) => (
            <div className="field" key={i}>
              <input
                placeholder="name"
                value={f.name}
                onChange={(e) => setFields(fields.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              />
              <input
                className="mono"
                placeholder=".price::text"
                value={f.selector}
                onChange={(e) => setFields(fields.map((x, j) => (j === i ? { ...x, selector: e.target.value } : x)))}
              />
              <label className="all" title="Collect all matches instead of the first">
                <input
                  type="checkbox"
                  checked={f.all}
                  onChange={(e) => setFields(fields.map((x, j) => (j === i ? { ...x, all: e.target.checked } : x)))}
                />
                all
              </label>
              <button className="ghost" onClick={() => setFields(fields.filter((_, j) => j !== i))} aria-label="Remove field">
                ×
              </button>
            </div>
          ))}
          <button className="ghost add" onClick={() => setFields([...fields, { name: '', selector: '', all: false }])}>
            + Add field
          </button>

          {error && <p className="error">{error}</p>}
          <div className="actions">
            {running ? (
              <button className="danger" onClick={cancel}>
                Cancel
              </button>
            ) : (
              <button className="primary" onClick={start} disabled={!urlCount}>
                {discovery === 'list'
                  ? `Scrape ${usedSeeds} URL${usedSeeds === 1 ? '' : 's'}`
                  : `Crawl from ${usedSeeds} seed${usedSeeds === 1 ? '' : 's'}`}
              </button>
            )}
          </div>

          {history.length > 0 && (
            <>
              <label className="label">Jobs this session</label>
              <ul className="history">
                {history.map((h) => (
                  <li key={h.id}>
                    <button className={job?.id === h.id ? 'on' : ''} onClick={() => openJob(h.id)}>
                      <span className="mono">{h.id}</span>
                      <span className="muted">
                        {h.mode}
                        {h.discovery_mode && h.discovery_mode !== 'list' ? `+${h.discovery_mode}` : ''} · {h.ok}/{h.total} ·{' '}
                        {h.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="results">
          <div className="panel hero">
            <ThinkingOrb state={orb.state} size={64} paused={orb.paused} aria-label={orb.label} />
            <div className="hero-body">
              <div className="hero-title">
                {orb.label}
                {job && <span className="muted mono small"> job {job.id}</span>}
              </div>
              <div className="bar">
                <div className="bar-ok" style={{ width: `${job?.total ? (job.ok / job.total) * 100 : 0}%` }} />
                <div className="bar-fail" style={{ width: `${job?.total ? (job.failed / job.total) * 100 : 0}%` }} />
              </div>
              <div className="stats">
                <Stat k="Progress" v={job ? `${done}/${job.total} (${pct}%)` : '—'} />
                <Stat k="OK" v={job?.ok ?? '—'} />
                <Stat k="Failed" v={job?.failed ?? '—'} />
                <Stat k="In flight" v={job?.active ?? '—'} />
                {job && job.discovery_mode !== 'list' && <Stat k="Queued" v={job.queued} />}
                <Stat k="Rate" v={job ? `${rate.toFixed(1)}/s` : '—'} />
                <Stat k={job?.finished ? 'Took' : 'ETA'} v={job ? fmtDur(job.finished ? elapsed : eta) : '—'} />
              </div>
              {job && (job.discovery_mode !== 'list' || job.discovery?.seeds_dropped > 0) && <DiscoveryLine job={job} />}
              {job?.error && <p className="error">{job.error}</p>}
            </div>
            {job?.finished && (
              <div className="exports">
                <a className="button" href={`/api/jobs/${job.id}/export?format=csv`}>
                  CSV
                </a>
                <a className="button" href={`/api/jobs/${job.id}/export?format=json`}>
                  JSON
                </a>
              </div>
            )}
          </div>

          <div className="panel table-panel">
            <div className="table-head">
              <div className="segmented small">
                {['all', 'active', 'ok', 'failed'].map((f) => (
                  <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
              <span className="muted small">
                {rowList.length > ROW_RENDER_LIMIT
                  ? `showing ${ROW_RENDER_LIMIT} of ${rowList.length} rows (export for all)`
                  : `${rowList.length} rows`}
              </span>
            </div>
            {rowList.length === 0 ? (
              <div className="empty muted">
                {job ? 'Waiting for the first response…' : 'Paste URLs on the left and hit Scrape.'}
              </div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>URL</th>
                      <th>Via</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th>Title / error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowList.slice(0, ROW_RENDER_LIMIT).map((r) => (
                      <RowView key={r.i} r={r} mode={job?.mode} open={open === r.i} onToggle={toggleRow} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

const RowView = memo(function RowView({ r, mode, open, onToggle }) {
  return (
    <>
      <tr className={`r-${r.state}`} onClick={r.state !== 'active' ? () => onToggle(r.i) : undefined}>
        <td className="icon">
          {r.state === 'active' ? (
            <ThinkingOrb state={RUNNING_ORB[mode] || 'working'} size={20} aria-label="Fetching" />
          ) : (
            <span className={`dot ${r.state}`} />
          )}
        </td>
        <td className="url mono" title={r.url}>
          {r.url}
        </td>
        <td className="muted small">{r.via === 'link' ? `link · ${r.depth}` : r.via ?? ''}</td>
        <td className="mono">{r.status ?? (r.state === 'failed' ? 'ERR' : '…')}</td>
        <td className="mono muted">{r.ms != null ? `${r.ms}ms` : ''}</td>
        <td className="title">{r.error ? <span className="error-text">{r.error}</span> : r.data?.title ?? ''}</td>
      </tr>
      {open && (
        <tr className="detail">
          <td colSpan={6}>
            {r.final_url && r.final_url !== r.url && <div className="muted small">→ {r.final_url}</div>}
            <pre>{JSON.stringify(r.data ?? r, null, 2)}</pre>
          </td>
        </tr>
      )}
    </>
  )
})

function DiscoveryLine({ job }) {
  const d = job.discovery || {}
  const plural = (n, word, suffix = 's') => `${n} ${word}${n === 1 ? '' : suffix}`
  const capped = d.capped_sites || []
  const parts = []
  if (job.discovery_mode !== 'list') {
    parts.push(plural(d.sites, 'site'))
    if (job.discovery_mode === 'sitemap') parts.push(`${plural(d.sitemaps, 'sitemap')} read`)
    if (d.sitemap_errors) parts.push(plural(d.sitemap_errors, 'sitemap miss', 'es'))
    parts.push(`${plural(job.total, 'URL')} found`)
    if (d.robots_blocked) parts.push(`${d.robots_blocked} blocked by robots.txt`)
    if (job.skipped) parts.push(`${job.skipped} skipped`)
  }
  return (
    <p className="muted small discovery-line">
      {parts.join(' · ')}
      {capped.length > 0 && (
        <span title={capped.join('\n')}>
          {parts.length ? ' · ' : ''}page limit reached on {capped.length} of {plural(d.sites, 'site')}
        </span>
      )}
      {d.seeds_dropped > 0 && (
        <span className="warn">
          {parts.length || capped.length ? ' · ' : ''}
          {plural(d.seeds_dropped, 'seed URL')} over the seed limit ignored
        </span>
      )}
    </p>
  )
}

function Stat({ k, v }) {
  return (
    <div className="stat">
      <div className="muted small">{k}</div>
      <div className="mono">{v}</div>
    </div>
  )
}

function fmtDur(s) {
  if (s == null || !isFinite(s)) return '—'
  if (s < 60) return `${s.toFixed(1)}s`
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
}
