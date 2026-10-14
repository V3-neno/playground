import { useEffect, useId, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, sparkle, useFx } from '../../../lib/fx'
import { useControllable, useOutsideClick } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { Field, keepInView, normalizeOptions } from '../_shared/Field'
import './Combobox.css'

/** Wraps the matching part of `label` in <mark>. */
function Highlight({ label, query }) {
  const i = query ? label.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (i < 0) return label
  return (
    <>
      {label.slice(0, i)}
      <mark className="ui-combobox__match">{label.slice(i, i + query.length)}</mark>
      {label.slice(i + query.length)}
    </>
  )
}

/**
 * Type-to-filter select. Single value, or `multiple` for chips.
 * value: the option value (single) or an array of values (multiple).
 */
export function Combobox({
  options: rawOptions = [],
  value,
  defaultValue,
  onChange,
  multiple = false,
  placeholder = 'Search…',
  label,
  hint,
  error,
  size = 'md',
  disabled,
  required,
  emptyText = 'No matches',
  className,
}) {
  const options = normalizeOptions(rawOptions)
  const [selected, setSelected] = useControllable(value, defaultValue ?? (multiple ? [] : null), onChange)
  const single = !multiple ? options.find((o) => o.value === selected) : null
  const [query, setQuery] = useState(single?.label ?? '')
  const [typing, setTyping] = useState(false) // filter only while the user is typing, not on reopen
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrap = useRef(null)
  const input = useRef(null)
  const list = useRef(null)
  const listId = useId()
  const fx = useFx()

  const chosen = multiple ? options.filter((o) => selected.includes(o.value)) : []
  const q = typing ? query.trim() : ''
  const filtered = options.filter((o) => !q || o.label.toLowerCase().includes(q.toLowerCase()))

  // Keep the input text in sync when a single value changes from outside.
  useEffect(() => {
    if (!multiple && !typing) setQuery(single?.label ?? '')
  }, [single?.label, multiple]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    keepInView(list.current, list.current?.querySelector(`[data-index="${active}"]`))
  }, [active, open])

  useOutsideClick(
    wrap,
    () => {
      setOpen(false)
      setTyping(false)
      if (!multiple) setQuery(single?.label ?? '')
    },
    open,
  )

  const isSelected = (o) => (multiple ? selected.includes(o.value) : o.value === selected)

  const choose = (o, e) => {
    if (!o || o.disabled) return
    if (multiple) {
      const adding = !selected.includes(o.value)
      setSelected(adding ? [...selected, o.value] : selected.filter((v) => v !== o.value))
      setQuery('')
      setTyping(false)
      if (fx && adding) burst(e?.clientX ? e : input.current, { count: 18, spread: 80 })
      input.current?.focus({ preventScroll: true })
    } else {
      setSelected(o.value)
      setQuery(o.label)
      setTyping(false)
      setOpen(false)
      if (fx) sparkle(input.current, { count: 12, spread: 70 })
    }
  }

  const remove = (v) => {
    setSelected(selected.filter((x) => x !== v))
    input.current?.focus({ preventScroll: true })
  }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      else setActive((a) => Math.min(filtered.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      if (open && filtered[active]) {
        e.preventDefault()
        choose(filtered[active])
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        setOpen(false)
      } else if (!multiple) {
        setSelected(null)
        setQuery('')
      }
    } else if (e.key === 'Backspace' && multiple && !query && selected.length) {
      remove(selected[selected.length - 1])
    }
  }

  const activeId = open && filtered[active] ? `${listId}-${active}` : undefined

  return (
    <Field label={label} hint={hint} error={error} required={required} disabled={disabled} className={cx('ui-combobox', className)}>
      {({ id, describedBy, invalid }) => (
        <div className="ui-combobox__wrap" ref={wrap}>
          <div
            className={cx('ui-control', `ui-control--${size}`, 'ui-combobox__box', multiple && 'ui-combobox__box--multi')}
            data-open={open || undefined}
            data-invalid={invalid || undefined}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault()
                input.current?.focus()
              }
            }}
          >
            {!multiple && (
              <span className="ui-control__icon">
                <Icon name="search" size={16} />
              </span>
            )}
            {chosen.map((o) => (
              <span key={String(o.value)} className="ui-combobox__chip">
                {o.label}
                <button type="button" aria-label={`Remove ${o.label}`} disabled={disabled} onClick={() => remove(o.value)}>
                  <Icon name="x" size={12} strokeWidth={2.5} />
                </button>
              </span>
            ))}
            <input
              ref={input}
              id={id}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listId}
              aria-activedescendant={activeId}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              autoComplete="off"
              placeholder={multiple && chosen.length ? '' : placeholder}
              value={query}
              disabled={disabled}
              onChange={(e) => {
                setQuery(e.target.value)
                setTyping(true)
                setActive(0)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onClick={() => setOpen(true)}
              onKeyDown={onKey}
            />
            <button
              type="button"
              tabIndex={-1}
              className="ui-control__chevron ui-combobox__toggle"
              aria-label={open ? 'Close' : 'Open'}
              disabled={disabled}
              onClick={() => {
                setOpen((o) => !o)
                input.current?.focus({ preventScroll: true })
              }}
            >
              <Icon name="chevron-down" size={16} />
            </button>
          </div>
          {open && (
            <ul ref={list} id={listId} role="listbox" aria-multiselectable={multiple || undefined} className="ui-pop ui-pop--list">
              {filtered.length === 0 && <li className="ui-option-empty">{emptyText}</li>}
              {filtered.map((o, i) => (
                <li
                  key={String(o.value)}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  className="ui-option"
                  style={{ '--i': i }}
                  aria-selected={isSelected(o)}
                  aria-disabled={o.disabled || undefined}
                  data-active={i === active || undefined}
                  onPointerMove={() => setActive(i)}
                  onPointerDown={(e) => e.preventDefault() /* keep focus in the input */}
                  onClick={(e) => choose(o, e)}
                >
                  {o.icon && <Icon name={o.icon} size={16} />}
                  <span className="ui-option__text">
                    <span>
                      <Highlight label={o.label} query={q} />
                    </span>
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
