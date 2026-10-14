import { useEffect, useId, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useControllable, useKey, useOutsideClick } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { Field, keepInView, normalizeOptions } from '../_shared/Field'
import './Dropdown.css'

/** Select-only dropdown: a button that opens a listbox. Type a letter to jump to an option. */
export function Dropdown({
  options: rawOptions = [],
  value,
  defaultValue = null,
  onChange,
  placeholder = 'Select…',
  label,
  hint,
  error,
  size = 'md',
  disabled,
  required,
  defaultOpen = false,
  className,
}) {
  const options = normalizeOptions(rawOptions)
  const [selected, setSelected] = useControllable(value, defaultValue, onChange)
  const [open, setOpen] = useState(defaultOpen)
  const [active, setActive] = useState(() => (defaultOpen ? options.findIndex((o) => o.value === selected) : -1))
  const wrap = useRef(null)
  const trigger = useRef(null)
  const list = useRef(null)
  const typed = useRef({ text: '', at: 0 })
  const listId = useId()
  const fx = useFx()
  const current = options.find((o) => o.value === selected)

  const enabledIndex = (from, dir) => {
    for (let i = 1; i <= options.length; i++) {
      const j = (from + dir * i + options.length * 2) % options.length
      if (!options[j].disabled) return j
    }
    return from
  }

  const openList = (at) => {
    if (disabled) return
    setOpen(true)
    const sel = options.findIndex((o) => o.value === selected)
    setActive(at ?? (sel >= 0 ? sel : enabledIndex(-1, 1)))
  }
  const close = (focusTrigger = true) => {
    setOpen(false)
    if (focusTrigger) trigger.current?.focus({ preventScroll: true })
  }
  const choose = (i) => {
    const o = options[i]
    if (!o || o.disabled) return
    setSelected(o.value)
    close()
    if (fx) sparkle(trigger.current, { count: 12, spread: 70 })
  }

  useOutsideClick(wrap, () => setOpen(false), open)
  useKey('Escape', () => close(), open)

  // Focus the listbox when it opens (keyboard events land there) and keep the active option in view.
  useEffect(() => {
    if (open && !defaultOpen) list.current?.focus({ preventScroll: true })
  }, [open, defaultOpen])
  useEffect(() => {
    keepInView(list.current, list.current?.querySelector(`[data-index="${active}"]`))
  }, [active, open])

  const typeAhead = (key) => {
    const now = Date.now()
    typed.current = { text: (now - typed.current.at > 600 ? '' : typed.current.text) + key.toLowerCase(), at: now }
    const i = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(typed.current.text))
    if (i >= 0) setActive(i)
  }

  const onListKey = (e) => {
    if (e.key === 'ArrowDown') setActive((a) => enabledIndex(a, 1))
    else if (e.key === 'ArrowUp') setActive((a) => enabledIndex(a, -1))
    else if (e.key === 'Home') setActive(enabledIndex(-1, 1))
    else if (e.key === 'End') setActive(enabledIndex(options.length, -1))
    else if (e.key === 'Enter' || e.key === ' ') choose(active)
    else if (e.key === 'Tab') return setOpen(false)
    else if (e.key.length === 1) typeAhead(e.key)
    else return
    e.preventDefault()
  }

  const onTriggerKey = (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault()
      openList()
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      openList()
      typeAhead(e.key)
    }
  }

  return (
    <Field label={label} hint={hint} error={error} required={required} disabled={disabled} className={cx('ui-dropdown', className)}>
      {({ id, describedBy, invalid }) => (
        <div className="ui-dropdown__wrap" ref={wrap}>
          <button
            ref={trigger}
            id={id}
            type="button"
            className={cx('ui-control', `ui-control--${size}`, 'ui-dropdown__trigger')}
            data-open={open || undefined}
            data-invalid={invalid || undefined}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            disabled={disabled}
            onClick={() => (open ? close() : openList())}
            onKeyDown={onTriggerKey}
          >
            {current?.icon && (
              <span className="ui-control__icon">
                <Icon name={current.icon} size={16} />
              </span>
            )}
            <span className={cx('ui-dropdown__value', !current && 'ui-control__placeholder')}>{current?.label ?? placeholder}</span>
            <span className="ui-control__chevron" aria-hidden>
              <Icon name="chevron-down" size={16} />
            </span>
          </button>
          {open && (
            <ul
              ref={list}
              id={listId}
              role="listbox"
              tabIndex={-1}
              className="ui-pop ui-pop--list"
              aria-labelledby={id}
              aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
              onKeyDown={onListKey}
            >
              {options.map((o, i) => (
                <li
                  key={String(o.value)}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  className="ui-option"
                  style={{ '--i': i }}
                  aria-selected={o.value === selected}
                  aria-disabled={o.disabled || undefined}
                  data-active={i === active || undefined}
                  onPointerMove={() => !o.disabled && setActive(i)}
                  onClick={() => choose(i)}
                >
                  {o.icon && <Icon name={o.icon} size={16} />}
                  <span className="ui-option__text">
                    {o.label}
                    {o.description && <span className="ui-option__desc">{o.description}</span>}
                  </span>
                  <span className="ui-option__check" aria-hidden>
                    <Icon name="check" size={16} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Field>
  )
}
