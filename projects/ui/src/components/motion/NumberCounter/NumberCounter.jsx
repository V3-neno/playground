import { useEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { useInView } from '../../../lib/hooks'
import { useReducedMotion } from '../../../lib/ui-context'
import './NumberCounter.css'

const EASINGS = {
  linear: (t) => t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  spring: (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2), // a little overshoot
}

/**
 * Counts to `value` once it scrolls into view, and tweens again whenever `value` changes.
 * variant: 'count' (tweened number) | 'odometer' (rolling digit columns).
 * format: extra Intl.NumberFormat options, e.g. { style: 'currency', currency: 'EUR' } or { notation: 'compact' }.
 */
export function NumberCounter({
  value,
  from = 0,
  duration = 1600,
  decimals = 0,
  prefix = '',
  suffix = '',
  locale,
  format,
  easing = 'out',
  variant = 'count',
  startOnView = true,
  className,
}) {
  const fx = useFx()
  const reduced = useReducedMotion()
  const [ref, inView] = useInView({ once: true, threshold: 0.3 })
  const started = !startOnView || inView
  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, ...format }),
    [locale, decimals, format],
  )
  const finalText = `${prefix}${fmt.format(value)}${suffix}`

  return (
    <span ref={ref} className={cx('ui-counter', `ui-counter--${variant}`, className)}>
      <span className="ui-sr-only">{finalText}</span>
      <span aria-hidden="true" className="ui-counter__visual">
        {variant === 'odometer' ? (
          <Odometer text={finalText} active={started || reduced} duration={duration} instant={reduced} spins={fx ? 2 : 0} onDone={fx ? (el) => burst(el, { count: 20, spread: 80 }) : null} />
        ) : (
          <Tween value={started ? value : from} from={from} duration={duration} easing={EASINGS[easing] ?? EASINGS.out} instant={reduced} render={(n) => `${prefix}${fmt.format(n)}${suffix}`} onDone={fx ? (el) => burst(el, { count: 20, spread: 80 }) : null} />
        )}
      </span>
    </span>
  )
}

function Tween({ value, from, duration, easing, instant, render, onDone }) {
  const [shown, setShown] = useState(instant ? value : from)
  const shownRef = useRef(shown)
  const el = useRef(null)
  shownRef.current = shown
  useEffect(() => {
    if (instant) return setShown(value)
    const start = shownRef.current
    if (start === value) return
    const t0 = performance.now()
    let id
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration)
      setShown(start + (value - start) * easing(t))
      if (t < 1) id = requestAnimationFrame(step)
      else if (onDone && el.current) onDone(el.current)
    }
    id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [value, duration, instant]) // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={el}>{render(shown)}</span>
}

const DIGITS = '0123456789'

// Starts at all zeros and rolls once `active`. Each digit is a vertical strip of 0-9 (repeated `spins + 1` times) translated to the right row.
// Columns are keyed from the right so the ones digit stays the ones digit when the length changes.
function Odometer({ text, active, duration, instant, spins, onDone }) {
  const el = useRef(null)
  const [ready, setReady] = useState(instant)
  useEffect(() => {
    if (instant || !active) return
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [instant, active])
  useEffect(() => {
    if (!ready || instant || !onDone) return
    const t = setTimeout(() => el.current && onDone(el.current), duration)
    return () => clearTimeout(t)
  }, [text, ready]) // eslint-disable-line react-hooks/exhaustive-deps
  const chars = [...text]
  const strip = DIGITS.repeat(spins + 1)
  return (
    <span ref={el} className="ui-counter__odometer">
      {chars.map((c, i) => {
        const key = chars.length - i
        if (!DIGITS.includes(c)) {
          return (
            <span key={`s${key}`} className="ui-counter__sym">
              {c}
            </span>
          )
        }
        const row = ready ? Number(c) + spins * 10 : 0
        return (
          <span key={`d${key}`} className="ui-counter__col">
            <span
              className="ui-counter__strip"
              style={{
                "--_row": row,
                transitionDuration: instant ? '0ms' : `${duration}ms`,
                transitionDelay: instant ? '0ms' : `${(chars.length - i) * 40}ms`,
              }}
            >
              {[...strip].map((d, k) => (
                <span key={k}>{d}</span>
              ))}
            </span>
            <span className="ui-counter__sizer">{c}</span>
          </span>
        )
      })}
    </span>
  )
}
