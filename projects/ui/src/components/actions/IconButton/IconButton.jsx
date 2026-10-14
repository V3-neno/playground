import { useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx, useMagnet } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import './IconButton.css'

const ICON_SIZE = { sm: 16, md: 18, lg: 22 }

/** A square (or round) button with only an icon. `label` is required: it becomes aria-label + tooltip. */
export function IconButton({ icon, label, variant = 'ghost', size = 'md', shape = 'square', badge, className, onClick, ...props }) {
  const fx = useFx() // extra: magnetic hover, sparkles and a spin-pop on click
  const ref = useMagnet(fx && !props.disabled, { strength: 0.35 })
  const [spin, setSpin] = useState(0)
  const hasBadge = badge != null && badge !== false
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'ui-icon-button',
        `ui-icon-button--${variant}`,
        `ui-icon-button--${size}`,
        shape === 'round' && 'ui-icon-button--round',
        className,
      )}
      onClick={(e) => {
        if (fx) {
          sparkle(e)
          setSpin((n) => n + 1)
        }
        onClick?.(e)
      }}
      {...props}
    >
      <span key={spin} className="ui-icon-button__icon" data-spin={spin > 0 || undefined}>
        <Icon name={icon} size={ICON_SIZE[size] ?? 18} />
      </span>
      {hasBadge && (
        <span className={cx('ui-icon-button__badge', badge === true && 'is-dot')} aria-hidden>
          {badge === true ? '' : badge}
        </span>
      )}
    </button>
  )
}
