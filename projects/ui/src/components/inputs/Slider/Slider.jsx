import { useId, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { useControllable } from '../../../lib/hooks'
import './Slider.css'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/**
 * Single value (number) or range ([low, high]) slider. Pointer drag anywhere on the track,
 * arrows / PageUp / PageDown / Home / End on each thumb.
 */
export function Slider({
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  range = false,
  marks,
  label,
  showValue = 'hover', // 'always' | 'hover' | 'never'
  format = (v) => v,
  disabled,
  className,
}) {
  const initial = defaultValue ?? (range ? [min + (max - min) * 0.25, min + (max - min) * 0.75] : min + (max - min) / 2)
  const [val, setVal] = useControllable(value, initial, onChange)
  const values = range ? val : [val]
  const [dragging, setDragging] = useState(-1)
  const track = useRef(null)
  const id = useId()
  const fx = useFx()
  const lastEdge = useRef(null)

  const pct = (v) => ((v - min) / (max - min)) * 100
  const snap = (v) => {
    const s = Math.round((v - min) / step) * step + min
    return clamp(Number(s.toFixed(10)), min, max)
  }

  const update = (i, v, el) => {
    const next = [...values]
    next[i] = snap(v)
    if (range) {
      // Thumbs can't cross.
      if (i === 0) next[0] = Math.min(next[0], values[1])
      else next[1] = Math.max(next[1], values[0])
    }
    if (next[i] === values[i]) return
    setVal(range ? next : next[0])
    // Extra: confetti when you slam into either end.
    const edge = next[i] === max ? 'max' : next[i] === min ? 'min' : null
    if (fx && edge && lastEdge.current !== edge && el) burst(el, { count: 16, spread: 60 })
    lastEdge.current = edge
  }

  const fromPointer = (e) => {
    const r = track.current.getBoundingClientRect()
    return min + clamp((e.clientX - r.left) / r.width, 0, 1) * (max - min)
  }

  const onPointerDown = (e) => {
    if (disabled || e.button !== 0) return
    const v = fromPointer(e)
    // Grab the nearest thumb.
    const i = range ? (Math.abs(v - values[0]) <= Math.abs(v - values[1]) ? 0 : 1) : 0
    setDragging(i)
    update(i, v, track.current.querySelectorAll('.ui-slider__thumb')[i])
    track.current.setPointerCapture(e.pointerId)
    track.current.querySelectorAll('.ui-slider__thumb')[i]?.focus({ preventScroll: true })
    e.preventDefault()
  }
  const onPointerMove = (e) => {
    if (dragging < 0) return
    update(dragging, fromPointer(e), track.current.querySelectorAll('.ui-slider__thumb')[dragging])
  }
  const onPointerUp = () => setDragging(-1)

  const onKey = (i) => (e) => {
    const big = Math.max(step, (max - min) / 10)
    const map = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big }
    let v
    if (e.key in map) v = values[i] + map[e.key]
    else if (e.key === 'Home') v = min
    else if (e.key === 'End') v = max
    else return
    e.preventDefault()
    update(i, v, e.currentTarget)
  }

  const lo = range ? pct(values[0]) : 0
  const hi = pct(values[range ? 1 : 0])
  const markList = marks === true ? Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, k) => min + k * step) : marks

  return (
    <div className={cx('ui-slider', className)} data-disabled={disabled || undefined} data-dragging={dragging >= 0 || undefined} data-show={showValue}>
      {label && (
        <div className="ui-slider__head">
          <span className="ui-slider__label" id={`${id}-label`}>
            {label}
          </span>
          <span className="ui-slider__readout">{values.map((v) => format(v)).join(' – ')}</span>
        </div>
      )}
      <div
        ref={track}
        className="ui-slider__track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="ui-slider__rail" />
        <div className="ui-slider__fill" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
        {markList?.map((m) => (
          <span key={m} className="ui-slider__mark" data-in={(m >= (range ? values[0] : min) && m <= values[values.length - 1]) || undefined} style={{ left: `${pct(m)}%` }} />
        ))}
        {values.map((v, i) => (
          <div
            key={i}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            className="ui-slider__thumb"
            style={{ left: `${pct(v)}%` }}
            aria-valuemin={range && i === 1 ? values[0] : min}
            aria-valuemax={range && i === 0 ? values[1] : max}
            aria-valuenow={v}
            aria-valuetext={String(format(v))}
            aria-labelledby={label ? `${id}-label` : undefined}
            aria-label={range ? (i === 0 ? 'Minimum' : 'Maximum') : undefined}
            aria-disabled={disabled || undefined}
            data-active={dragging === i || undefined}
            onKeyDown={onKey(i)}
          >
            {showValue !== 'never' && <span className="ui-slider__bubble">{format(v)}</span>}
          </div>
        ))}
      </div>
      {markList && Array.isArray(marks) && (
        <div className="ui-slider__scale" aria-hidden>
          {markList.map((m) => (
            <span key={m} style={{ left: `${pct(m)}%` }}>
              {format(m)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
