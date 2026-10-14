import { useId } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx, useTilt } from '../../../lib/fx'
import { useControllable } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { normalizeOptions } from '../_shared/Field'
import './RadioGroup.css'

/**
 * Native radios in a role="radiogroup" (arrow keys move between them for free).
 * variant: 'default' (dots) | 'cards' (selectable tiles) | 'segmented' (pill bar).
 */
export function RadioGroup({
  options: rawOptions = [],
  value,
  defaultValue,
  onChange,
  label,
  hint,
  error,
  name,
  variant = 'default',
  orientation = 'vertical',
  disabled,
  className,
}) {
  const options = normalizeOptions(rawOptions)
  const [selected, setSelected] = useControllable(value, defaultValue ?? null, onChange)
  const auto = useId()
  const groupName = name ?? auto
  const fx = useFx()

  return (
    <div
      role="radiogroup"
      aria-labelledby={label ? `${auto}-label` : undefined}
      aria-describedby={error || hint ? `${auto}-hint` : undefined}
      aria-invalid={error ? true : undefined}
      className={cx('ui-radio-group', `ui-radio-group--${variant}`, `ui-radio-group--${orientation}`, className)}
      data-disabled={disabled || undefined}
    >
      {label && (
        <div className="ui-radio-group__label" id={`${auto}-label`}>
          {label}
        </div>
      )}
      <div className="ui-radio-group__items">
        {options.map((o) => (
          <Radio
            key={String(o.value)}
            option={o}
            name={groupName}
            variant={variant}
            checked={o.value === selected}
            disabled={disabled || o.disabled}
            fx={fx}
            onSelect={(e) => {
              setSelected(o.value)
              if (fx) sparkle(e.target.nextSibling, { count: variant === 'cards' ? 14 : 8, spread: variant === 'cards' ? 70 : 36 })
            }}
          />
        ))}
      </div>
      {(error || hint) && (
        <div id={`${auto}-hint`} className={error ? 'ui-radio-group__error' : 'ui-radio-group__hint'}>
          {error && <Icon name="alert" size={14} />}
          {error || hint}
        </div>
      )}
    </div>
  )
}

function Radio({ option: o, name, variant, checked, disabled, fx, onSelect }) {
  const tilt = useTilt(fx && variant === 'cards' && !disabled, { max: 8, scale: 1.02 })
  return (
    <label ref={tilt} className="ui-radio" data-checked={checked || undefined} data-disabled={disabled || undefined}>
      <input type="radio" className="ui-radio__input" name={name} value={String(o.value)} checked={checked} disabled={disabled} onChange={onSelect} />
      <span className="ui-radio__dot" aria-hidden />
      {variant === 'cards' && o.icon && (
        <span className="ui-radio__icon">
          <Icon name={o.icon} size={20} />
        </span>
      )}
      <span className="ui-radio__text">
        <span className="ui-radio__label">{o.label}</span>
        {o.description && variant !== 'segmented' && <span className="ui-radio__desc">{o.description}</span>}
      </span>
    </label>
  )
}
