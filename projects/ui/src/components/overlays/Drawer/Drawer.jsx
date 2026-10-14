import { useEffect, useRef } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useControllable, useKey } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { useFocusTrap, usePresence, useStableId } from '../_shared/overlay'
import '../_shared/surface.css'
import './Drawer.css'

/**
 * Panel that slides in from an edge: side = 'right' | 'left' | 'top' | 'bottom'.
 * Controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`). `inline` = static preview.
 */
export function Drawer({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = 'right',
  size,
  title,
  description,
  children,
  footer,
  closeOnBackdrop = true,
  initialFocus,
  inline = false,
  className,
}) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const { mounted, state } = usePresence(inline || open, 360)
  const panel = useRef(null)
  const id = useStableId('ui-drawer')
  const fx = useFx()
  const close = () => setOpen(false)

  useKey('Escape', close, open && !inline)
  useFocusTrap(panel, open && mounted && !inline, initialFocus)

  // Extra: a trail of sparkles along the leading edge once it lands.
  useEffect(() => {
    if (!fx || inline || state !== 'open' || !panel.current) return
    const t = setTimeout(() => {
      const r = panel.current?.getBoundingClientRect()
      if (!r) return
      const vertical = side === 'left' || side === 'right'
      for (let i = 0; i < 5; i++) {
        const x = vertical ? (side === 'right' ? r.left : r.right) : r.left + (r.width * (i + 0.5)) / 5
        const y = vertical ? r.top + (r.height * (i + 0.5)) / 5 : side === 'bottom' ? r.top : r.bottom
        setTimeout(() => panel.current && sparkle({ x, y, target: panel.current }), i * 70)
      }
    }, 260)
    return () => clearTimeout(t)
  }, [fx, state, inline, side])

  if (!mounted) return null
  const dim = size ? { [side === 'left' || side === 'right' ? 'width' : 'height']: size } : undefined

  return (
    <div className={cx('ui-drawer', `ui-drawer--${side}`, inline && 'ui-drawer--inline')} data-state={inline ? 'open' : state}>
      {!inline && <div className="ui-ov-backdrop" aria-hidden onClick={closeOnBackdrop ? close : undefined} />}
      <div
        ref={panel}
        role="dialog"
        aria-modal={inline ? undefined : true}
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-describedby={description ? `${id}-desc` : undefined}
        tabIndex={-1}
        className={cx('ui-drawer__panel', 'ui-ov-surface', className)}
        style={dim}
      >
        <header className="ui-drawer__head">
          <div className="ui-drawer__titles">
            {title && (
              <h2 id={`${id}-title`} className="ui-drawer__title ui-heading">
                {title}
              </h2>
            )}
            {description && (
              <p id={`${id}-desc`} className="ui-drawer__desc">
                {description}
              </p>
            )}
          </div>
          {!inline && (
            <button type="button" className="ui-ov-close" aria-label="Close" onClick={close}>
              <Icon name="x" size={18} />
            </button>
          )}
        </header>
        <div className="ui-drawer__body">{children}</div>
        {footer && <footer className="ui-drawer__foot">{footer}</footer>}
      </div>
    </div>
  )
}
