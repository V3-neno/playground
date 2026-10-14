import { useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, sparkle, useFx } from '../../../lib/fx'
import { useElementSize } from '../../../lib/hooks'
import { ChartShell, DataTable, Legend, Tooltip, XLabels, XValueAxis, YAxis } from '../_shared/parts'
import { band, barPath, formatCompact, formatNumber, linear, niceTicks } from '../_shared/scale'
import { gutterFor, useEntered, useHidden, usePaint } from '../_shared/useChart'
import './BarChart.css'

const GAP = 2 // px of surface between adjacent bars and stacked segments

/** Numeric keys of the first row, except the category key: the default series. */
export const inferSeries = (data, x) =>
  Object.keys(data[0] ?? {})
    .filter((k) => k !== x && typeof data[0][k] === 'number')
    .map((key) => ({ key, label: key[0].toUpperCase() + key.slice(1) }))

export function BarChart({
  data = [],
  x = 'label',
  series,
  stacked = false,
  horizontal = false,
  grid = true,
  axes = true,
  showValues = false,
  animate = true,
  height = 260,
  format = formatCompact,
  tooltipFormat = formatNumber,
  legend,
  title,
  subtitle,
  actions,
  card = false,
  className,
  'aria-label': ariaLabel,
}) {
  const allSeries = series ?? inferSeries(data, x)
  const [hidden, toggle] = useHidden()
  const [plotRef, { width }] = useElementSize()
  const [rootRef, entered] = useEntered(animate)
  const paint = usePaint()
  const fx = useFx()
  const [hover, setHover] = useState(null) // { ci, x, y }
  const [focusSeries, setFocusSeries] = useState(null)
  const lastHover = useRef(null)

  const visible = allSeries.map((s, i) => ({ ...s, index: i })).filter((s) => !hidden.has(s.key))
  const cats = data.map((d) => d[x])

  // Value domain (stacks sum positives and negatives separately; 0 is always included)
  let lo = 0
  let hi = 0
  for (const d of data) {
    if (stacked) {
      let pos = 0
      let neg = 0
      for (const s of visible) (d[s.key] >= 0 ? (pos += d[s.key] || 0) : (neg += d[s.key]))
      hi = Math.max(hi, pos)
      lo = Math.min(lo, neg)
    } else for (const s of visible) (hi = Math.max(hi, d[s.key] ?? 0)), (lo = Math.min(lo, d[s.key] ?? 0))
  }
  const { ticks, min, max } = niceTicks(lo, hi, Math.max(2, Math.round((horizontal ? width / 90 : height / 55))))
  const tickLabels = ticks.map(format)

  const m = !axes
    ? { top: 4, right: 4, bottom: 4, left: 4 }
    : horizontal
    ? { top: 4, right: showValues ? 44 : 14, bottom: 26, left: Math.min(140, gutterFor(cats, 40)) }
    : { top: showValues ? 20 : 10, right: 8, bottom: 26, left: gutterFor(tickLabels) }
  const W = Math.max(0, width - m.left - m.right)
  const H = Math.max(0, height - m.top - m.bottom)

  const catScale = horizontal ? band(cats.length, [m.top, m.top + H]) : band(cats.length, [m.left, m.left + W])
  const val = horizontal ? linear([min, max], [m.left, m.left + W]) : linear([min, max], [m.top + H, m.top])
  const base = val(0)

  // Geometry for every visible bar: [{ ci, si, d, end: [x, y], value }]
  const bars = []
  data.forEach((d, ci) => {
    const c0 = catScale.x(ci)
    const bw = catScale.bandwidth
    if (stacked) {
      let pos = 0
      let neg = 0
      const segs = visible.map((s) => {
        const v = d[s.key] ?? 0
        const from = v >= 0 ? pos : neg
        const to = from + v
        v >= 0 ? (pos = to) : (neg = to)
        return { s, v, from, to }
      })
      const lastPos = segs.findLast((g) => g.v > 0)
      const lastNeg = segs.findLast((g) => g.v < 0)
      segs.forEach(({ s, v, from, to }) => {
        if (!v) return
        const first = from === 0
        const r = g(lastPos, s) || g(lastNeg, s) ? paint.radius : 0
        bars.push(geom(ci, s, v, c0, bw, val(from), val(to), r, first ? 0 : GAP))
      })
    } else {
      const k = visible.length || 1
      const sub = (bw - GAP * (k - 1)) / k
      visible.forEach((s, j) => {
        const v = d[s.key] ?? 0
        bars.push(geom(ci, s, v, c0 + j * (sub + GAP), sub, base, val(v), paint.radius, 0))
      })
    }
  })

  function g(seg, s) {
    return seg && seg.s.key === s.key
  }

  /** One bar from value-axis px `a` (baseline side) to `b` (data end), across the band from c0 width w. */
  function geom(ci, s, v, c0, w, a, b, r, gap) {
    const up = horizontal ? b >= a : b <= a // grows away from the baseline
    if (horizontal) {
      const x0 = up ? a + gap : b
      const x1 = up ? b : a - gap
      return { ci, s, v, d: barPath(x0, c0, x1 - x0, w, r, up ? 'right' : 'left'), end: [b, c0 + w / 2] }
    }
    const y0 = up ? b : a + gap
    const y1 = up ? a - gap : b
    return { ci, s, v, d: barPath(c0, y0, w, y1 - y0, r, up ? 'up' : 'down'), end: [c0 + w / 2, b] }
  }

  const ready = width > 0
  const origin = horizontal ? `${base}px 0px` : `0px ${base}px`

  const onMove = (e, ci) => {
    const r = e.currentTarget.ownerSVGElement.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    const center = catScale.x(ci) + catScale.bandwidth / 2
    setHover(horizontal ? { ci, x: px, y: center } : { ci, x: center, y: py })
    if (fx && lastHover.current !== ci) {
      lastHover.current = ci
      sparkle(e)
    }
  }

  const hoverRows =
    hover &&
    visible.map((s) => ({
      label: s.label,
      index: s.index,
      value: tooltipFormat(data[hover.ci][s.key] ?? 0),
      dim: focusSeries && focusSeries !== s.key,
    }))
  const total = hover && stacked && visible.length > 1 ? visible.reduce((t, s) => t + (data[hover.ci][s.key] || 0), 0) : null

  const showLegend = legend ?? allSeries.length > 1
  return (
    <ChartShell
      innerRef={rootRef}
      title={title}
      subtitle={subtitle}
      actions={actions}
      card={card}
      className={cx('ui-bar', horizontal && 'ui-bar--horizontal', className)}
      legend={
        showLegend && (
          <Legend
            items={allSeries.map((s, i) => ({ key: s.key, label: s.label, index: i }))}
            hidden={hidden}
            onToggle={toggle}
            onHover={setFocusSeries}
          />
        )
      }
    >
      <div ref={plotRef} className="ui-chart__plot" onPointerLeave={() => ((lastHover.current = null), setHover(null))}>
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel ?? `${title ?? 'Bar chart'}: ${cats.length} categories, ${allSeries.map((s) => s.label).join(', ')}`}
          data-hovering={hover || focusSeries ? true : undefined}
        >
          {paint.defs(allSeries.length, { vertical: !horizontal })}
          {ready &&
            axes &&
            (horizontal ? (
              <XValueAxis scale={val} ticks={ticks} y0={m.top} y1={m.top + H} format={format} grid={grid} zero={0} />
            ) : (
              <YAxis scale={val} ticks={ticks} x0={m.left} x1={m.left + W} format={format} grid={grid} zero={0} />
            ))}
          {ready && (
            <g className="ui-bar__bars">
              {bars.map((b) => {
                const active = (hover ? hover.ci === b.ci : true) && (focusSeries ? focusSeries === b.s.key : true)
                return (
                  <g key={`${b.ci}-${b.s.key}`} className="ui-bar__group" data-active={active || undefined}>
                    <path
                      className="ui-bar__bar"
                      d={b.d}
                      fill={paint.fill(b.s.index)}
                      style={{
                        color: paint.color(b.s.index),
                        transformOrigin: origin,
                        transform: entered ? 'none' : horizontal ? 'scaleX(0)' : 'scaleY(0)',
                        transitionDelay: entered ? `${b.ci * 45 + b.s.index * 30}ms` : '0ms',
                      }}
                    />
                    {paint.extra && <path className="ui-bar__shine" d={b.d} fill={paint.shine} style={{ transformOrigin: origin, transform: entered ? 'none' : 'scale(0)' }} />}
                  </g>
                )
              })}
            </g>
          )}
          {ready && showValues && (
            <g className="ui-bar__values" aria-hidden>
              {bars
                .filter((b) => !stacked || b === bars.findLast((o) => o.ci === b.ci))
                .map((b) => {
                  const v = stacked ? visible.reduce((t, s) => t + (data[b.ci][s.key] || 0), 0) : b.v
                  return horizontal ? (
                    <text key={`${b.ci}-${b.s.key}`} x={b.end[0] + (v >= 0 ? 6 : -6)} y={b.end[1]} dy="0.32em" textAnchor={v >= 0 ? 'start' : 'end'} style={{ opacity: entered ? 1 : 0 }}>
                      {format(v)}
                    </text>
                  ) : (
                    <text key={`${b.ci}-${b.s.key}`} x={b.end[0]} y={b.end[1] + (v >= 0 ? -6 : 14)} textAnchor="middle" style={{ opacity: entered ? 1 : 0 }}>
                      {format(v)}
                    </text>
                  )
                })}
            </g>
          )}
          {ready &&
            axes &&
            (horizontal ? (
              <g className="ui-chart__axis ui-bar__cats" aria-hidden>
                {cats.map((c, i) => (
                  <text key={i} x={m.left - 8} y={catScale.x(i) + catScale.bandwidth / 2} dy="0.32em" textAnchor="end">
                    {c}
                  </text>
                ))}
              </g>
            ) : (
              <XLabels labels={cats} xOf={(i) => catScale.x(i) + catScale.bandwidth / 2} y={m.top + H + 17} />
            ))}
          {ready &&
            cats.map((_, ci) => (
              <rect
                key={ci}
                className="ui-chart__hit"
                {...(horizontal
                  ? { x: m.left, width: W, y: catScale.x(ci) - (catScale.step - catScale.bandwidth) / 2, height: catScale.step }
                  : { y: m.top, height: H, x: catScale.x(ci) - (catScale.step - catScale.bandwidth) / 2, width: catScale.step })}
                onPointerMove={(e) => onMove(e, ci)}
                onClick={(e) => fx && burst(e)}
              />
            ))}
        </svg>
        {hover && (
          <Tooltip
            x={hover.x}
            y={hover.y}
            width={width}
            title={cats[hover.ci]}
            rows={hoverRows}
            footer={total != null ? `Total ${tooltipFormat(total)}` : null}
          />
        )}
      </div>
      <DataTable
        caption={title}
        columns={[x, ...allSeries.map((s) => s.label)]}
        rows={data.map((d) => [d[x], ...allSeries.map((s) => tooltipFormat(d[s.key] ?? 0))])}
      />
    </ChartShell>
  )
}
