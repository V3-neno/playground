import { cx } from '../../../lib/cx'
import './Spinner.css'

const SIZES = { sm: 16, md: 28, lg: 44 }
const PARTS = { dots: 3, bars: 5, orbit: 3, ring: 0, pulse: 0 }

/**
 * Loading indicator. variant: ring | dots | bars | pulse | orbit. size: sm | md | lg or a number (px).
 * Announced via role="status" with a visually hidden `label`.
 */
export function Spinner({ variant = 'ring', size = 'md', tone = 'accent', label = 'Loading', className, style, ...props }) {
  const px = typeof size === 'number' ? size : (SIZES[size] ?? SIZES.md)
  return (
    <span
      role="status"
      className={cx('ui-spinner', `ui-spinner--${variant}`, tone === 'current' && 'ui-spinner--current', className)}
      style={{ '--_s': `${px}px`, ...style }}
      {...props}
    >
      <span className="ui-spinner__visual" aria-hidden>
        {Array.from({ length: PARTS[variant] ?? 0 }, (_, i) => (
          <i key={i} style={{ '--i': i }} />
        ))}
      </span>
      <span className="ui-sr-only">{label}</span>
    </span>
  )
}
