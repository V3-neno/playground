import { useId, useRef } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useControllable } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import './Accordion.css'

/**
 * Expandable sections. `multiple` lets several stay open; otherwise opening one closes the others.
 * Controlled with `value` (array of open ids) + `onChange`, or uncontrolled with `defaultValue`.
 * Arrow Up/Down, Home and End move between headers.
 * items: [{ id, title, content, icon?, disabled? }]
 */
export function Accordion({
  items = [],
  multiple = false,
  value,
  defaultValue = [],
  onChange,
  variant = 'separated',
  className,
  ...props
}) {
  const fx = useFx()
  const uid = useId()
  const [open, setOpen] = useControllable(value, defaultValue, onChange)
  const headers = useRef([])

  const toggle = (id, el) => {
    const isOpen = open.includes(id)
    if (!isOpen && fx && el) sparkle(el, { count: 6 })
    setOpen(isOpen ? open.filter((x) => x !== id) : multiple ? [...open, id] : [id])
  }

  const onKeyDown = (e, i) => {
    const enabled = items.map((it, idx) => (it.disabled ? -1 : idx)).filter((idx) => idx >= 0)
    const pos = enabled.indexOf(i)
    let next
    if (e.key === 'ArrowDown') next = enabled[(pos + 1) % enabled.length]
    else if (e.key === 'ArrowUp') next = enabled[(pos - 1 + enabled.length) % enabled.length]
    else if (e.key === 'Home') next = enabled[0]
    else if (e.key === 'End') next = enabled[enabled.length - 1]
    else return
    e.preventDefault()
    headers.current[next]?.focus()
  }

  return (
    <div className={cx('ui-accordion', `ui-accordion--${variant}`, className)} {...props}>
      {items.map((item, i) => {
        const isOpen = open.includes(item.id)
        const hid = `${uid}-h-${item.id}`
        const pid = `${uid}-p-${item.id}`
        return (
          <div key={item.id} className={cx('ui-accordion__item', isOpen && 'is-open', item.disabled && 'is-disabled')}>
            <h3 className="ui-accordion__heading">
              <button
                ref={(el) => (headers.current[i] = el)}
                id={hid}
                type="button"
                className="ui-accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={pid}
                disabled={item.disabled}
                onClick={(e) => toggle(item.id, e.currentTarget.querySelector('.ui-accordion__chevron'))}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                {item.icon && <Icon name={item.icon} size={18} className="ui-accordion__icon" />}
                <span className="ui-accordion__title">{item.title}</span>
                <span className="ui-accordion__chevron" aria-hidden>
                  <Icon name="chevron-down" size={18} />
                </span>
              </button>
            </h3>
            <div id={pid} role="region" aria-labelledby={hid} className="ui-accordion__panel" inert={!isOpen || undefined}>
              <div className="ui-accordion__clip">
                <div className="ui-accordion__content">{item.content}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
