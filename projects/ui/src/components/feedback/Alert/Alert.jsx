import { useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import { useReducedMotion } from '../../../lib/ui-context'
import './Alert.css'

const ICONS = { info: 'info', success: 'check-circle', warning: 'alert', danger: 'x-circle' }

/**
 * Inline message banner. tone: info | success | warning | danger; variant: soft | outline | solid.
 * Warnings and errors use role="alert" (announced immediately), the rest role="status".
 */
export function Alert({
  tone = 'info',
  variant = 'soft',
  title,
  icon,
  action,
  dismissible = false,
  onDismiss,
  className,
  children,
  ...props
}) {
  const [open, setOpen] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const reduced = useReducedMotion()
  const fx = useFx()
  if (!open) return null

  const finish = () => {
    setOpen(false)
    onDismiss?.()
  }
  const dismiss = (e) => {
    if (fx) burst(e, { shapes: ['✨', 'star', 'circle'], count: 16, spread: 70 })
    if (reduced) finish()
    else setLeaving(true)
  }

  return (
    <div
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={cx('ui-alert', `ui-alert--${tone}`, `ui-alert--${variant}`, leaving && 'is-leaving', className)}
      onAnimationEnd={(e) => leaving && e.target === e.currentTarget && finish()}
      {...props}
    >
      {icon !== false && (
        <span className="ui-alert__icon" aria-hidden>
          <Icon name={icon ?? ICONS[tone] ?? 'info'} size={18} />
        </span>
      )}
      <div className="ui-alert__body">
        {title && <div className="ui-alert__title">{title}</div>}
        {children && <div className="ui-alert__text">{children}</div>}
        {action && <div className="ui-alert__actions">{action}</div>}
      </div>
      {dismissible && (
        <button type="button" className="ui-alert__close" aria-label="Dismiss" onClick={dismiss}>
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  )
}
