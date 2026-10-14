import { useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useElementSize } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { areaPath, barPath, clamp, formatNumber, linear, linePath } from '../_shared/scale'
import { seriesColor, useEntered, usePaint } from '../_shared/useChart'
import './Sparkline.css'

/**
 * A word-sized chart. Fixed size, or fluid with width="100%".
 * type: 'line' | 'area' | 'bar'. Hover shows the value under the pointer.
 */
export function Sparkline({
  values = [],
  type = 'line',
  width = 120,
  height = 32,
  color = 0,
  curve = 'smooth',
  showLast = true,
  showMinMax = false,
  baseline,
  animate = true,
  format = formatNumber,
  labels,
  className,
  'aria-label': ariaLabel,
}) {
  const fluid = typeof width === 'string'
  const [sizeRef, size] = useElementSize()
  const [rootRef, entered] = useEntered(animate)
  const paint = usePaint()
  const fx = useFx()
  const [hover, setHover] = useState(null)

  const W = fluid ? size.width : width
  const H = height
  const n = values.length
  const pad = type === 'bar' ? 1 : 4
  // Bars grow from zero; lines and areas show the trend, so they use the data's own range.
  const lo = Math.min(...values, baseline ?? Infinity, type === 'bar' ? 0 : Infinity)
  const hi = Math.max(...values, baseline ?? -Infinity)
  const x = n > 1 ? linear([0, n - 1], [pad, W - pad]) : () => W / 2
  const y = linear([lo, hi === lo ? lo + 1 : hi], [H - pad, pad])
  const pts = values.map((v, i) => [x(i), y(v)])
  const c = typeof color === 'number' ? seriesColor(color) : color
  const ci = typeof color === 'number' ? color : 0

  const minI = values.indexOf(Math.min(...values))
  const maxI = values.indexOf(Math.max(...values))
  const last = n - 1
  const bw = n ? Math.max(1, (W - pad * 2) / n - 1.5) : 0

  const setRefs = (el) => {
    rootRef.current = el
    sizeRef.current = el
  }

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const i = clamp(Math.round(((e.clientX - r.left - pad) / Math.max(1, W - pad * 2)) * (n - 1)), 0, n - 1)
    if (fx && i !== hover) sparkle(e, { count: 4, spread: 26 })
    setHover(i)
  }

  const summary = n ? `${format(values[0])} to ${format(values[last])}, low ${format(values[minI])}, high ${format(values[maxI])}` : 'no data'
  return (
    <span
      ref={setRefs}
      className={cx('ui-sparkline', `ui-sparkline--${type}`, fluid && 'ui-sparkline--fluid', entered && 'is-entered', className)}
      style={{ width: fluid ? width : W, height: H, color: c }}
    >
      {W > 0 && n > 0 && (
        <svg width={W} height={H} role="img" aria-label={ariaLabel ?? `Trend: ${summary}`} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
          {paint.defs(ci + 1)}
          {baseline != null && <line className="ui-sparkline__baseline" x1={0} x2={W} y1={y(baseline)} y2={y(baseline)} />}
          {type === 'bar' ? (
            <g className="ui-sparkline__bars" style={{ transformOrigin: `0 ${y(Math.max(lo, 0))}px` }}>
              {values.map((v, i) => {
                const y0 = y(Math.max(lo, 0))
                const top = y(v)
                return (
                  <path
                    key={i}
                    className="ui-sparkline__bar"
                    d={barPath(x(i) - bw / 2, Math.min(top, y0), bw, Math.abs(y0 - top), Math.min(2, paint.radius), v >= 0 ? 'up' : 'down')}
                    fill={i === last || i === hover ? paint.fill(ci) : c}
                    data-dim={i !== last && i !== hover ? true : undefined}
                  />
                )
              })}
            </g>
          ) : (
            <g className="ui-sparkline__marks">
              {type === 'area' && <path className="ui-sparkline__area" d={areaPath(pts, pts.map(([px]) => [px, y(Math.max(lo, 0))]), curve)} fill={paint.areaFill(ci)} />}
              <path className="ui-sparkline__line" d={linePath(pts, curve)} pathLength="1" fill="none" stroke={c} />
            </g>
          )}
          {showMinMax && type !== 'bar' && (
            <g className="ui-sparkline__extremes">
              <circle cx={pts[minI][0]} cy={pts[minI][1]} r="2.5" className="ui-sparkline__min" />
              <circle cx={pts[maxI][0]} cy={pts[maxI][1]} r="2.5" className="ui-sparkline__max" />
            </g>
          )}
          {showLast && type !== 'bar' && (
            <g className="ui-sparkline__last">
              {paint.extra && <circle className="ui-sparkline__pulse" cx={pts[last][0]} cy={pts[last][1]} r="3" fill={c} />}
              <circle className="ui-chart__dot" cx={pts[last][0]} cy={pts[last][1]} r="3" fill={c} />
            </g>
          )}
          {hover != null && type !== 'bar' && <circle className="ui-chart__focus-dot" cx={pts[hover][0]} cy={pts[hover][1]} r="3.5" fill={c} />}
        </svg>
      )}
      {hover != null && (
        <span className="ui-sparkline__tip" role="status" style={{ left: clamp(x(hover), 20, W - 20) }}>
          {labels?.[hover] != null && <span className="ui-sparkline__tip-label">{labels[hover]}</span>}
          {format(values[hover])}
        </span>
      )}
    </span>
  )
}

/** A KPI tile: label, big number, change vs previous, sparkline. Change direction gets an icon, not just colour. */
export function SparkStat({ label, value, change, values, type = 'area', color = 0, format, goodWhen = 'up', className }) {
  const up = change >= 0
  const good = goodWhen === 'up' ? up : !up
  return (
    <div className={cx('ui-sparkstat', className)}>
      <div className="ui-sparkstat__label">{label}</div>
      <div className="ui-sparkstat__row">
        <div className="ui-sparkstat__value ui-heading">{value}</div>
        {change != null && (
          <span className="ui-sparkstat__change" data-tone={good ? 'good' : 'bad'}>
            <Icon name={up ? 'trending-up' : 'trending-down'} size={14} />
            {up ? '+' : ''}
            {change}%
          </span>
        )}
      </div>
      <Sparkline values={values} type={type} color={color} width="100%" height={40} format={format} />
    </div>
  )
}
