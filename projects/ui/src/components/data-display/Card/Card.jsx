import { cx } from '../../../lib/cx'
import { useFx, useTilt } from '../../../lib/fx'
import './Card.css'

/**
 * Surface for grouped content. `interactive` makes the whole card a button (or link with `href`).
 * In the Extra style interactive cards tilt toward the cursor with a holographic sheen.
 */
export function Card({
  variant = 'elevated',
  media,
  mediaAlt = '',
  eyebrow,
  title,
  subtitle,
  footer,
  interactive = false,
  href,
  horizontal = false,
  className,
  children,
  ...props
}) {
  const fx = useFx()
  const ref = useTilt(fx && (interactive || !!href), { max: 9, scale: 1.02 })
  const Tag = href ? 'a' : interactive ? 'button' : 'article'
  // Buttons only allow phrasing content, so headings become spans there.
  const [H, P] = Tag === 'button' ? ['span', 'span'] : ['h3', 'p']
  return (
    <Tag
      ref={ref}
      href={href}
      type={Tag === 'button' ? 'button' : undefined}
      className={cx(
        'ui-card',
        `ui-card--${variant}`,
        (interactive || href) && 'ui-card--interactive',
        horizontal && 'ui-card--horizontal',
        className,
      )}
      {...props}
    >
      {media && (
        <div className="ui-card__media">
          <img src={media} alt={mediaAlt} loading="lazy" />
        </div>
      )}
      <div className="ui-card__body">
        {eyebrow && <div className="ui-card__eyebrow">{eyebrow}</div>}
        {title && <H className="ui-card__title ui-heading">{title}</H>}
        {subtitle && <P className="ui-card__subtitle">{subtitle}</P>}
        {children && <div className="ui-card__content">{children}</div>}
        {footer && <div className="ui-card__footer">{footer}</div>}
      </div>
      <span className="ui-card__sheen" aria-hidden />
    </Tag>
  )
}
