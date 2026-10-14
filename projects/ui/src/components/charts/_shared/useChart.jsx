import { useEffect, useId, useRef, useState } from 'react'
import { useInView } from '../../../lib/hooks'
import { useReducedMotion, useUI } from '../../../lib/ui-context'

/** Bar-end radius per style. Playful rounds fully; hard-edged styles stay square. */
const RADIUS = { base: 4, corporate: 2, glass: 6, soft: 6, brutalist: 0, mono: 0, playful: 99, extra: 6 }

/** Series colour by position in the series definition (never by rank, never cycled past 6). */
export const seriesColor = (i) => `var(--ui-chart-${(i % 6) + 1})`

/**
 * Everything a chart needs to paint itself in the current style:
 *   const paint = usePaint()
 *   <svg>{paint.defs(seriesCount)} <path fill={paint.fill(i)} /> ...
 * Mono gets hatch patterns (identity without colour), Extra gets gradients + shimmer.
 */
export function usePaint() {
  const { style } = useUI()
  const reduced = useReducedMotion()
  const id = useId().replace(/:/g, '')
  const mono = style === 'mono'
  const extra = style === 'extra'
  return {
    id,
    style,
    mono,
    extra,
    reduced,
    radius: RADIUS[style] ?? 4,
    color: seriesColor,
    /** fill for area-like marks (bars, slices, areas) */
    fill: (i) => (mono ? `url(#${id}-hatch-${i % 6})` : extra ? `url(#${id}-grad-${i % 6})` : seriesColor(i)),
    /** fill for an area under a line: fades to transparent */
    areaFill: (i) => (mono ? `url(#${id}-hatch-${i % 6})` : `url(#${id}-fade-${i % 6})`),
    shine: `url(#${id}-shine)`,
    /** mono distinguishes lines by dash pattern as well as tone */
    dash: (i) => (mono ? ['', '6 3', '2 3', '10 3 2 3', '1 4', '12 4'][i % 6] : undefined),
    defs: (count = 6, { vertical = true } = {}) => (
      <defs>
        {Array.from({ length: Math.min(count, 6) }, (_, i) => (
          <g key={i}>
            <linearGradient id={`${id}-fade-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: seriesColor(i), stopOpacity: extra ? 0.55 : 0.32 }} />
              <stop offset="1" style={{ stopColor: seriesColor(i), stopOpacity: 0 }} />
            </linearGradient>
            {extra && (
              <linearGradient id={`${id}-grad-${i}`} x1="0" y1={vertical ? 1 : 0} x2={vertical ? 0 : 1} y2="0">
                <stop offset="0" style={{ stopColor: seriesColor(i + 1) }} />
                <stop offset="1" style={{ stopColor: seriesColor(i) }} />
              </linearGradient>
            )}
            {mono && <Hatch id={`${id}-hatch-${i}`} i={i} />}
          </g>
        ))}
        {extra && (
          <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
            {!reduced && (
              <animateTransform attributeName="gradientTransform" type="translate" from="-1.2 0" to="1.2 0" dur="2.6s" repeatCount="indefinite" />
            )}
          </linearGradient>
        )}
      </defs>
    ),
  }
}

/** Distinct hatch per series: angle and density vary, ink is the series tone. */
function Hatch({ id, i }) {
  const angles = [45, -45, 0, 90, 45, -45]
  const size = [6, 6, 5, 5, 4, 9][i]
  const c = seriesColor(i)
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angles[i]})`}>
      <rect width={size} height={size} style={{ fill: 'var(--ui-bg)' }} />
      {i === 5 ? (
        <circle cx={size / 2} cy={size / 2} r="1.6" style={{ fill: c }} />
      ) : (
        <line x1="0" y1="0" x2="0" y2={size} style={{ stroke: c }} strokeWidth={i >= 4 ? 1.2 : 2.2} />
      )}
    </pattern>
  )
}

/**
 * Entrance flag: false until the chart scrolls into view, then true on the next frame so CSS
 * transitions run. Immediately true when animation is off or motion is reduced.
 */
export function useEntered(animate = true) {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView({ once: true, threshold: 0.15 })
  const off = !animate || reduced
  const [entered, setEntered] = useState(off)
  useEffect(() => {
    if (off) return setEntered(true)
    if (!inView) return
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)))
    return () => cancelAnimationFrame(raf)
  }, [inView, off])
  return [ref, entered]
}

/** Animates a number toward `target` (ease-out cubic). Jumps straight there when disabled. */
export function useTween(target, { duration = 900, enabled = true, from } = {}) {
  const reduced = useReducedMotion()
  const [value, setValue] = useState(enabled && !reduced ? (from ?? target) : target)
  const current = useRef(value)
  useEffect(() => {
    if (!enabled || reduced) {
      current.current = target
      setValue(target)
      return
    }
    const start = current.current
    const t0 = performance.now()
    let raf
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const e = 1 - (1 - p) ** 3
      current.current = start + (target - start) * e
      setValue(current.current)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, enabled, reduced])
  return value
}

/** Series visibility toggled from the legend. Hidden series keep their colour slot. */
export function useHidden() {
  const [hidden, setHidden] = useState(() => new Set())
  const toggle = (key) =>
    setHidden((h) => {
      const next = new Set(h)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  return [hidden, toggle]
}

/** Width of the y-axis label gutter, from the longest tick label. */
export const gutterFor = (labels, min = 24) => Math.max(min, Math.max(...labels.map((l) => String(l).length)) * 7 + 10)
