// Shared bits for the Inputs category: the label/hint/error wrapper, the field box and popup surface styles.
import { useId } from 'react'
import { cx } from '../../../lib/cx'
import { Icon } from '../../../lib/icons'
import './field.css'

/**
 * Label + control + hint/error. `children` is a function receiving the ids to wire up:
 *   <Field label="Email" error={err}>{({ id, describedBy }) => <input id={id} aria-describedby={describedBy} />}</Field>
 */
export function Field({ label, hint, error, required, disabled, className, labelAs = 'label', children }) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined
  const LabelTag = labelAs
  return (
    <div className={cx('ui-field', className)} data-disabled={disabled || undefined}>
      {label && (
        <LabelTag className="ui-field__label" {...(labelAs === 'label' ? { htmlFor: id } : { id: `${id}-label` })}>
          {label}
          {required && <span className="ui-field__req" aria-hidden> *</span>}
        </LabelTag>
      )}
      {children({ id, labelId: `${id}-label`, describedBy, invalid: !!error })}
      {error ? (
        <div className="ui-field__error" id={errorId}>
          <Icon name="alert" size={14} />
          {error}
        </div>
      ) : (
        hint && (
          <div className="ui-field__hint" id={hintId}>
            {hint}
          </div>
        )
      )}
    </div>
  )
}

/** Accepts ['a', 'b'] or [{ value, label, ... }] and returns the object form. */
export const normalizeOptions = (options = []) =>
  options.map((o) => (typeof o === 'object' ? { label: String(o.value), ...o } : { value: o, label: String(o) }))

/** Scroll `el` into view inside its scrolling popup only (scrollIntoView would also scroll the page). */
export function keepInView(container, el) {
  if (!container || !el) return
  if (el.offsetTop < container.scrollTop) container.scrollTop = el.offsetTop
  else if (el.offsetTop + el.offsetHeight > container.scrollTop + container.clientHeight)
    container.scrollTop = el.offsetTop + el.offsetHeight - container.clientHeight
}
