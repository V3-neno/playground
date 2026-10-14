import { useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, sparkle, useFx } from '../../../lib/fx'
import { useElementSize } from '../../../lib/hooks'
import { ChartShell, DataTable, Tooltip } from '../_shared/parts'
import { clamp, formatNumber } from '../_shared/scale'
import { gutterFor, useEntered, usePaint } from '../_shared/useChart'
import './Heatmap.css'

const GAP = 2

/**
 * Magnitude across two dimensions. values[row][col] (null = no data).
 * Sequential: one hue, light to dark. Diverging (data crosses zero): two hues with a neutral middle.
 * levels > 0 quantises into steps (like a contribution calendar); 0 = continuous.
 */
export function Heatmap({
  rows = [],
  columns = [],
  rowTitles = rows, // full names for the tooltip when axis labels are abbreviated or blank
  columnTitles = columns,
  values = [],
  levels = 5,
  diverging = false,
  maxCell = 34,
  colLabelEvery,
  showValues = false,
  legend = true,
  animate = true,
  format = formatNumber,
  unit = '',
  title,
  subtitle,
  actions,
  card = false,
  className,
  'aria-label': ariaLabel,
}) {
  const [boxRef, { width }] = useElementSize()
  const [rootRef, entered] = useEntered(animate)
  const paint = usePaint()
  const fx = useFx()
  const [hover, setHover] = useState(null) // { r, c }

  const flat = values.flat().filter((v) => v != null)
  const lo = flat.length ? Math.min(...flat) : 0
  const hi = flat.length ? Math.max(...flat) : 1
  const span = diverging ? Math.max(Math.abs(lo), Math.abs(hi)) || 1 : hi - lo || 1

  /** -1..1 (diverging) or 0..1 (sequential), quantised when levels > 0 */
  const norm = (v) => {
    let t = diverging ? v / span : (v - lo) / span
    if (levels > 0) t = diverging ? Math.sign(t) * Math.ceil(Math.abs(t) * levels) / levels : Math.ceil(t * levels) / levels
    return clamp(t, diverging ? -1 : 0, 1)
  }
  const colorOf = (t) => {
    if (diverging) {
      const hue = t < 0 ? 'var(--ui-chart-5)' : 'var(--ui-chart-1)'
      return `color-mix(in oklab, ${hue} ${Math.round(Math.abs(t) * 92)}%, var(--ui-surface-2))`
    }
    return `color-mix(in oklab, var(--ui-chart-1) ${Math.round(t === 0 ? 8 : 14 + t * 86)}%, var(--ui-surface-2))`
  }

  const labelW = rows.some(Boolean) ? gutterFor(rows, 20) : 0
  const top = columns.some(Boolean) ? 20 : 0
  const cell = Math.max(6, Math.min(maxCell, Math.floor(((width || 600) - labelW - 4) / Math.max(1, columns.length) - GAP)))
  const step = cell + GAP
  const svgW = labelW + columns.length * step
  const svgH = top + rows.length * step
  const every = colLabelEvery ?? Math.max(1, Math.ceil(30 / step))
  const rx = paint.style === 'playful' ? cell / 2 : Math.min(paint.radius, cell / 4)

  const onEnter = (e, r, c, t) => {
    setHover({ r, c })
    if (fx) sparkle(e, { colors: [colorOf(t), '#fff'] })
  }

  const hv = hover && values[hover.r]?.[hover.c]
  const legendSteps = diverging ? [-1, -0.5, 0, 0.5, 1] : Array.from({ length: Math.max(2, levels || 5) }, (_, i) => (i + 1) / Math.max(2, levels || 5))

  return (
    <ChartShell innerRef={rootRef} title={title} subtitle={subtitle} actions={actions} card={card} className={cx('ui-heatmap', className)}>
      <div ref={boxRef} className="ui-chart__plot ui-heatmap__plot" onPointerLeave={() => setHover(null)}>
        {width > 0 && (
          <svg
            width={svgW}
            height={svgH}
            role="img"
            aria-label={ariaLabel ?? `${title ?? 'Heatmap'}: ${rows.length} rows by ${columns.length} columns, from ${format(lo)} to ${format(hi)}${unit}`}
            data-hovering={hover ? true : undefined}
          >
            <g className="ui-chart__axis ui-heatmap__cols" aria-hidden>
              {columns.map((c, i) =>
                c !== '' && i % every === 0 ? (
                  <text key={i} x={labelW + i * step + cell / 2} y={12} textAnchor="middle" data-active={hover?.c === i || undefined}>
                    {c}
                  </text>
                ) : null,
              )}
            </g>
            <g className="ui-chart__axis ui-heatmap__rows" aria-hidden>
              {rows.map((r, i) => (
                <text key={i} x={labelW - 8} y={top + i * step + cell / 2} dy="0.32em" textAnchor="end" data-active={hover?.r === i || undefined}>
                  {r}
                </text>
              ))}
            </g>
            <g className="ui-heatmap__cells">
              {rows.map((_, r) =>
                columns.map((__, c) => {
                  const v = values[r]?.[c]
                  const empty = v == null
                  const t = empty ? 0 : norm(v)
                  const active = hover && hover.r === r && hover.c === c
                  return (
                    <rect
                      key={`${r}-${c}`}
                      className="ui-heatmap__cell"
                      x={labelW + c * step}
                      y={top + r * step}
                      width={cell}
                      height={cell}
                      rx={rx}
                      data-empty={empty || undefined}
                      data-hot={!empty && Math.abs(t) >= 0.8 ? true : undefined}
                      data-active={active || undefined}
                      data-line={hover && (hover.r === r || hover.c === c) ? true : undefined}
                      style={{
                        fill: empty ? undefined : colorOf(t),
                        color: empty ? undefined : colorOf(t),
                        opacity: entered ? undefined : 0,
                        transform: entered ? undefined : 'scale(0.2)',
                        transitionDelay: entered ? `${c * 14 + r * 22}ms` : '0ms',
                        animationDelay: `${(r + c) * 90}ms`,
                      }}
                      onPointerEnter={(e) => onEnter(e, r, c, t)}
                      onClick={(e) => fx && !empty && burst(e, { colors: [colorOf(t), 'var(--ui-chart-2)', '#fff'] })}
                    />
                  )
                }),
              )}
            </g>
            {showValues && cell >= 26 && (
              <g className="ui-heatmap__values" aria-hidden>
                {rows.map((_, r) =>
                  columns.map((__, c) => {
                    const v = values[r]?.[c]
                    if (v == null) return null
                    const t = Math.abs(norm(v))
                    return (
                      <text key={`${r}-${c}`} x={labelW + c * step + cell / 2} y={top + r * step + cell / 2} dy="0.32em" textAnchor="middle" data-dark={t > 0.55 || undefined}>
                        {format(v)}
                      </text>
                    )
                  }),
                )}
              </g>
            )}
          </svg>
        )}
        {hover && (
          <Tooltip
            x={labelW + hover.c * step + cell / 2}
            y={top + hover.r * step + cell / 2}
            width={svgW}
            title={`${rowTitles[hover.r]} · ${columnTitles[hover.c]}`}
            rows={[{ label: 'Value', value: hv == null ? 'No data' : `${format(hv)}${unit}` }]}
          />
        )}
      </div>
      {legend && (
        <div className="ui-heatmap__legend" aria-hidden>
          <span>{diverging ? format(-span) : 'Less'}</span>
          {legendSteps.map((t) => (
            <span key={t} className="ui-heatmap__legend-cell" style={{ background: colorOf(t), borderRadius: paint.style === 'playful' ? '50%' : Math.min(paint.radius, 3) }} />
          ))}
          <span>{diverging ? format(span) : 'More'}</span>
        </div>
      )}
      <DataTable
        caption={title}
        columns={['', ...columns]}
        rows={rows.map((r, i) => [r, ...columns.map((_, c) => (values[i]?.[c] == null ? '–' : `${format(values[i][c])}${unit}`))])}
      />
    </ChartShell>
  )
}
