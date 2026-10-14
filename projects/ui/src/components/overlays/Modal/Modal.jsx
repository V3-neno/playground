import { useEffect, useRef } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { useControllable, useKey } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { useFocusTrap, usePresence, useStableId } from '../_shared/overlay'
import '../_shared/surface.css'
import './Modal.css'

/**
 * Centered dialog. Controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`).
 * `inline` renders it statically open in the flow (no backdrop, focus trap or key handling), for previews.
 */
export function Modal({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  hideClose = false,
  initialFocus,
  inline = false,
  className,
}) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const { mounted, state } = usePresence(inline || open)
  const panel = useRef(null)
  const id = useStableId('ui-modal')
  const fx = useFx()
  const close = () => setOpen(false)

  useKey('Escape', close, open && !inline)
  useFocusTrap(panel, open && mounted && !inline, initialFocus)

  // Extra: the dialog arrives with a confetti pop.
  useEffect(() => {
    if (fx && state === 'open' && !inline && panel.current) {
      const t = setTimeout(() => panel.current && burst(panel.current, { count: 34, spread: 220 }), 120)
      return () => clearTimeout(t)
    }
  }, [fx, state, inline])

  if (!mounted) return null

  const dialog = (
    <div
      ref={panel}
      role="dialog"
      aria-modal={inline ? undefined : true}
      aria-labelledby={title ? `${id}-title` : undefined}
      aria-describedby={description ? `${id}-desc` : undefined}
      tabIndex={-1}
      className={cx('ui-modal__panel', 'ui-ov-surface', `ui-modal--${size}`, className)}
    >
      {(title || !hideClose) && (
        <header className="ui-modal__head">
          <div className="ui-modal__titles">
            {title && (
              <h2 id={`${id}-title`} className="ui-modal__title ui-heading">
                {title}
              </h2>
            )}
            {description && (
              <p id={`${id}-desc`} className="ui-modal__desc">
                {description}
              </p>
            )}
          </div>
          {!hideClose && !inline && (
            <button type="button" className="ui-ov-close" aria-label="Close" onClick={close}>
              <Icon name="x" size={18} />
            </button>
          )}
        </header>
      )}
      {children && <div className="ui-modal__body">{children}</div>}
      {footer && <footer className="ui-modal__foot">{footer}</footer>}
    </div>
  )

  if (inline) return <div className="ui-modal ui-modal--inline" data-state="open">{dialog}</div>

  return (
    <div className="ui-modal" data-state={state}>
      <div className="ui-ov-backdrop" aria-hidden onClick={closeOnBackdrop ? close : undefined} />
      {dialog}
    </div>
  )
}
