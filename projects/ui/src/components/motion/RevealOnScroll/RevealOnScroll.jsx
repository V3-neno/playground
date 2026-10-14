import { useEffect } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useInView } from '../../../lib/hooks'
import { useReducedMotion } from '../../../lib/ui-context'
import './RevealOnScroll.css'

export const REVEAL_EFFECTS = ['fade', 'fade-up', 'fade-down', 'slide-left', 'slide-right', 'zoom', 'blur', 'flip', 'warp']

/**
 * Animates its children in the first time they scroll into view (or every time, with once = false).
 * effect: one of REVEAL_EFFECTS, or 'auto' (fade-up; 'warp' with sparkles in the Extra style).
 */
export function RevealOnScroll({
  effect = 'auto',
  delay = 0,
  duration,
  once = true,
  threshold = 0.2,
  as: Tag = 'div',
  className,
  style,
  children,
  ...props
}) {
  const [ref, inView] = useInView({ once, threshold })
  const reduced = useReducedMotion()
  const fx = useFx()
  const name = effect === 'auto' ? (fx ? 'warp' : 'fade-up') : effect

  useEffect(() => {
    if (!inView || !fx) return
    const t = setTimeout(() => ref.current && sparkle(ref.current, { count: 6 }), delay + 150)
    return () => clearTimeout(t)
  }, [inView, fx]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Tag
      ref={ref}
      className={cx('ui-reveal', `ui-reveal--${name}`, (inView || reduced) && 'is-visible', className)}
      style={{ '--_delay': `${delay}ms`, ...(duration ? { '--_dur': `${duration}ms` } : null), ...style }}
      {...props}
    >
      {children}
    </Tag>
  )
}

export const Reveal = RevealOnScroll
