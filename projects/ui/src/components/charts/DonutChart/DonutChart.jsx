import { useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, sparkle, useFx } from '../../../lib/fx'
import { useElementSize } from '../../../lib/hooks'
import { ChartShell, DataTable, Legend } from '../_shared/parts'
import { arcPath, formatCompact, formatNumber, sum } from '../_shared/scale'
import { seriesColor, useEntered, usePaint, useTween } from '../_shared/useChart'
import './DonutChart.css'

const GAP = 2 // px of surface between slices

/**
 * Part-to-whole for a handful of categories (≤ 6; fold the rest into "Other").
 * data: [{ label, value }]. Hovering a slice or legend item pulls it out and shows it in the middle.
 */
export function DonutChart({
  data = [],
  size = 220,
  thickness = 0.3,
  half = false,
  centerLabel = 'Total',
  centerValue,
  legend = true,
  showPercent = true,
  animate = true,
  format = formatCompact,
  tooltipFormat = formatNumber,
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
  const [active, setActive] = useState(null)
  const progress = useTween(entered ? 1 : 0, { duration: 1100, enabled: animate, from: 0 })

  const total = sum(data.map((d) => d.value))
  const s = Math.max(0, Math.min(size, width || size))
  const r1 = s / 2 - 8 // leave room for the hover pull-out
  const r0 = Math.max(0, r1 * (1 - thickness))
  const cx0 = s / 2
  const cy0 = half ? r1 + 8 : s / 2
  const start = half ? -Math.PI / 2 : 0
  const sweep = half ? Math.PI : Math.PI * 2
  const end = start + sweep * progress
  const pad = data.length > 1 ? GAP / r1 : 0

  let acc = start
  const slices = data.map((d, i) => {
    const a0 = acc
    const a1 = acc + (total ? (d.value / total) * sweep : 0)
    acc = a1
    const shown = Math.min(a1, end)
    const p0 = a0 + (a1 - a0 > pad ? pad / 2 : 0)
    const p1 = shown - (a1 - a0 > pad && shown === a1 ? pad / 2 : 0)
    const mid = (a0 + a1) / 2
    return { d, i, a0, a1, mid, path: p1 > p0 ? arcPath(cx0, cy0, r0, r1, p0, p1) : '' }
  })

  const pct = (v) => (total ? `${Math.round((v / total) * 1000) / 10}%` : '0%')
  const hot = active != null ? data[active] : null
  const svgH = half ? r1 + 16 : s

  // Largest font (px) that keeps the centre text inside the hole (1.5·r0 wide). Display/mono faces run wider per character.
  const charW = { extra: 0.92, mono: 0.66, brutalist: 0.72 }[paint.style] ?? 0.62
  const fit = (text) => Math.round(Math.max(11, Math.min(30, (r0 * 1.5) / (charW * Math.max(3, String(text).length)))))

  const enter = (i, e) => {
    setActive(i)
    if (fx && e) sparkle(e, { colors: [seriesColor(i), '#fff'] })
  }

  return (
    <ChartShell innerRef={rootRef} title={title} subtitle={subtitle} actions={actions} card={card} className={cx('ui-donut', half && 'ui-donut--half', className)}>
      <div className="ui-donut__body">
        <div ref={boxRef} className="ui-donut__box" style={{ maxWidth: size }}>
          {paint.extra && <div className="ui-donut__halo" aria-hidden style={{ width: s, height: half ? s / 2 + 8 : s }} />}
          <svg
            width={s}
            height={svgH}
            role="img"
            aria-label={ariaLabel ?? `${title ?? 'Donut chart'}: ${data.map((d) => `${d.label} ${pct(d.value)}`).join(', ')}`}
            data-hovering={active != null || undefined}
            onPointerLeave={() => setActive(null)}
          >
            {paint.defs(data.length)}
            {r0 > 0 && <circle className="ui-donut__track" cx={cx0} cy={cy0} r={(r0 + r1) / 2} strokeWidth={r1 - r0} fill="none" style={half ? { display: 'none' } : undefined} />}
            {slices.map((sl) =>
              sl.path ? (
                <path
                  key={sl.i}
                  className="ui-donut__slice"
                  d={sl.path}
                  fill={paint.fill(sl.i)}
                  data-active={active === sl.i || undefined}
                  style={{
                    color: seriesColor(sl.i),
                    transform: active === sl.i ? `translate(${Math.sin(sl.mid) * 6}px, ${-Math.cos(sl.mid) * 6}px)` : undefined,
                  }}
                  onPointerEnter={(e) => enter(sl.i, e)}
                  onClick={(e) => fx && burst(e, { colors: [seriesColor(sl.i), seriesColor(sl.i + 1), '#fff'] })}
                />
              ) : null,
            )}
          </svg>
          <div className="ui-donut__center" style={half ? { top: 'auto', bottom: 6, height: 'auto' } : undefined} aria-hidden>
            {r0 > 30 && (
              <>
                <div className="ui-donut__center-label">{hot ? hot.label : centerLabel}</div>
                <div className="ui-donut__center-value ui-heading" style={{ fontSize: fit(hot ? tooltipFormat(hot.value) : (centerValue ?? format(total))) }}>
                  {hot ? tooltipFormat(hot.value) : (centerValue ?? format(Math.round(total * progress)))}
                </div>
                {hot && showPercent && <div className="ui-donut__center-pct">{pct(hot.value)}</div>}
              </>
            )}
          </div>
        </div>
        {legend && (
          <Legend
            className="ui-donut__legend"
            items={data.map((d, i) => ({ key: i, label: d.label, index: i, value: showPercent ? pct(d.value) : format(d.value) }))}
            onHover={(k) => setActive(k)}
          />
        )}
      </div>
      <DataTable caption={title} columns={['Category', 'Value', 'Share']} rows={data.map((d) => [d.label, tooltipFormat(d.value), pct(d.value)])} />
    </ChartShell>
  )
}
