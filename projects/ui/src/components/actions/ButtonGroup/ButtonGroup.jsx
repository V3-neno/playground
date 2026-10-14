import { useLayoutEffect, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useControllable, useRovingKeys } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import './ButtonGroup.css'

/**
 * Two modes:
 *  - `options` given: a segmented control (single choice, radiogroup semantics, sliding thumb).
 *  - otherwise: `children` (usually <Button>s) attached into one joined group.
 */
export function ButtonGroup(props) {
  return props.options ? <Segmented {...props} /> : <Attached {...props} />
}

function Attached({ label, orientation = 'horizontal', className, children, ...props }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx('ui-button-group', `ui-button-group--${orientation}`, className)}
      {...props}
    >
      {children}
    </div>
  )
}

const norm = (o) => (typeof o === 'string' ? { value: o, label: o } : o)

function Segmented({ options, value, defaultValue, onChange, label, size = 'md', fullWidth = false, className, ...props }) {
  const opts = options.map(norm)
  const [current, setCurrent] = useControllable(value, defaultValue ?? opts[0]?.value, onChange)
  const fx = useFx()
  const wrap = useRef(null)
  const btns = useRef([])
  const [thumb, setThumb] = useState(null)
  const index = Math.max(0, opts.findIndex((o) => o.value === current))

  // The thumb tracks the selected button's box, also when the container resizes.
  useLayoutEffect(() => {
    const measure = () => {
      const b = btns.current[index]
      if (b) setThumb({ left: b.offsetLeft, width: b.offsetWidth })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [index, opts.length])

  const select = (i, focus) => {
    const o = opts[i]
    if (!o || o.disabled) return
    if (o.value !== current && fx) sparkle(btns.current[i])
    setCurrent(o.value)
    if (focus) btns.current[i]?.focus()
  }
  const onKeyDown = useRovingKeys({ count: opts.length, index, setIndex: (i) => select(i, true), orientation: 'horizontal' })

  return (
    <div
      ref={wrap}
      role="radiogroup"
      aria-label={label}
      className={cx('ui-segmented', `ui-segmented--${size}`, fullWidth && 'ui-segmented--full', className)}
      onKeyDown={onKeyDown}
      {...props}
    >
      {thumb && <span className="ui-segmented__thumb" aria-hidden style={{ '--_x': `${thumb.left}px`, '--_w': `${thumb.width}px` }} />}
      {opts.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => (btns.current[i] = el)}
          type="button"
          role="radio"
          aria-checked={i === index}
          aria-label={o.icon && !o.label ? o.value : undefined}
          tabIndex={i === index ? 0 : -1}
          disabled={o.disabled}
          className="ui-segmented__option"
          onClick={() => select(i)}
        >
          {o.icon && <Icon name={o.icon} size={size === 'sm' ? 14 : 16} />}
          {o.label && <span>{o.label}</span>}
        </button>
      ))}
    </div>
  )
}
