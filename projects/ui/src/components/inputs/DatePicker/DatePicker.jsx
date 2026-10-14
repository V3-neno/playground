import { useEffect, useId, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { useControllable, useOutsideClick } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { Field } from '../_shared/Field'
import { addDays, addMonths, iso, monthGrid, sameDay, sameMonth, startOfDay, weekdayNames } from './calendar'
import './DatePicker.css'

/**
 * Month calendar as an ARIA grid. Arrows move by day/week, PageUp/PageDown by month
 * (Shift for year), Home/End to the week's start/end, Enter or Space picks.
 */
export function Calendar({ value, onChange, min, max, weekStartsOn = 1, locale = 'en', autoFocus = false, onEscape }) {
  const today = startOfDay(new Date())
  const [focus, setFocus] = useState(() => value ?? today)
  const [dir, setDir] = useState(0) // slide direction for the month transition
  const grid = useRef(null)
  const shouldFocus = useRef(autoFocus)
  const fx = useFx()
  const titleId = useId()

  const disabled = (d) => (min && d < startOfDay(min)) || (max && d > startOfDay(max))
  const month = new Date(focus.getFullYear(), focus.getMonth(), 1)
  const weeks = monthGrid(month, weekStartsOn)
  const title = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(month)

  const move = (d, { focusIt = true } = {}) => {
    if (!sameMonth(d, focus)) setDir(d > focus ? 1 : -1)
    setFocus(d)
    shouldFocus.current = focusIt
  }

  useEffect(() => {
    if (shouldFocus.current) grid.current?.querySelector('[tabindex="0"]')?.focus({ preventScroll: true })
  }, [focus])

  const pick = (d, e) => {
    if (disabled(d)) return
    onChange?.(d)
    if (fx) burst(e?.currentTarget ?? grid.current?.querySelector('[tabindex="0"]'), { count: 24, spread: 90 })
  }

  const onKey = (e) => {
    const k = e.key
    let next
    if (k === 'ArrowLeft') next = addDays(focus, -1)
    else if (k === 'ArrowRight') next = addDays(focus, 1)
    else if (k === 'ArrowUp') next = addDays(focus, -7)
    else if (k === 'ArrowDown') next = addDays(focus, 7)
    else if (k === 'PageUp') next = addMonths(focus, e.shiftKey ? -12 : -1)
    else if (k === 'PageDown') next = addMonths(focus, e.shiftKey ? 12 : 1)
    else if (k === 'Home') next = addDays(focus, -((focus.getDay() - weekStartsOn + 7) % 7))
    else if (k === 'End') next = addDays(focus, 6 - ((focus.getDay() - weekStartsOn + 7) % 7))
    else if (k === 'Enter' || k === ' ') {
      e.preventDefault()
      return pick(focus, e)
    } else if (k === 'Escape' && onEscape) {
      e.preventDefault()
      return onEscape()
    } else return
    e.preventDefault()
    move(next)
  }

  return (
    <div className="ui-calendar">
      <div className="ui-calendar__head">
        <button type="button" className="ui-calendar__nav" aria-label="Previous month" onClick={() => move(addMonths(focus, -1), { focusIt: false })}>
          <Icon name="chevron-left" size={16} />
        </button>
        <div className="ui-calendar__title" id={titleId} aria-live="polite">
          {title}
        </div>
        <button type="button" className="ui-calendar__nav" aria-label="Next month" onClick={() => move(addMonths(focus, 1), { focusIt: false })}>
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
      <table ref={grid} role="grid" aria-labelledby={titleId} className="ui-calendar__grid" onKeyDown={onKey}>
        <thead>
          <tr>
            {weekdayNames(locale, weekStartsOn).map((w) => (
              <th key={w} scope="col" abbr={w}>
                {w.slice(0, 2)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody key={iso(month)} data-dir={dir}>
          {weeks.map((week) => (
            <tr key={iso(week[0])}>
              {week.map((d) => {
                const selected = sameDay(d, value)
                const off = disabled(d)
                return (
                  <td key={iso(d)} role="gridcell" aria-selected={selected || undefined}>
                    <button
                      type="button"
                      className="ui-calendar__day"
                      tabIndex={sameDay(d, focus) ? 0 : -1}
                      aria-label={new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(d)}
                      aria-current={sameDay(d, today) ? 'date' : undefined}
                      aria-disabled={off || undefined}
                      data-outside={!sameMonth(d, month) || undefined}
                      data-selected={selected || undefined}
                      onClick={(e) => {
                        move(d, { focusIt: false })
                        pick(d, e)
                      }}
                    >
                      {d.getDate()}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ui-calendar__foot">
        <button type="button" className="ui-calendar__today" onClick={(e) => (move(today, { focusIt: false }), pick(today, e))} disabled={disabled(today)}>
          Today
        </button>
      </div>
    </div>
  )
}

export function DatePicker({
  value,
  defaultValue = null,
  onChange,
  label,
  hint,
  error,
  placeholder = 'Pick a date',
  min,
  max,
  weekStartsOn = 1,
  locale = 'en',
  size = 'md',
  clearable = true,
  disabled,
  required,
  defaultOpen = false,
  className,
}) {
  const [date, setDate] = useControllable(value, defaultValue, onChange)
  const [open, setOpen] = useState(defaultOpen)
  const wrap = useRef(null)
  const trigger = useRef(null)
  const dialogId = useId()
  useOutsideClick(wrap, () => setOpen(false), open)

  const close = () => {
    setOpen(false)
    trigger.current?.focus({ preventScroll: true })
  }

  return (
    <Field label={label} hint={hint} error={error} required={required} disabled={disabled} className={cx('ui-datepicker', className)}>
      {({ id, describedBy, invalid }) => (
        <div className="ui-datepicker__wrap" ref={wrap}>
          <div className={cx('ui-control', `ui-control--${size}`)} data-open={open || undefined} data-invalid={invalid || undefined}>
            <span className="ui-control__icon">
              <Icon name="calendar" size={16} />
            </span>
            <button
              ref={trigger}
              id={id}
              type="button"
              className={cx('ui-datepicker__trigger', !date && 'ui-control__placeholder')}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={dialogId}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              disabled={disabled}
              onClick={() => setOpen((o) => !o)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setOpen(true)
                }
              }}
            >
              {date ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date) : placeholder}
            </button>
            {clearable && date && !disabled && (
              <button type="button" className="ui-control__btn" aria-label="Clear date" onClick={() => setDate(null)}>
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
          {open && (
            <div id={dialogId} role="dialog" aria-modal="false" aria-label="Choose date" className="ui-pop ui-datepicker__pop">
              <Calendar
                value={date}
                min={min}
                max={max}
                weekStartsOn={weekStartsOn}
                locale={locale}
                autoFocus={!defaultOpen}
                onEscape={close}
                onChange={(d) => {
                  setDate(d)
                  close()
                }}
              />
            </div>
          )}
        </div>
      )}
    </Field>
  )
}
