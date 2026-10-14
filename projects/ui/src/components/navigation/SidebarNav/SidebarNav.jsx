import { useId, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useControllable, useKey } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { useIndicator } from '../_shared/useIndicator'
import './SidebarNav.css'

/**
 * App shell with a side navigation. `children` is the main content area.
 * sections: [{ label?, items: [{ id, label, icon?, badge?, children?: [{ id, label, badge? }] }] }]
 * collapsed: icon-only rail. Below ~620px of container width the sidebar becomes an off-canvas drawer.
 */
export function SidebarNav({
  brand = 'Workspace',
  logo = 'layers',
  sections = [],
  value,
  defaultValue,
  onChange,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  footer,
  children,
  className,
  ...props
}) {
  const allItems = sections.flatMap((s) => s.items)
  const [active, setActive] = useControllable(value, defaultValue ?? allItems[0]?.id, onChange)
  const [isCollapsed, setCollapsed] = useControllable(collapsed, defaultCollapsed, onCollapsedChange)
  const parentOf = (id) => allItems.find((it) => it.children?.some((c) => c.id === id))?.id
  const [expanded, setExpanded] = useState(() => new Set([parentOf(active)].filter(Boolean)))
  const [drawer, setDrawer] = useState(false)
  const fx = useFx()
  const navId = useId()
  const [listRef, indStyle, ready] = useIndicator(active, [isCollapsed, [...expanded].join()])
  useKey('Escape', () => setDrawer(false), drawer)

  const toggleGroup = (id) =>
    setExpanded((s) => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const choose = (id, e) => {
    setActive(id)
    setDrawer(false)
    if (fx) sparkle(e.currentTarget)
  }

  const renderItem = (item) => {
    const hasKids = !!item.children?.length
    const open = hasKids && expanded.has(item.id) && !isCollapsed
    const childActive = hasKids && item.children.some((c) => c.id === active)
    const isTarget = item.id === active || (childActive && !open)
    return (
      <li key={item.id} className="ui-sidebar-nav__li">
        <button
          type="button"
          className="ui-sidebar-nav__item"
          title={isCollapsed ? item.label : undefined}
          aria-current={item.id === active ? 'page' : undefined}
          aria-expanded={hasKids ? open : undefined}
          data-child-active={childActive || undefined}
          data-indicator-target={isTarget || undefined}
          onClick={(e) => {
            if (hasKids && !isCollapsed) toggleGroup(item.id)
            else if (hasKids) {
              setCollapsed(false)
              setExpanded((s) => new Set(s).add(item.id))
            } else choose(item.id, e)
          }}
        >
          {item.icon && (
            <span className="ui-sidebar-nav__icon">
              <Icon name={item.icon} size={18} />
            </span>
          )}
          <span className="ui-sidebar-nav__label">{item.label}</span>
          {item.badge != null && <span className="ui-sidebar-nav__badge">{item.badge}</span>}
          {hasKids && <Icon name="chevron-down" size={15} className="ui-sidebar-nav__chevron" />}
        </button>
        {hasKids && (
          <div className="ui-sidebar-nav__children" data-open={open || undefined}>
            <ul className="ui-sidebar-nav__children-inner">
              {item.children.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    tabIndex={open ? 0 : -1}
                    className="ui-sidebar-nav__item ui-sidebar-nav__item--child"
                    aria-current={c.id === active ? 'page' : undefined}
                    data-indicator-target={open && c.id === active ? true : undefined}
                    onClick={(e) => choose(c.id, e)}
                  >
                    <span className="ui-sidebar-nav__label">{c.label}</span>
                    {c.badge != null && <span className="ui-sidebar-nav__badge">{c.badge}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    )
  }

  return (
    <div className={cx('ui-sidebar-nav', className)} data-collapsed={isCollapsed || undefined} data-drawer={drawer || undefined} {...props}>
      <div className="ui-sidebar-nav__topbar">
        <button type="button" className="ui-sidebar-nav__menu-btn" aria-label="Open navigation" aria-controls={navId} aria-expanded={drawer} onClick={() => setDrawer(true)}>
          <Icon name="menu" size={18} />
        </button>
        <span className="ui-sidebar-nav__topbar-title">{allItems.flatMap((i) => [i, ...(i.children ?? [])]).find((i) => i.id === active)?.label ?? brand}</span>
      </div>

      <div className="ui-sidebar-nav__scrim" onClick={() => setDrawer(false)} aria-hidden />

      <aside id={navId} className="ui-sidebar-nav__aside">
        <div className="ui-sidebar-nav__head">
          <span className="ui-sidebar-nav__logo">
            <Icon name={logo} size={18} />
          </span>
          <span className="ui-sidebar-nav__brand">{brand}</span>
          <button
            type="button"
            className="ui-sidebar-nav__collapse"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={isCollapsed}
            onClick={() => setCollapsed(!isCollapsed)}
          >
            <Icon name="chevron-left" size={16} />
          </button>
          <button type="button" className="ui-sidebar-nav__close" aria-label="Close navigation" onClick={() => setDrawer(false)}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <nav aria-label="Sidebar" className="ui-sidebar-nav__nav" ref={listRef} style={indStyle} data-ready={ready || undefined}>
          <span className="ui-sidebar-nav__indicator" aria-hidden />
          {sections.map((section, i) => (
            <div key={section.label ?? i} className="ui-sidebar-nav__section">
              {section.label && <div className="ui-sidebar-nav__section-label">{section.label}</div>}
              <ul className="ui-sidebar-nav__list">{section.items.map(renderItem)}</ul>
            </div>
          ))}
        </nav>

        {footer && <div className="ui-sidebar-nav__footer">{footer}</div>}
      </aside>

      <main className="ui-sidebar-nav__main">{children}</main>
    </div>
  )
}
