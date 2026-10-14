import { cx } from '../../../lib/cx'
import { useFx, useTilt } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import './EmptyState.css'

/**
 * "Nothing here yet" panel: icon art, title, description and actions (children).
 * tone colours the art (accent | danger | success); variant: plain | card. In Extra the art floats, tilts and has orbiting sparkles.
 */
export function EmptyState({
  icon = 'inbox',
  title,
  description,
  tone = 'accent',
  size = 'md',
  variant = 'plain',
  headingLevel = 3,
  className,
  children,
  ...props
}) {
  const fx = useFx()
  const art = useTilt(fx, { max: 18, scale: 1.06 })
  const Heading = `h${headingLevel}`
  return (
    <div className={cx('ui-empty', `ui-empty--${size}`, `ui-empty--${variant}`, `ui-empty--${tone}`, className)} {...props}>
      <div ref={art} className="ui-empty__art" aria-hidden>
        <span className="ui-empty__ring" />
        <Icon name={icon} size={size === 'sm' ? 22 : size === 'lg' ? 40 : 30} strokeWidth={1.75} />
        {fx && (
          <span className="ui-empty__orbits">
            <i />
            <i />
            <i />
          </span>
        )}
      </div>
      {title && <Heading className="ui-empty__title ui-heading">{title}</Heading>}
      {description && <p className="ui-empty__desc">{description}</p>}
      {children && <div className="ui-empty__actions">{children}</div>}
    </div>
  )
}
