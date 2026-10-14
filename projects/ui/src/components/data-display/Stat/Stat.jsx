import { useEffect, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useInView } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { useReducedMotion } from '../../../lib/ui-context'
import './Stat.css'

const fmt = (n, { decimals = 0, prefix = '', suffix = '', compact = false } = {}) => {
  const body = compact
    ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
    : n.toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return `${prefix}${body}${suffix}`
}

/** Counts from 0 to `value` once the element scrolls into view. */
function useCountUp(value, { enabled, duration = 1200 }) {
  const [ref, inView] = useInView({ threshold: 0.3 })
  const [shown, setShown] = useState(enabled ? 0 : value)
  const done = useRef(false)
  useEffect(() => {
    if (!enabled) {
      setShown(value)
      return
    }
    if (!inView) return
    let raf
    const start = performance.now()
    const from = done.current ? shown : 0
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 4)
      setShown(from + (value - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
      else done.current = true
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, inView, enabled]) // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, shown, inView]
}

function Sparkline({ data, tone }) {
  if (!data?.length) return null
  const w = 100
  const h = 32
  const min = Math.min(...data)
  const max = Math.max(...data)
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 2 - ((v - min) / (max - min || 1)) * (h - 4)])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  return (
    <svg className={cx('ui-stat__spark', `is-${tone}`)} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <path className="ui-stat__spark-area" d={`${line} L${w} ${h} L0 ${h} Z`} />
      <path className="ui-stat__spark-line" d={line} pathLength="1" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/**
 * A key number with label, change vs. previous period and optional sparkline.
 * The value counts up when it scrolls into view (instantly with reduced motion).
 */
export function Stat({
  label,
  value = 0,
  prefix,
  suffix,
  decimals = 0,
  compact = false,
  delta,
  deltaLabel = 'vs last month',
  invertDelta = false,
  icon,
  trend,
  variant = 'card',
  className,
  ...props
}) {
  const reduced = useReducedMotion()
  const fx = useFx()
  const [ref, shown] = useCountUp(value, { enabled: !reduced })
  const finished = Math.abs(shown - value) < 1e-9
  const up = delta > 0
  const good = delta == null || delta === 0 ? null : up !== invertDelta
  const tone = good == null ? 'neutral' : good ? 'good' : 'bad'

  // Extra: a little sparkle when the count lands
  const sparkled = useRef(false)
  useEffect(() => {
    if (fx && finished && value && !sparkled.current && ref.current) {
      sparkled.current = true
      sparkle(ref.current.querySelector('.ui-stat__value'))
    }
  }, [fx, finished, value, ref])

  return (
    <div ref={ref} className={cx('ui-stat', `ui-stat--${variant}`, className)} {...props}>
      <div className="ui-stat__head">
        <span className="ui-stat__label">{label}</span>
        {icon && (
          <span className="ui-stat__icon">
            <Icon name={icon} size={16} />
          </span>
        )}
      </div>
      <div className="ui-stat__value" aria-label={fmt(value, { decimals, prefix, suffix, compact })}>
        <span aria-hidden>{fmt(shown, { decimals, prefix, suffix, compact })}</span>
      </div>
      {delta != null && (
        <div className={cx('ui-stat__delta', `is-${tone}`)}>
          <span className="ui-stat__delta-chip">
            {delta !== 0 && <Icon name={up ? 'trending-up' : 'trending-down'} size={13} />}
            {up ? '+' : ''}
            {delta}%
          </span>
          <span className="ui-stat__delta-label">{deltaLabel}</span>
        </div>
      )}
      {trend && <Sparkline data={trend} tone={tone} />}
    </div>
  )
}

/** Responsive row of stats that share borders. */
export function StatGroup({ className, children, ...props }) {
  return (
    <div className={cx('ui-stat-group', className)} {...props}>
      {children}
    </div>
  )
}
