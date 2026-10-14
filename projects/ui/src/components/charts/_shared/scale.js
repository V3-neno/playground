// Small hand-rolled chart math: scales, ticks, paths, arcs, formatting. No dependencies.

/** Linear scale: maps [d0, d1] onto [r0, r1]. f(v) -> px, f.invert(px) -> v */
export function linear([d0, d1], [r0, r1]) {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0)
  const f = (v) => r0 + (v - d0) * k
  f.invert = (p) => (k === 0 ? d0 : d0 + (p - r0) / k)
  f.domain = [d0, d1]
  f.range = [r0, r1]
  return f
}

/** Evenly spaced bands (bar charts). x(i) is the band start; bandwidth excludes the inner padding. */
export function band(n, [r0, r1], { inner = 0.25, outer = 0.12 } = {}) {
  const step = (r1 - r0) / Math.max(1, n - inner + outer * 2)
  const start = r0 + (r1 - r0 - step * (n - inner)) / 2
  return { x: (i) => start + step * i, bandwidth: step * (1 - inner), step }
}

/** "Nice" round ticks covering [min, max]. Returns { ticks, min, max } with the extended domain. */
export function niceTicks(min, max, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { ticks: [0, 1], min: 0, max: 1 }
  if (min === max) {
    if (min === 0) max = 1
    else if (min > 0) min = 0
    else max = 0
  }
  const raw = (max - min) / Math.max(1, count)
  const mag = 10 ** Math.floor(Math.log10(raw))
  const err = raw / mag
  const step = (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * mag
  const lo = Math.floor(min / step + 1e-9) * step
  const hi = Math.ceil(max / step - 1e-9) * step
  const ticks = []
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(10))
  return { ticks, min: lo, max: hi }
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const plain = new Intl.NumberFormat('en', { maximumFractionDigits: 2 })

/** 12.3k style for axes; full numbers for tooltips. */
export const formatCompact = (v) => (Math.abs(v) >= 10000 ? compact.format(v) : plain.format(v))
export const formatNumber = (v) => plain.format(v)

/* ---------- Paths ---------- */

const r2 = (n) => Math.round(n * 100) / 100

/** Monotone cubic tangents (Fritsch–Carlson): smooth without overshooting the data. */
function monotoneTangents(pts) {
  const n = pts.length
  const d = []
  const m = new Array(n)
  for (let i = 0; i < n - 1; i++) d.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0] || 1))
  m[0] = d[0]
  m[n - 1] = d[n - 2]
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0
      m[i + 1] = 0
      continue
    }
    const a = m[i] / d[i]
    const b = m[i + 1] / d[i]
    const s = a * a + b * b
    if (s > 9) {
      const t = 3 / Math.sqrt(s)
      m[i] = t * a * d[i]
      m[i + 1] = t * b * d[i]
    }
  }
  return m
}

/**
 * Path through points [[x, y], ...]. curve: 'linear' | 'smooth' | 'step'.
 * `move` false starts with L instead of M (to continue an existing path).
 */
export function linePath(pts, curve = 'linear', move = true) {
  if (!pts.length) return ''
  let d = `${move ? 'M' : 'L'}${r2(pts[0][0])},${r2(pts[0][1])}`
  if (pts.length === 1) return d
  if (curve === 'step') {
    for (let i = 1; i < pts.length; i++) {
      const mx = (pts[i - 1][0] + pts[i][0]) / 2
      d += `H${r2(mx)}V${r2(pts[i][1])}H${r2(pts[i][0])}`
    }
    return d
  }
  if (curve === 'smooth' && pts.length > 2) {
    const m = monotoneTangents(pts)
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i]
      const [x1, y1] = pts[i + 1]
      const dx = (x1 - x0) / 3
      d += `C${r2(x0 + dx)},${r2(y0 + m[i] * dx)} ${r2(x1 - dx)},${r2(y1 - m[i + 1] * dx)} ${r2(x1)},${r2(y1)}`
    }
    return d
  }
  for (let i = 1; i < pts.length; i++) d += `L${r2(pts[i][0])},${r2(pts[i][1])}`
  return d
}

