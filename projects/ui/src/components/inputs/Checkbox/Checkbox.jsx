import { useEffect, useRef } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useControllable } from '../../../lib/hooks'
import './Checkbox.css'

/** A native checkbox (so forms, labels and keyboard just work) with a drawn tick. */
export function Checkbox({
  label,
  description,
  checked,
  defaultChecked = false,
  onChange,
  indeterminate = false,
  size = 'md',
  disabled,
  invalid,
  className,
  ...props
}) {
  const [on, setOn] = useControllable(checked, defaultChecked, onChange)
  const input = useRef(null)
  const fx = useFx()

  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label
      className={cx('ui-checkbox', `ui-checkbox--${size}`, className)}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
    >
      <input
        ref={input}
        type="checkbox"
        className="ui-checkbox__input"
        checked={on}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          setOn(e.target.checked)
          if (fx && e.target.checked) sparkle(e.target.nextSibling, { count: 10, spread: 40 })
        }}
        {...props}
      />
      <span className="ui-checkbox__box" aria-hidden>
        <svg viewBox="0 0 24 24" className="ui-checkbox__icon">
          {indeterminate ? <path d="M6 12h12" /> : <path d="M5 12.5l4.5 4.5L19 7.5" />}
        </svg>
      </span>
      {(label || description) && (
        <span className="ui-checkbox__text">
          {label && <span className="ui-checkbox__label">{label}</span>}
          {description && <span className="ui-checkbox__desc">{description}</span>}
        </span>
      )}
    </label>
  )
}
