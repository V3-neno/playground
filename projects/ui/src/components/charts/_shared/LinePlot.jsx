// Shared engine for Line chart and Area chart: point x-scale, crosshair tooltip, direct end labels.
import { useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, sparkle, useFx } from '../../../lib/fx'
import { useElementSize } from '../../../lib/hooks'
import { ChartShell, DataTable, Legend, Tooltip, XLabels, YAxis } from './parts'
import { areaPath, clamp, formatCompact, formatNumber, linear, linePath, niceTicks } from './scale'
import { gutterFor, useEntered, useHidden, usePaint } from './useChart'
import './lineplot.css'

const inferSeries = (data, x) =>
  Object.keys(data[0] ?? {})
    .filter((k) => k !== x && typeof data[0][k] === 'number')
    .map((key) => ({ key, label: key[0].toUpperCase() + key.slice(1) }))

export function LinePlot({
  data = [],
  x = 'label',
  series,
  area = false,
  stacked = false,
  curve = 'linear',
  grid = true,
  axes = true,
  dots = false,
  endLabels,
  yZero = false,
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
  kind = 'Line chart',
  'aria-label': ariaLabel,
}) {
  const allSeries = series ?? inferSeries(data, x)
  const [hidden, toggle] = useHidden()
  const [plotRef, { width }] = useElementSize()
  const [rootRef, entered] = useEntered(animate)
  const paint = usePaint()
  const fx = useFx()
  const [hover, setHover] = useState(null) // { i, y }
  const [focusSeries, setFocusSeries] = useState(null)
  const lastIndex = useRef(null)

  const visible = allSeries.map((s, i) => ({ ...s, index: i })).filter((s) => !hidden.has(s.key))
  const labels = data.map((d) => d[x])
  const n = data.length

  // Stacked areas draw each series on top of the ones before it.
  const tops = []
  const acc = new Array(n).fill(0)
  for (const s of visible) {
    const bottom = [...acc]
    const top = data.map((d, i) => (stacked ? (acc[i] += d[s.key] ?? 0) : (d[s.key] ?? 0)))
    tops.push({ s, top, bottom })
  }
  const all = tops.flatMap((t) => t.top)
  let lo = all.length ? Math.min(...all) : 0
  let hi = all.length ? Math.max(...all) : 1
  if (area || stacked || yZero) lo = Math.min(0, lo)
  if (!(area || stacked || yZero) && hi > lo) {
    const pad = (hi - lo) * 0.08
    lo -= pad
    hi += pad
  }
  const { ticks, min, max } = niceTicks(lo, hi, Math.max(2, Math.round(height / 55)))
  const tickLabels = ticks.map(format)

  const showEnd = axes && (endLabels ?? (visible.length >= 2 && visible.length <= 4))
  const m = axes
    ? { top: 10, right: showEnd ? 74 : 12, bottom: 26, left: gutterFor(tickLabels) }
    : { top: 4, right: 4, bottom: 4, left: 4 }
  const W = Math.max(0, width - m.left - m.right)
  const H = Math.max(0, height - m.top - m.bottom)
  const step = n > 1 ? W / (n - 1) : 0
  const xOf = (i) => m.left + (n > 1 ? i * step : W / 2)
  const y = linear([min, max], [m.top + H, m.top])
  const base = y(clamp(0, min, max))

  const shapes = tops.map(({ s, top, bottom }) => {
    const pts = top.map((v, i) => [xOf(i), y(v)])
    const low = stacked ? bottom.map((v, i) => [xOf(i), y(v)]) : pts.map(([px]) => [px, base])
    return { s, pts, line: linePath(pts, curve), area: area ? areaPath(pts, low, curve) : null }
  })

  // Direct labels at the line ends, nudged apart so they never overlap.
  const ends = showEnd
    ? shapes
        .map((sh) => ({ key: sh.s.key, label: sh.s.label, index: sh.s.index, y: sh.pts[n - 1]?.[1] ?? 0 }))
        .sort((a, b) => a.y - b.y)
        .reduce((out, e) => {
          const prev = out[out.length - 1]
          out.push({ ...e, y: prev ? Math.max(e.y, prev.y + 14) : e.y })
          return out
        }, [])
    : []

  const ready = width > 0 && n > 0
  const clipId = `${paint.id}-reveal`

  const onMove = (e) => {
    const r = e.currentTarget.ownerSVGElement.getBoundingClientRect()
    const px = e.clientX - r.left
    const i = clamp(Math.round((px - m.left) / (step || 1)), 0, n - 1)
    setHover({ i, y: e.clientY - r.top })
    if (fx && lastIndex.current !== i) {
      lastIndex.current = i
      sparkle(e)
    }
  }

  const showLegend = legend ?? allSeries.length > 1
  const hoverRows =
    hover &&
    [...visible].reverse().map((s) => ({
      label: s.label,
      index: s.index,
      value: tooltipFormat(data[hover.i][s.key] ?? 0),
      dim: focusSeries && focusSeries !== s.key,
    }))
  const total = hover && stacked && visible.length > 1 ? visible.reduce((t, s) => t + (data[hover.i][s.key] || 0), 0) : null

  return (
    <ChartShell
      innerRef={rootRef}
      title={title}
      subtitle={subtitle}
      actions={actions}
      card={card}
      className={cx('ui-lineplot', area && 'ui-lineplot--area', className)}
      legend={
        showLegend && (
          <Legend
            items={allSeries.map((s, i) => ({ key: s.key, label: s.label, index: i }))}
            hidden={hidden}
            onToggle={toggle}
            onHover={setFocusSeries}
            shape={area ? 'square' : 'line'}
          />
        )
      }
    >
      <div ref={plotRef} className="ui-chart__plot" onPointerLeave={() => ((lastIndex.current = null), setHover(null))}>
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel ?? `${title ?? kind}: ${allSeries.map((s) => s.label).join(', ')} over ${n} points`}
          data-hovering={hover || focusSeries ? true : undefined}
        >
          {paint.defs(allSeries.length)}
          <clipPath id={clipId}>
            <rect className="ui-lineplot__reveal" x="0" y="-20" height={height + 40} style={{ width: entered ? width + 20 : 0 }} />
          </clipPath>
          {ready && axes && <YAxis scale={y} ticks={ticks} x0={m.left} x1={m.left + W} format={format} grid={grid} zero={area ? 0 : undefined} />}
          {ready && axes && <XLabels labels={labels} xOf={xOf} y={m.top + H + 17} minGap={48} />}
          {ready && (
            <g clipPath={`url(#${clipId})`}>
              {area &&
                shapes.map((sh) => (
                  <path
                    key={`a-${sh.s.key}`}
                    className="ui-lineplot__area"
                    d={sh.area}
                    fill={stacked ? paint.fill(sh.s.index) : paint.areaFill(sh.s.index)}
                    data-stacked={stacked || undefined}
                    data-active={!focusSeries || focusSeries === sh.s.key || undefined}
                    style={{ color: paint.color(sh.s.index) }}
                  />
                ))}
              {shapes.map((sh) => (
                <path
                  key={`l-${sh.s.key}`}
                  className="ui-lineplot__line"
                  d={sh.line}
                  fill="none"
                  stroke={paint.color(sh.s.index)}
                  strokeDasharray={paint.dash(sh.s.index)}
                  data-active={!focusSeries || focusSeries === sh.s.key || undefined}
                  style={{ color: paint.color(sh.s.index) }}
                />
              ))}
              {dots &&
                n <= 60 &&
                shapes.map((sh) =>
                  sh.pts.map(([px, py], i) => (
                    <circle key={`d-${sh.s.key}-${i}`} className="ui-chart__dot ui-lineplot__dot" cx={px} cy={py} r="3.5" fill={paint.color(sh.s.index)} />
                  )),
                )}
            </g>
          )}
          {ready && paint.extra && !paint.reduced && entered && (
            <g className="ui-lineplot__comets" aria-hidden>
              {shapes.map((sh, k) => (
                <circle key={`c-${sh.s.key}-${sh.line.length}`} r="3.2" fill="#fff" style={{ color: paint.color(sh.s.index) }}>
                  <animateMotion dur={`${3.4 + k * 0.6}s`} begin={`${k * 0.45}s`} repeatCount="indefinite" path={sh.line} />
                </circle>
              ))}
            </g>
          )}
          {ready &&
            ends.map((e) => (
              <g key={e.key} className="ui-lineplot__end" style={{ opacity: entered ? 1 : 0 }}>
                <line x1={m.left + W + 6} x2={m.left + W + 12} y1={e.y} y2={e.y} stroke={paint.color(e.index)} strokeWidth="2.5" strokeLinecap="round" />
                <text x={m.left + W + 16} y={e.y} dy="0.32em">
                  {e.label}
                </text>
              </g>
            ))}
          {ready && hover && (
            <g aria-hidden>
              <line className="ui-chart__crosshair" x1={xOf(hover.i)} x2={xOf(hover.i)} y1={m.top} y2={m.top + H} />
              {shapes.map((sh) => (
                <circle key={sh.s.key} className="ui-chart__focus-dot ui-lineplot__focus" cx={xOf(hover.i)} cy={sh.pts[hover.i][1]} r="5" fill={paint.color(sh.s.index)} style={{ color: paint.color(sh.s.index) }} />
              ))}
            </g>
          )}
          {ready && <rect className="ui-chart__hit" x={m.left} y={m.top} width={W} height={H} onPointerMove={onMove} onClick={(e) => fx && burst(e)} />}
        </svg>
        {hover && (
          <Tooltip
            x={xOf(hover.i)}
            y={clamp(hover.y, m.top + 30, m.top + H - 30)}
            width={width}
            title={labels[hover.i]}
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
