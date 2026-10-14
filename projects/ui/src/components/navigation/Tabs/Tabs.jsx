import { useId, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useControllable, useRovingKeys } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { useIndicator } from '../_shared/useIndicator'
import './Tabs.css'

/**
 * items: [{ id, label, icon?, badge?, disabled?, content? }]
 * variant: underline | pills | segmented
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  variant = 'underline',
  size = 'md',
  fitted = false,
  className,
  ...props
}) {
  const enabled = items.filter((i) => !i.disabled)
  const [active, setActive] = useControllable(value, defaultValue ?? enabled[0]?.id, onChange)
  const [flip, setFlip] = useState(0) // toggles to retrigger the indicator's squish animation
  const fx = useFx()
  const baseId = useId()
  const tabRefs = useRef({})
  const [listRef, indStyle, ready] = useIndicator(active, [variant, size, fitted, items.length])
  const index = Math.max(0, enabled.findIndex((i) => i.id === active))

  const select = (id) => {
    if (id === active) return
    setActive(id)
    setFlip((f) => f + 1)
    if (fx) sparkle(tabRefs.current[id])
  }
  const onKeyDown = useRovingKeys({
    count: enabled.length,
    index,
    orientation: 'horizontal',
    setIndex: (i) => {
      const id = enabled[i].id
      select(id)
      tabRefs.current[id]?.focus()
    },
  })
  const current = items.find((i) => i.id === active)

  return (
    <div className={cx('ui-tabs', `ui-tabs--${variant}`, `ui-tabs--${size}`, fitted && 'ui-tabs--fitted', className)} {...props}>
      <div
        ref={listRef}
        role="tablist"
        className="ui-tabs__list"
        style={indStyle}
        data-ready={ready || undefined}
        data-flip={flip % 2}
        data-moved={flip > 0 || undefined}
        onKeyDown={onKeyDown}
      >
        <span className="ui-tabs__indicator" aria-hidden />
        {items.map((item) => {
          const selected = item.id === active
          return (
            <button
              key={item.id}
              ref={(el) => (tabRefs.current[item.id] = el)}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={item.content !== undefined ? `${baseId}-panel-${item.id}` : undefined}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              data-indicator-target={selected || undefined}
              className="ui-tabs__tab"
              onClick={() => select(item.id)}
            >
              {item.icon && <Icon name={item.icon} size={size === 'sm' ? 14 : 16} />}
              <span>{item.label}</span>
              {item.badge != null && <span className="ui-tabs__badge">{item.badge}</span>}
            </button>
          )
        })}
      </div>
      {current?.content !== undefined && (
        <div
          key={active}
          role="tabpanel"
          id={`${baseId}-panel-${active}`}
          aria-labelledby={`${baseId}-tab-${active}`}
          tabIndex={0}
          className="ui-tabs__panel"
        >
          {current.content}
        </div>
      )}
    </div>
  )
}
