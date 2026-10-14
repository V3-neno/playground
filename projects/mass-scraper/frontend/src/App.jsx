import { useEffect, useMemo, useRef, useState } from 'react'
import { ThinkingOrb } from 'thinking-orbs'

const MODES = [
  { id: 'http', label: 'HTTP', hint: 'Fast. curl_cffi with Chrome TLS fingerprint. No JS.' },
  { id: 'dynamic', label: 'Browser', hint: 'Headless Chromium. Renders JavaScript.' },
  { id: 'stealth', label: 'Stealth', hint: 'Patched browser for protected sites. Slowest.' },
]

// Which orb animation represents each phase of a job.
const RUNNING_ORB = { http: 'searching', dynamic: 'working', stealth: 'weaving' }
function orbFor(job) {
  if (!job) return { state: 'breathing', label: 'Idle' }
  switch (job.status) {
    case 'queued':
    case 'starting':
      return { state: 'connecting', label: job.mode === 'http' ? 'Opening session…' : 'Launching browsers…' }
    case 'running':
      return { state: RUNNING_ORB[job.mode], label: 'Scraping…' }
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
        JSON.stringify({ urlsText, mode, concurrency, timeout, includeDefaults, fields }),
      )
    } catch {}
  }, [urlsText, mode, concurrency, timeout, includeDefaults, fields])

  const refreshHistory = () =>
    fetch('/api/jobs')
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => {})

  useEffect(() => {
    refreshHistory()
    return () => esRef.current?.close()
  }, [])

  function subscribe(id) {
    esRef.current?.close()
    const es = new EventSource(`/api/jobs/${id}/events`)
    esRef.current = es
    es.onmessage = (e) => {
      const ev = JSON.parse(e.data)
      setJob(ev.job)
      setHistory((h) => h.map((x) => (x.id === ev.job.id ? ev.job : x)))
      if (ev.type === 'row') setRows((prev) => ({ ...prev, [ev.row.i]: ev.row }))
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
    setRows(Object.fromEntries(d.rows.map((r) => [r.i, r])))
    setOpen(null)
    if (!d.job.finished) subscribe(id)
  }

  const cancel = () => job && fetch(`/api/jobs/${job.id}/cancel`, { method: 'POST' })

  const running = job && !job.finished
  const orb = orbFor(job)
  const done = job ? job.ok + job.failed : 0
  const pct = job?.total ? Math.round((done / job.total) * 100) : 0
  const elapsed = job ? ((job.finished ?? Date.now() / 1000) - job.created) : 0
  const rate = elapsed > 0 ? done / elapsed : 0
  const eta = rate > 0 && job ? Math.max(0, (job.total - done) / rate) : null

  const rowList = Object.values(rows)
    .sort((a, b) => a.i - b.i)
    .filter((r) => filter === 'all' || r.state === filter)

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
            URLs <span className="muted">({urlCount})</span>
          </label>
          <textarea
            className="urls"
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            spellCheck={false}
            placeholder="One URL per line. Lines starting with # are ignored."
          />

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
                Scrape {urlCount} URL{urlCount === 1 ? '' : 's'}
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
                        {h.mode} · {h.ok}/{h.total} · {h.status}
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
                <Stat k="Rate" v={job ? `${rate.toFixed(1)}/s` : '—'} />
                <Stat k={job?.finished ? 'Took' : 'ETA'} v={job ? fmtDur(job.finished ? elapsed : eta) : '—'} />
              </div>
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
              <span className="muted small">{rowList.length} rows</span>
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
                      <th>Status</th>
                      <th>Time</th>
                      <th>Title / error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowList.map((r) => (
                      <RowView key={r.i} r={r} mode={job?.mode} open={open === r.i} onToggle={() => setOpen(open === r.i ? null : r.i)} />
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

function RowView({ r, mode, open, onToggle }) {
  return (
    <>
      <tr className={`r-${r.state}`} onClick={r.state !== 'active' ? onToggle : undefined}>
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
        <td className="mono">{r.status ?? (r.state === 'failed' ? 'ERR' : '…')}</td>
        <td className="mono muted">{r.ms != null ? `${r.ms}ms` : ''}</td>
        <td className="title">{r.error ? <span className="error-text">{r.error}</span> : r.data?.title ?? ''}</td>
      </tr>
      {open && (
        <tr className="detail">
          <td colSpan={5}>
            {r.final_url && r.final_url !== r.url && <div className="muted small">→ {r.final_url}</div>}
            <pre>{JSON.stringify(r.data ?? r, null, 2)}</pre>
          </td>
        </tr>
      )}
    </>
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
