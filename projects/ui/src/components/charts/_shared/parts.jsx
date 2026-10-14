// Pieces every chart is built from: the card shell, legend, tooltip, axes and the screen-reader table.
import { cx } from '../../../lib/cx'
import { useUI } from '../../../lib/ui-context'
import { seriesColor } from './useChart'
import './chart.css'

/** Optional card (title, subtitle, actions) around a chart. Without `card` it's just a wrapper. */
export function ChartShell({ title, subtitle, actions, card = false, legend, className, innerRef, children, style }) {
  return (
    <figure ref={innerRef} className={cx('ui-chart', card && 'ui-chart--card', className)} style={style}>
      {(title || subtitle || actions) && (
        <figcaption className="ui-chart__head">
          <div>
            {title && <div className="ui-chart__title ui-heading">{title}</div>}
            {subtitle && <div className="ui-chart__subtitle">{subtitle}</div>}
          </div>
          {actions && <div className="ui-chart__actions">{actions}</div>}
        </figcaption>
      )}
      {legend}
      {children}
    </figure>
  )
}

/** Colour chip for a series. Mono swaps the flat colour for that series' hatch. */
export function Swatch({ i, shape = 'square' }) {
  const { style } = useUI()
  const c = seriesColor(i)
  const angles = [45, -45, 0, 90, 45, -45]
  const bg =
    style === 'mono'
      ? shape === 'line'
        ? `repeating-linear-gradient(90deg, ${c} 0 ${[14, 4, 2, 6, 1, 7][i % 6]}px, transparent 0 ${[14, 6, 4, 8, 3, 10][i % 6]}px)`
        : `repeating-linear-gradient(${angles[i % 6] + 90}deg, ${c} 0 2px, transparent 2px 5px)`
      : style === 'extra'
        ? `linear-gradient(135deg, ${seriesColor(i + 1)}, ${c})`
        : c
  return <span className={cx('ui-chart__swatch', `ui-chart__swatch--${shape}`)} style={{ background: bg, color: c }} />
}

/**
 * Legend. Clicking an item toggles its series (if onToggle is given); hovering highlights it.
 * items: [{ key, label, index, value? }]
 */
export function Legend({ items, hidden, onToggle, onHover, shape, className }) {
  return (
    <ul className={cx('ui-chart__legend', className)}>
      {items.map((it) => {
        const off = hidden?.has(it.key)
        const Tag = onToggle ? 'button' : 'span'
        return (
          <li key={it.key}>
            <Tag
              type={onToggle ? 'button' : undefined}
              className="ui-chart__legend-item"
              data-off={off || undefined}
              aria-pressed={onToggle ? !off : undefined}
              onClick={onToggle ? () => onToggle(it.key) : undefined}
              onPointerEnter={onHover ? () => onHover(it.key) : undefined}
              onPointerLeave={onHover ? () => onHover(null) : undefined}
            >
              <Swatch i={it.index} shape={shape} />
              <span>{it.label}</span>
              {it.value != null && <span className="ui-chart__legend-value">{it.value}</span>}
            </Tag>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Tooltip positioned inside a `.ui-chart__plot` (position: relative).
 * Flips to the left of the point when it would overflow the right edge.
 */
export function Tooltip({ x, y, width, title, rows = [], footer, visible = true }) {
  if (!visible) return null
  const flip = x > width * 0.62
  return (
    <div
      className="ui-chart__tooltip"
      role="status"
      style={{ left: x, top: y, transform: `translate(${flip ? 'calc(-100% - 14px)' : '14px'}, -50%)` }}
    >
      {title != null && <div className="ui-chart__tooltip-title">{title}</div>}
      {rows.map((r) => (
        <div key={r.label} className="ui-chart__tooltip-row" data-dim={r.dim || undefined}>
          {r.index != null && <Swatch i={r.index} shape="dot" />}
          <span className="ui-chart__tooltip-label">{r.label}</span>
          <span className="ui-chart__tooltip-value">{r.value}</span>
        </div>
      ))}
      {footer && <div className="ui-chart__tooltip-footer">{footer}</div>}
    </div>
  )
}

/** Horizontal gridlines + tick labels for a vertical value axis. */
export function YAxis({ scale, ticks, x0, x1, format, grid = true, zero }) {
  return (
    <g className="ui-chart__axis ui-chart__axis--y" aria-hidden>
      {ticks.map((t) => {
        const y = scale(t)
        return (
          <g key={t}>
            {grid && <line className={cx('ui-chart__grid', t === zero && 'ui-chart__grid--zero')} x1={x0} x2={x1} y1={y} y2={y} />}
            <text x={x0 - 8} y={y} dy="0.32em" textAnchor="end">
              {format(t)}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/** Vertical gridlines + labels for a horizontal value axis (horizontal bar charts). */
export function XValueAxis({ scale, ticks, y0, y1, format, grid = true, zero }) {
  return (
    <g className="ui-chart__axis ui-chart__axis--x" aria-hidden>
      {ticks.map((t) => {
        const x = scale(t)
        return (
          <g key={t}>
            {grid && <line className={cx('ui-chart__grid', t === zero && 'ui-chart__grid--zero')} x1={x} x2={x} y1={y0} y2={y1} />}
            <text x={x} y={y1 + 16} textAnchor="middle">
              {format(t)}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/** Category labels along the bottom, thinned so they never collide. */
export function XLabels({ labels, xOf, y, minGap = 44, anchor = 'middle' }) {
  if (!labels.length) return null
  const span = labels.length > 1 ? Math.abs(xOf(1) - xOf(0)) : minGap
  const every = Math.max(1, Math.ceil(minGap / Math.max(1, span)))
  const last = labels.length - 1
  // Show every Nth label, plus the last one when it isn't crowding the previous shown label.
  const show = (i) => i % every === 0 || (i === last && last - Math.floor(last / every) * every >= every * 0.6)
  return (
    <g className="ui-chart__axis ui-chart__axis--x" aria-hidden>
      {labels.map((l, i) =>
        show(i) ? (
          <text key={i} x={xOf(i)} y={y} textAnchor={anchor}>
            {l}
          </text>
        ) : null,
      )}
    </g>
  )
}

/** The data as a table, visually hidden, so screen readers get the numbers rather than a picture. */
export function DataTable({ caption, columns, rows }) {
  return (
    <table className="ui-sr-only">
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i} scope="col">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((v, j) => (j === 0 ? <th key={j} scope="row">{v}</th> : <td key={j}>{v}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
