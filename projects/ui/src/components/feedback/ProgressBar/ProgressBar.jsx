import { useEffect, useId, useRef } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import './ProgressBar.css'

/**
 * Linear progress. Omit `value` (or pass indeterminate) for an unknown duration.
 * tone: accent | success | warning | danger. In Extra, reaching 100% sets off confetti.
 */
export function ProgressBar({
  value,
  max = 100,
  indeterminate = value == null,
  label,
  showValue = false,
  size = 'md',
  tone = 'accent',
  striped = false,
  className,
  ...props
}) {
  const id = useId()
  const fx = useFx()
  const track = useRef(null)
  const prev = useRef(null)
  const pct = indeterminate ? 0 : Math.min(100, Math.max(0, ((value ?? 0) / max) * 100))

  useEffect(() => {
    // Celebrate the moment we cross 100%, not on first render at 100%.
    if (fx && !indeterminate && pct >= 100 && prev.current != null && prev.current < 100 && track.current) {
      const r = track.current.getBoundingClientRect()
      // burst() finds the .ui-root through `target`, and uses clientX/Y as the origin (the fill's leading edge)
      burst({ target: track.current, clientX: r.right - 4, clientY: r.top + r.height / 2 }, { count: 36, spread: 110 })
    }
    prev.current = pct
  }, [pct, fx, indeterminate])

  return (
    <div
      className={cx('ui-progress', `ui-progress--${size}`, `ui-progress--${tone}`, striped && 'is-striped', indeterminate && 'is-indeterminate', pct >= 100 && 'is-complete', !indeterminate && pct === 0 && 'is-empty', className)}
      {...props}
    >
      {(label || (showValue && !indeterminate)) && (
        <div className="ui-progress__head">
          {label && <span id={id}>{label}</span>}
          {showValue && !indeterminate && <span className="ui-progress__value">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        ref={track}
        className="ui-progress__track"
        role="progressbar"
        aria-labelledby={label ? id : undefined}
        aria-label={label ? undefined : 'Progress'}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        aria-busy={indeterminate || undefined}
        style={{ '--_pct': `${pct}%` }}
      >
        <div className="ui-progress__fill" />
      </div>
    </div>
  )
}
