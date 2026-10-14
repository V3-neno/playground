import { useId } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { useControllable } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import './Switch.css'

/** role="switch" button. Optional icons inside the thumb (e.g. iconOff="sun" iconOn="moon"). */
export function Switch({
  label,
  description,
  checked,
  defaultChecked = false,
  onChange,
  size = 'md',
  iconOn,
  iconOff,
  labelPosition = 'right',
  disabled,
  className,
  ...props
}) {
  const [on, setOn] = useControllable(checked, defaultChecked, onChange)
  const id = useId()
  const fx = useFx()
  const icon = on ? iconOn : iconOff
  return (
    <div className={cx('ui-switch', `ui-switch--${size}`, labelPosition === 'left' && 'ui-switch--label-left', className)} data-disabled={disabled || undefined}>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={on}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        className="ui-switch__track"
        onClick={(e) => {
          const next = !on
          setOn(next)
          if (fx && next) burst(e.currentTarget, { count: 14, spread: 60, shapes: ['star', 'circle'] })
        }}
        {...props}
      >
        <span className="ui-switch__thumb">{icon && <Icon name={icon} size={size === 'sm' ? 10 : size === 'lg' ? 16 : 12} strokeWidth={2.5} />}</span>
      </button>
      {(label || description) && (
        <span className="ui-switch__text">
          {label && (
            <label htmlFor={id} className="ui-switch__label">
              {label}
            </label>
          )}
          {description && (
            <span id={`${id}-desc`} className="ui-switch__desc">
              {description}
            </span>
          )}
        </span>
      )}
    </div>
  )
}
