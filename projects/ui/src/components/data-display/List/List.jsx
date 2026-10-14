import { useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { useControllable, useRovingKeys } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import './List.css'

/**
 * Rows of title + description with optional leading media and trailing meta/action.
 * Pass `selectable` (single) to get a keyboard-navigable listbox; otherwise it's a plain list.
 * items: [{ id, title, description, icon, avatar, meta, action }]
 */
export function List({
  items = [],
  variant = 'divided',
  selectable = false,
  value,
  defaultValue,
  onChange,
  dense = false,
  className,
  ...props
}) {
  const fx = useFx()
  const [selected, setSelected] = useControllable(value, defaultValue ?? null, onChange)
  const [active, setActive] = useState(() => Math.max(0, items.findIndex((i) => i.id === (value ?? defaultValue))))
  const refs = useRef([])

  const choose = (i, e) => {
    setSelected(items[i].id)
    if (fx && e) burst(e, { count: 14, spread: 70 })
  }
  const onKeyDown = useRovingKeys({
    count: items.length,
    index: active,
    setIndex: (i) => {
      setActive(i)
      refs.current[i]?.focus()
    },
    onSelect: (i) => choose(i, { currentTarget: refs.current[i] }),
  })

  return (
    <ul
      className={cx('ui-list', `ui-list--${variant}`, dense && 'ui-list--dense', selectable && 'ui-list--selectable', className)}
      role={selectable ? 'listbox' : undefined}
      onKeyDown={selectable ? onKeyDown : undefined}
      {...props}
    >
      {items.map((item, i) => {
        const isSel = selectable && selected === item.id
        return (
          <li
            key={item.id ?? i}
            ref={(el) => (refs.current[i] = el)}
            className={cx('ui-list__item', isSel && 'is-selected')}
            style={{ '--_i': i }}
            role={selectable ? 'option' : undefined}
            aria-selected={selectable ? isSel : undefined}
            tabIndex={selectable ? (i === active ? 0 : -1) : undefined}
            onClick={selectable ? (e) => (setActive(i), choose(i, e)) : undefined}
          >
            {(item.icon || item.avatar) && (
              <span className={cx('ui-list__lead', item.avatar && 'is-avatar')}>
                {item.avatar ? <img src={item.avatar} alt="" /> : <Icon name={item.icon} size={18} />}
              </span>
            )}
            <span className="ui-list__text">
              <span className="ui-list__title">{item.title}</span>
              {item.description && <span className="ui-list__desc">{item.description}</span>}
            </span>
            {item.meta && <span className="ui-list__meta">{item.meta}</span>}
            {item.action}
            {selectable && (
              <span className="ui-list__check" aria-hidden>
                <Icon name="check" size={16} strokeWidth={2.5} />
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
