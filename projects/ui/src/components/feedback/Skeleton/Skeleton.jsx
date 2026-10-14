import { cx } from '../../../lib/cx'
import './Skeleton.css'

/**
 * Placeholder shape while content loads. Use `lines` for a text block, `circle` for avatars,
 * or width/height for anything else. Skeletons are aria-hidden: put aria-busy on the region that is loading.
 */
export function Skeleton({ width, height, radius, circle = false, lines, animate = true, className, style, ...props }) {
  if (lines) {
    return (
      <span className={cx('ui-skeleton-lines', className)} style={{ width, ...style }} aria-hidden {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className={cx('ui-skeleton', 'ui-skeleton--text', !animate && 'is-static')}
            style={{ width: lines > 1 && i === lines - 1 ? '62%' : '100%', '--i': i }}
          />
        ))}
      </span>
    )
  }
  return (
    <span
      className={cx('ui-skeleton', circle && 'ui-skeleton--circle', !animate && 'is-static', className)}
      style={{
        width: width ?? (circle ? height ?? 40 : '100%'),
        height: height ?? (circle ? width ?? 40 : 16),
        borderRadius: radius,
        ...style,
      }}
      aria-hidden
      {...props}
    />
  )
}
