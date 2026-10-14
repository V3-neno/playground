// Deterministic demo data for chart stories (no Math.random, so screenshots are stable).

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Seeded pseudo-random in [0, 1) */
export function seeded(seed = 1) {
  let t = seed >>> 0 || 1
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export const SERIES = [
  { key: 'web', label: 'Web' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'api', label: 'API' },
  { key: 'partners', label: 'Partners' },
  { key: 'retail', label: 'Retail' },
  { key: 'other', label: 'Other' },
]

/** Monthly revenue-like rows: { label: 'Jan', web: 42, mobile: 30, ... } for `count` series. */
export function monthly(count = 3, { months = 12, seed = 7, base = 40 } = {}) {
  const r = seeded(seed)
  return MONTHS.slice(0, months).map((label, i) => {
    const row = { label }
    SERIES.slice(0, count).forEach((s, j) => {
      const trend = base * (1 - j * 0.18) + i * (2.2 - j * 0.4)
      const wave = Math.sin((i + j * 2) / 1.7) * base * 0.12
      row[s.key] = Math.max(2, Math.round(trend + wave + (r() - 0.5) * base * 0.25))
    })
    return row
  })
}

/** A random walk of n values, for sparklines and live charts. */
export function walk(n = 24, { seed = 3, start = 50, step = 8, min = 0 } = {}) {
  const r = seeded(seed)
  const out = [start]
  for (let i = 1; i < n; i++) out.push(Math.max(min, Math.round((out[i - 1] + (r() - 0.48) * step) * 10) / 10))
  return out
}

export const seriesFor = (count) => SERIES.slice(0, count)
