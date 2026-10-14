import { cx } from '../../../lib/cx'
import { burst, useFx, useMagnet } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import './Button.css'

export function Button({
  variant = 'solid',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  className,
  children,
  onClick,
  ...props
}) {
  const fx = useFx() // extra style: magnetic hover + confetti on click
  const ref = useMagnet(fx && !props.disabled, { strength: 0.25 })
  return (
    <button
      ref={ref}
      type="button"
      className={cx('ui-button', `ui-button--${variant}`, `ui-button--${size}`, loading && 'is-loading', className)}
      aria-busy={loading || undefined}
      onClick={(e) => {
        if (fx && variant !== 'ghost') burst(e)
        onClick?.(e)
      }}
      {...props}
    >
      {loading ? <span className="ui-button__spinner" aria-hidden /> : icon && <Icon name={icon} size={size === 'lg' ? 18 : 16} />}
      {children != null && children !== '' && <span className="ui-button__label">{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 18 : 16} />}
    </button>
  )
}
