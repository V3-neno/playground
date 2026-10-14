import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../../actions/Button/Button'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { useControllable, useOutsideClick } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { useIndicator } from '../_shared/useIndicator'
import './Menu.css'

/**
 * Dropdown action menu (role="menu").
 * items: [{ id, label, icon?, shortcut?, danger?, disabled?, checked? } | { type: 'separator' } | { type: 'label', label }]
 * Items with a boolean `checked` render as menuitemcheckbox.
 * trigger: 'button' (label + chevron) | 'icon' (⋯ icon button); triggerVariant is passed to Button.
 */
export function Menu({
  label = 'Options',
  items,
  onSelect,
  trigger = 'button',
  triggerVariant,
  icon,
  align = 'start',
  open,
  defaultOpen = false,
  onOpenChange,
  closeOnSelect = true,
  className,
  ...props
}) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange)
  const [active, setActive] = useState(-1) // index into `actionable`
  const fx = useFx()
  const menuId = useId()
  const wrapRef = useRef(null)
  const triggerRef = useRef(null)
  const itemRefs = useRef([])
  const typed = useRef({ text: '', at: 0 })
  const actionable = items.map((it, i) => ({ it, i })).filter(({ it }) => !it.type && !it.disabled)
  const activeIndex = actionable[active]?.i
  const [listRef, indStyle, ready] = useIndicator(isOpen ? activeIndex : 'closed', [isOpen])

  useOutsideClick(wrapRef, () => setOpen(false), isOpen)

  // Keep DOM focus on the highlighted item, so screen readers follow along.
  useEffect(() => {
    if (isOpen && activeIndex != null) itemRefs.current[activeIndex]?.focus({ preventScroll: true })
  }, [isOpen, activeIndex])

  useEffect(() => {
    if (!isOpen) setActive(-1)
  }, [isOpen])

  const openAt = (index) => {
    setOpen(true)
    setActive(index)
  }
  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  const select = (it, e) => {
    if (fx) burst(e, { count: 18, spread: 80 })
    onSelect?.(it.id, it)
    if (closeOnSelect && typeof it.checked !== 'boolean') close()
  }

  const onTriggerKey = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openAt(0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      openAt(actionable.length - 1)
    } else if (e.key === 'Escape' && isOpen) {
      setOpen(false)
    }
  }

  const onMenuKey = (e) => {
    const n = actionable.length
    if (e.key === 'ArrowDown') setActive((a) => (a + 1) % n)
    else if (e.key === 'ArrowUp') setActive((a) => (a - 1 + n) % n)
    else if (e.key === 'Home') setActive(0)
    else if (e.key === 'End') setActive(n - 1)
    else if (e.key === 'Escape') close()
    else if (e.key === 'Tab') return close(false)
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      // type-ahead: jump to the next item starting with the typed letters
      const now = Date.now()
      typed.current.text = (now - typed.current.at < 600 ? typed.current.text : '') + e.key.toLowerCase()
      typed.current.at = now
      const order = [...actionable.slice(active + 1), ...actionable.slice(0, active + 1)]
      const hit = order.find(({ it }) => String(it.label).toLowerCase().startsWith(typed.current.text))
      if (hit) setActive(actionable.indexOf(hit))
    } else return
    e.preventDefault()
  }

  let order = 0 // stagger index for the open animation
  return (
    <div ref={wrapRef} className={cx('ui-menu', className)} data-align={align} {...props}>
      <Button
        ref={triggerRef}
        variant={triggerVariant ?? (trigger === 'icon' ? 'ghost' : 'outline')}
        icon={trigger === 'icon' ? (icon ?? 'more') : icon}
        iconRight={trigger === 'icon' ? undefined : 'chevron-down'}
        aria-label={trigger === 'icon' ? label : undefined}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        className={cx('ui-menu__trigger', trigger === 'icon' && 'ui-menu__trigger--icon')}
        data-open={isOpen || undefined}
        onClick={() => (isOpen ? setOpen(false) : openAt(-1))}
        onKeyDown={onTriggerKey}
      >
        {trigger === 'icon' ? null : label}
      </Button>

      {isOpen && (
        <div
          ref={listRef}
          id={menuId}
          role="menu"
          aria-label={label}
          className="ui-menu__popover"
          style={indStyle}
          data-ready={ready || undefined}
          onKeyDown={onMenuKey}
          tabIndex={-1}
        >
          <span className="ui-menu__indicator" aria-hidden />
          {items.map((it, i) => {
            if (it.type === 'separator') return <div key={i} role="separator" className="ui-menu__separator" />
            if (it.type === 'label')
              return (
                <div key={i} className="ui-menu__label" role="presentation">
                  {it.label}
                </div>
              )
            const checkable = typeof it.checked === 'boolean'
            const highlighted = i === activeIndex
            return (
              <button
                key={it.id ?? i}
                ref={(el) => (itemRefs.current[i] = el)}
                type="button"
                role={checkable ? 'menuitemcheckbox' : 'menuitem'}
                aria-checked={checkable ? it.checked : undefined}
                aria-disabled={it.disabled || undefined}
                tabIndex={highlighted ? 0 : -1}
                className={cx('ui-menu__item', it.danger && 'ui-menu__item--danger')}
                data-highlighted={highlighted || undefined}
                data-indicator-target={highlighted || undefined}
                style={{ '--i': order++ }}
                onPointerMove={() => !it.disabled && !highlighted && setActive(actionable.findIndex((a) => a.i === i))}
                onClick={(e) => !it.disabled && select(it, e)}
              >
                <span className="ui-menu__icon">
                  {checkable ? it.checked && <Icon name="check" size={15} /> : it.icon && <Icon name={it.icon} size={15} />}
                </span>
                <span className="ui-menu__text">{it.label}</span>
                {it.shortcut && <kbd className="ui-menu__shortcut">{it.shortcut}</kbd>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
