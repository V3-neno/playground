import { useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useControllable } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { Field } from '../_shared/Field'
import './TextField.css'

export function TextField({
  label,
  hint,
  error,
  placeholder,
  value,
  defaultValue = '',
  onChange,
  type = 'text',
  size = 'md',
  icon,
  suffix,
  clearable = false,
  multiline = false,
  rows = 4,
  maxLength,
  required,
  disabled,
  className,
  ...props
}) {
  const [text, setText] = useControllable(value, defaultValue, onChange)
  const [reveal, setReveal] = useState(false)
  const fx = useFx()
  const lastSparkle = useRef(0)
  const isPassword = type === 'password'
  const Tag = multiline ? 'textarea' : 'input'

  const handle = (e) => {
    setText(e.target.value)
    // Extra: the field throws off a little glitter as you type.
    if (fx && performance.now() - lastSparkle.current > 140) {
      lastSparkle.current = performance.now()
      const r = e.target.getBoundingClientRect()
      // {x, y} has no element, so fx finds the .ui-root through the focused input.
      sparkle({ x: r.left + Math.min(r.width - 8, 14 + e.target.value.length * 7.5), y: r.top + r.height / 2 }, { count: 4, spread: 28 })
    }
  }

  return (
    <Field label={label} hint={hint} error={error} required={required} disabled={disabled} className={cx('ui-textfield', className)}>
      {({ id, describedBy, invalid }) => (
        <>
          <div
            className={cx('ui-control', `ui-control--${size}`, multiline && 'ui-textfield--multiline')}
            data-invalid={invalid || undefined}
          >
            {icon && (
              <span className="ui-control__icon">
                <Icon name={icon} size={size === 'lg' ? 18 : 16} />
              </span>
            )}
            <Tag
              id={id}
              type={multiline ? undefined : isPassword && reveal ? 'text' : type}
              rows={multiline ? rows : undefined}
              value={text}
              onChange={handle}
              placeholder={placeholder}
              maxLength={maxLength}
              required={required}
              disabled={disabled}
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              {...props}
            />
            {clearable && text && !disabled && (
              <button type="button" className="ui-control__btn" aria-label="Clear" onClick={() => setText('')}>
                <Icon name="x" size={14} />
              </button>
            )}
            {isPassword && (
              <button
                type="button"
                className="ui-control__btn"
                aria-label={reveal ? 'Hide password' : 'Show password'}
                aria-pressed={reveal}
                onClick={() => setReveal((r) => !r)}
              >
                <Icon name={reveal ? 'lock' : 'eye'} size={15} />
              </button>
            )}
            {suffix && <span className="ui-textfield__suffix">{suffix}</span>}
          </div>
          {maxLength && (
            <div className="ui-textfield__count" data-full={text.length >= maxLength || undefined} aria-live="polite">
              {text.length}/{maxLength}
            </div>
          )}
        </>
      )}
    </Field>
  )
}
