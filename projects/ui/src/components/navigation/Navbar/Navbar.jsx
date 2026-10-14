import { useId, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useControllable, useKey } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { useIndicator } from '../_shared/useIndicator'
import './Navbar.css'

/**
 * Top navigation bar. Collapses links + actions into a hamburger panel when its container is narrower than ~720px.
 * links: [{ id, label, href?, badge? }] — without href a link renders as a button.
 * onNavigate(link, event) is called on click (preventDefault there for client-side routing).
 */
export function Navbar({
  brand = 'Acme',
  logo = 'sparkles',
  links = [],
  value,
  defaultValue,
  onChange,
  onNavigate,
  actions,
  variant = 'solid',
  className,
  children,
  ...props
}) {
  const [active, setActive] = useControllable(value, defaultValue ?? links[0]?.id, onChange)
  const [hover, setHover] = useState(null)
  const [open, setOpen] = useState(false)
  const fx = useFx()
  const panelId = useId()
  const target = hover ?? active
  const [listRef, indStyle, ready] = useIndicator(target, [links.length])
  useKey('Escape', () => setOpen(false), open)

  const click = (link, e) => {
    setActive(link.id)
    setOpen(false)
    if (fx) sparkle(e.currentTarget)
    onNavigate?.(link, e)
  }

  const renderLink = (link, inPanel) => {
    const LinkTag = link.href ? 'a' : 'button'
    const isActive = link.id === active
    return (
      <li key={link.id}>
        <LinkTag
          className="ui-navbar__link"
          href={link.href}
          type={link.href ? undefined : 'button'}
          aria-current={isActive ? 'page' : undefined}
          data-indicator-target={!inPanel && link.id === target ? true : undefined}
          onClick={(e) => click(link, e)}
          onPointerEnter={inPanel ? undefined : () => setHover(link.id)}
          onFocus={inPanel ? undefined : () => setHover(link.id)}
        >
          {link.label}
          {link.badge != null && <span className="ui-navbar__badge">{link.badge}</span>}
        </LinkTag>
      </li>
    )
  }

  return (
    <header className={cx('ui-navbar', `ui-navbar--${variant}`, className)} data-open={open || undefined} {...props}>
      <div className="ui-navbar__bar">
        <a
          className="ui-navbar__brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            if (fx) sparkle(e.currentTarget, { count: 14 })
          }}
        >
          <span className="ui-navbar__logo">
            <Icon name={logo} size={18} />
          </span>
          <span className="ui-navbar__brand-text">{brand}</span>
        </a>

        <nav aria-label="Main" className="ui-navbar__nav">
          <ul
            ref={listRef}
            className="ui-navbar__links"
            style={indStyle}
            data-ready={ready || undefined}
            onPointerLeave={() => setHover(null)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHover(null)}
          >
            <li className="ui-navbar__indicator" aria-hidden />
            {links.map((l) => renderLink(l, false))}
          </ul>
        </nav>

        {actions && <div className="ui-navbar__actions">{actions}</div>}

        <button
          type="button"
          className="ui-navbar__burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div id={panelId} className="ui-navbar__panel" hidden={!open}>
        <nav aria-label="Main (mobile)">
          <ul className="ui-navbar__panel-links">{links.map((l) => renderLink(l, true))}</ul>
        </nav>
        {actions && <div className="ui-navbar__panel-actions">{actions}</div>}
      </div>
      {children}
    </header>
  )
}
