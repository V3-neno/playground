import { useEffect, useRef } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { useElementSize } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { ChartShell } from '../_shared/parts'
import { arcStroke, clamp, formatNumber, polar } from '../_shared/scale'
import { useEntered, useTween } from '../_shared/useChart'
import './Gauge.css'

const DEFAULT_ZONES = [
  { to: 60, tone: 'success', label: 'Healthy' },
  { to: 85, tone: 'warning', label: 'Elevated' },
  { to: Infinity, tone: 'danger', label: 'Critical' },
]
const TONE_ICON = { success: 'check-circle', warning: 'alert', danger: 'x-circle' }

/**
 * A single value against a range, with status zones. The needle swings in on a spring; the zone's
 * status ships as icon + label, never colour alone.
 */
export function Gauge({
  value = 0,
  min = 0,
  max = 100,
  label,
  unit = '',
  zones = DEFAULT_ZONES,
  sweep = 240,
  size = 240,
  thickness = 16,
  needle = true,
  ticks = true,
  showStatus = true,
  animate = true,
  format = (v) => formatNumber(Math.round(v)),
  title,
  subtitle,
  actions,
  card = false,
  className,
  'aria-label': ariaLabel,
}) {
  const [boxRef, { width }] = useElementSize()
  const [rootRef, entered] = useEntered(animate)
  const fx = useFx()
  const svgRef = useRef(null)
  const v = clamp(value, min, max)
  const shown = useTween(entered ? v : min, { duration: 1200, enabled: animate, from: min })

  const s = Math.max(120, Math.min(size, width || size))
  const r = s / 2 - thickness / 2 - 14
  const cx0 = s / 2
  const cy0 = s / 2
  const half = ((sweep / 2) * Math.PI) / 180
  const angle = (val) => -half + ((clamp(val, min, max) - min) / (max - min || 1)) * half * 2
  const below = Math.max(0, -Math.cos(half)) * (r + thickness / 2)
  // Room below the pivot for whichever is taller: the arc's lower ends + limit labels, or the readout.
  const h = cy0 + Math.max(below + 22, needle ? 84 : 30)

  const zoneAt = (val) => zones.find((z) => val <= z.to) ?? zones[zones.length - 1]
  const zone = zoneAt(v)
  const liveZone = zoneAt(shown)
  const tone = `var(--ui-${liveZone.tone})`

  // Zone bands just outside the track
  let from = min
  const bands = zones.map((z) => {
    const to = Math.min(z.to, max)
    const band = { ...z, d: arcStroke(cx0, cy0, r + thickness / 2 + 6, angle(from), angle(to)) }
    from = to
    return band
  })

  const tickVals = ticks ? Array.from({ length: 11 }, (_, i) => min + ((max - min) * i) / 10) : []
  const needleDeg = ((entered ? angle(v) : angle(min)) * 180) / Math.PI

  // Extra: sparks fly from the needle tip whenever the value changes.
  const prev = useRef(v)
  useEffect(() => {
    if (!fx || !entered || prev.current === v || !svgRef.current) {
      prev.current = v
      return
    }
    prev.current = v
    const t = setTimeout(() => {
      const el = svgRef.current
      if (!el) return
      const box = el.getBoundingClientRect()
      const [tx, ty] = polar(cx0, cy0, r, angle(v))
      burst({ currentTarget: el, clientX: box.left + tx, clientY: box.top + ty }, { count: 16, spread: 60, colors: [tone, '#fff'] })
    }, 500)
    return () => clearTimeout(t)
  }, [v, fx, entered]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ChartShell innerRef={rootRef} title={title} subtitle={subtitle} actions={actions} card={card} className={cx('ui-gauge', className)}>
      <div ref={boxRef} className="ui-gauge__box" style={{ maxWidth: size }} data-tone={liveZone.tone}>
        <svg
          ref={svgRef}
          width={s}
          height={h}
          role="meter"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={v}
          aria-valuetext={`${format(v)}${unit}${showStatus ? `, ${zone.label}` : ''}`}
          aria-label={ariaLabel ?? label ?? title ?? 'Gauge'}
        >
          <path className="ui-gauge__track" d={arcStroke(cx0, cy0, r, -half, half)} strokeWidth={thickness} fill="none" />
          {bands.map((b) => (
            <path key={b.label} className="ui-gauge__band" d={b.d} fill="none" style={{ stroke: `var(--ui-${b.tone})` }} />
          ))}
          {shown > min && (
            <path className="ui-gauge__value" d={arcStroke(cx0, cy0, r, -half, angle(shown))} strokeWidth={thickness} fill="none" style={{ stroke: tone, color: tone }} />
          )}
          {tickVals.map((t, i) => {
            const a = angle(t)
            const [x1, y1] = polar(cx0, cy0, r - thickness / 2 - 4, a)
            const [x2, y2] = polar(cx0, cy0, r - thickness / 2 - (i % 5 === 0 ? 11 : 7), a)
            return <line key={i} className="ui-gauge__tick" data-major={i % 5 === 0 || undefined} data-lit={t <= shown || undefined} x1={x1} y1={y1} x2={x2} y2={y2} />
          })}
          {ticks &&
            [min, max].map((t, i) => {
              const [x, y] = polar(cx0, cy0, r + thickness / 2 + 2, angle(t))
              return (
                <text key={i} className="ui-gauge__limit" x={x + (i ? -2 : 2)} y={y + 16} textAnchor={i ? 'end' : 'start'}>
                  {format(t)}
                </text>
              )
            })}
          {needle && (
            <g className="ui-gauge__needle" style={{ transform: `rotate(${needleDeg}deg)`, transformOrigin: `${cx0}px ${cy0}px` }}>
              <path d={`M${cx0 - 3.5},${cy0} L${cx0},${cy0 - r + thickness / 2 + 2} L${cx0 + 3.5},${cy0} Z`} />
              <circle cx={cx0} cy={cy0} r="8" className="ui-gauge__pivot" />
            </g>
          )}
        </svg>
        <div className="ui-gauge__readout" style={{ top: needle ? cy0 + 16 : cy0 - 28 }}>
          <div className="ui-gauge__value-text ui-heading">
            {format(shown)}
            {unit && <span className="ui-gauge__unit">{unit}</span>}
          </div>
          {label && <div className="ui-gauge__label">{label}</div>}
          {showStatus && (
            <div className="ui-gauge__status" style={{ color: tone }}>
              <Icon name={TONE_ICON[liveZone.tone] ?? 'info'} size={13} />
              <span>{liveZone.label}</span>
            </div>
          )}
        </div>
      </div>
    </ChartShell>
  )
}
