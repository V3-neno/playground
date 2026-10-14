import { cx } from '../../../lib/cx'
import { Icon } from '../../../lib/icons'
import './Badge.css'

/** Small status label. `dot` adds a status dot, `pulse` makes it breathe, `count` caps at `max`. */
export function Badge({
  tone = 'accent',
  variant = 'soft',
  size = 'md',
  dot = false,
  pulse = false,
  icon,
  count,
  max = 99,
  onRemove,
  className,
  children,
  ...props
}) {
  const label = count != null ? (count > max ? `${max}+` : String(count)) : children
  return (
    <span
      className={cx(
        'ui-badge',
        `ui-badge--${variant}`,
        `ui-badge--${tone}`,
        `ui-badge--${size}`,
        count != null && 'ui-badge--count',
        className,
      )}
      {...props}
    >
      {dot && <span className={cx('ui-badge__dot', pulse && 'is-pulsing')} aria-hidden />}
      {icon && <Icon name={icon} size={size === 'sm' ? 11 : 13} />}
      <span className="ui-badge__label">{label}</span>
      {onRemove && (
        <button type="button" className="ui-badge__remove" onClick={onRemove} aria-label={`Remove ${typeof children === 'string' ? children : ''}`.trim()}>
          <Icon name="x" size={11} strokeWidth={2.5} />
        </button>
      )}
    </span>
  )
}
