import { useEffect, useRef } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { useControllable } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import './Stepper.css'

/**
 * Progress through a multi-step flow.
 * steps: [{ label, description?, icon? }]
 * current: index of the active step; current === steps.length means everything is complete.
 * clickable: steps become buttons that jump to that step.
 */
export function Stepper({
  steps,
  current,
  defaultCurrent = 0,
  onChange,
  orientation = 'horizontal',
  clickable = false,
  size = 'md',
  className,
  ...props
}) {
  const [active, setActive] = useControllable(current, defaultCurrent, onChange)
  const fx = useFx()
  const markers = useRef([])
  const prev = useRef(active)

  // Extra: confetti from each step you complete, and a bigger party when the whole flow is done.
  useEffect(() => {
    const was = prev.current
    prev.current = active
    if (!fx || active <= was) return
    const done = markers.current[active - 1]
    if (active >= steps.length) {
      const last = markers.current[steps.length - 1]
      last && burst(last, { count: 60, spread: 200, shapes: ['🎉', 'star', 'circle', '✨', 'strip'] })
    } else if (done) burst(done, { count: 22, spread: 90 })
  }, [active, fx, steps.length])

  const progress = steps.length > 1 ? Math.min(1, active / (steps.length - 1)) : 1

  return (
    <ol
      aria-label="Progress"
      className={cx('ui-stepper', `ui-stepper--${orientation}`, `ui-stepper--${size}`, clickable && 'ui-stepper--clickable', className)}
      style={{ '--steps': steps.length, '--progress': progress }}
      {...props}
    >
      {steps.map((step, i) => {
        const status = i < active ? 'complete' : i === active ? 'current' : 'upcoming'
        const Marker = clickable ? 'button' : 'span'
        return (
          <li key={i} className="ui-stepper__step" data-status={status} aria-current={status === 'current' ? 'step' : undefined}>
            {i < steps.length - 1 && <span className="ui-stepper__connector" aria-hidden />}
            <Marker
              ref={(el) => (markers.current[i] = el)}
              className="ui-stepper__marker"
              type={clickable ? 'button' : undefined}
              onClick={clickable ? () => setActive(i) : undefined}
              aria-label={clickable ? `Go to step ${i + 1}: ${step.label}` : undefined}
            >
              {status === 'complete' ? (
                <Icon name="check" size={size === 'sm' ? 13 : 16} strokeWidth={3} className="ui-stepper__check" />
              ) : step.icon ? (
                <Icon name={step.icon} size={size === 'sm' ? 13 : 16} />
              ) : (
                <span className="ui-stepper__num">{i + 1}</span>
              )}
            </Marker>
            <div className="ui-stepper__text">
              <span className="ui-stepper__label">{step.label}</span>
              {step.description && <span className="ui-stepper__desc">{step.description}</span>}
              <span className="ui-sr-only">{status === 'complete' ? ' (completed)' : status === 'current' ? ' (current)' : ''}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
