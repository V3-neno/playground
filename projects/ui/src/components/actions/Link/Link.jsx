import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import './Link.css'

/**
 * Text link. Variants: inline (underlined, for running text), subtle (underline appears on hover),
 * standalone (bold call-to-action with an arrow that nudges forward on hover).
 * `external` opens in a new tab and says so to screen readers.
 */
export function Link({ href = '#', variant = 'inline', external = false, icon, className, children, onPointerEnter, ...props }) {
  const fx = useFx()
  return (
    <a
      href={href}
      className={cx('ui-link', `ui-link--${variant}`, className)}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onPointerEnter={(e) => {
        if (fx) sparkle(e, { count: 5, spread: 36 })
        onPointerEnter?.(e)
      }}
      {...props}
    >
      {icon && <Icon name={icon} size={15} className="ui-link__icon" />}
      <span className="ui-link__text">{children}</span>
      {external && (
        <>
          <Icon name="external" size={13} className="ui-link__icon ui-link__external" />
          <span className="ui-sr-only"> (opens in a new tab)</span>
        </>
      )}
      {variant === 'standalone' && !external && <Icon name="arrow-right" size={15} className="ui-link__arrow" />}
    </a>
  )
}