/** Closed area between a top line and a bottom line (same x's). */
export function areaPath(top, bottom, curve = 'linear') {
  if (!top.length) return ''
  return linePath(top, curve) + linePath([...bottom].reverse(), curve, false) + 'Z'
}

/**
 * Bar with only its data end rounded. dir = direction the bar grows: 'up' | 'down' | 'right' | 'left'.
 */
export function barPath(x, y, w, h, r, dir = 'up') {
  w = Math.max(0, w)
  h = Math.max(0, h)
  const horizontal = dir === 'right' || dir === 'left'
  r = Math.max(0, Math.min(r, (horizontal ? h : w) / 2, horizontal ? w : h))
  if (r === 0) return `M${r2(x)},${r2(y)}h${r2(w)}v${r2(h)}h${r2(-w)}Z`
  const [X, Y, W, H, R] = [x, y, w, h, r].map(r2)
  switch (dir) {
    case 'down':
      return `M${X},${Y}H${r2(X + W)}V${r2(Y + H - R)}Q${r2(X + W)},${r2(Y + H)} ${r2(X + W - R)},${r2(Y + H)}H${r2(X + R)}Q${X},${r2(Y + H)} ${X},${r2(Y + H - R)}Z`
    case 'right':
      return `M${X},${Y}H${r2(X + W - R)}Q${r2(X + W)},${Y} ${r2(X + W)},${r2(Y + R)}V${r2(Y + H - R)}Q${r2(X + W)},${r2(Y + H)} ${r2(X + W - R)},${r2(Y + H)}H${X}Z`
    case 'left':
      return `M${r2(X + W)},${Y}H${r2(X + R)}Q${X},${Y} ${X},${r2(Y + R)}V${r2(Y + H - R)}Q${X},${r2(Y + H)} ${r2(X + R)},${r2(Y + H)}H${r2(X + W)}Z`
    default:
      return `M${X},${r2(Y + H)}V${r2(Y + R)}Q${X},${Y} ${r2(X + R)},${Y}H${r2(X + W - R)}Q${r2(X + W)},${Y} ${r2(X + W)},${r2(Y + R)}V${r2(Y + H)}Z`
  }
}

/* ---------- Arcs (angles in radians, 0 = 12 o'clock, clockwise) ---------- */

export const polar = (cx, cy, r, a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)]

/** Annular sector from a0 to a1 between radii r0 (inner, may be 0) and r1 (outer). */
export function arcPath(cx, cy, r0, r1, a0, a1) {
  const span = a1 - a0
  if (span <= 0) return ''
  if (span >= Math.PI * 2 - 1e-6) {
    // A full ring: two half arcs (a single SVG arc can't close on itself).
    const mid = a0 + Math.PI
    return arcPath(cx, cy, r0, r1, a0, mid) + arcPath(cx, cy, r0, r1, mid, a0 + Math.PI * 2 - 1e-6)
  }
  const large = span > Math.PI ? 1 : 0
  const [x0, y0] = polar(cx, cy, r1, a0)
  const [x1, y1] = polar(cx, cy, r1, a1)
  let d = `M${r2(x0)},${r2(y0)}A${r2(r1)},${r2(r1)} 0 ${large} 1 ${r2(x1)},${r2(y1)}`
  if (r0 > 0) {
    const [x2, y2] = polar(cx, cy, r0, a1)
    const [x3, y3] = polar(cx, cy, r0, a0)
    d += `L${r2(x2)},${r2(y2)}A${r2(r0)},${r2(r0)} 0 ${large} 0 ${r2(x3)},${r2(y3)}Z`
  } else d += `L${r2(cx)},${r2(cy)}Z`
  return d
}

/** Open arc stroke (gauge tracks). */
export function arcStroke(cx, cy, r, a0, a1) {
  if (a1 - a0 <= 0) return ''
  const [x0, y0] = polar(cx, cy, r, a0)
  const [x1, y1] = polar(cx, cy, r, a1)
  return `M${r2(x0)},${r2(y0)}A${r2(r)},${r2(r)} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${r2(x1)},${r2(y1)}`
}

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
export const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0)
