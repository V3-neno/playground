import { cloneElement, isValidElement, useEffect, useRef } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx, useTilt } from '../../../lib/fx'
import { useControllable, useKey, useOutsideClick } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { usePresence, useStableId } from '../_shared/overlay'
import '../_shared/surface.css'
import './Popover.css'

/**
 * Click-triggered floating panel anchored to `trigger` (a single element, e.g. a <Button>).
 * placement: top | right | bottom | left; align: start | center | end.
 * Closes on outside click and Escape (focus returns to the trigger). Not modal: no focus trap.
 */
export function Popover({
  trigger,
  children,
  title,
  placement = 'bottom',
  align = 'center',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  arrow = true,
  showClose = false,
  width,
  className,
}) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const { mounted, state } = usePresence(open, 200)
  const wrap = useRef(null)
  const id = useStableId('ui-popover')
  const fx = useFx()
  const tilt = useTilt(fx && mounted, { max: 8, scale: 1 })

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) wrap.current?.querySelector('[aria-haspopup]')?.focus({ preventScroll: true })
  }
  useOutsideClick(wrap, () => close(false), open)
  useKey('Escape', () => close(true), open)

  useEffect(() => {
    if (fx && state === 'open' && tilt.current) sparkle(tilt.current)
  }, [fx, state]) // eslint-disable-line react-hooks/exhaustive-deps

  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger, {
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        'aria-controls': open ? id : undefined,
        onClick: (e) => {
          trigger.props.onClick?.(e)
          setOpen((o) => !o)
        },
      })
    : trigger

  return (
    <span ref={wrap} className={cx('ui-popover', className)}>
      {triggerEl}
      {mounted && (
        <div
          ref={tilt}
          id={id}
          role="dialog"
          aria-label={typeof title === 'string' ? title : undefined}
          className={cx('ui-popover__panel', 'ui-ov-surface')}
          data-placement={placement}
          data-align={align}
          data-state={state}
          style={width ? { width } : undefined}
        >
          {arrow && <span className="ui-popover__arrow" aria-hidden />}
          {(title || showClose) && (
            <div className="ui-popover__head">
              {title && <div className="ui-popover__title ui-heading">{title}</div>}
              {showClose && (
                <button type="button" className="ui-ov-close" aria-label="Close" onClick={() => close(true)}>
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>
          )}
          <div className="ui-popover__body">{typeof children === 'function' ? children({ close }) : children}</div>
        </div>
      )}
    </span>
  )
}
