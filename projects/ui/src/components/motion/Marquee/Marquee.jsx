import { useRef } from 'react'
import { cx } from '../../../lib/cx'
import { useFx } from '../../../lib/fx'
import { useElementSize } from '../../../lib/hooks'
import { useReducedMotion } from '../../../lib/ui-context'
import './Marquee.css'

/**
 * Seamless infinite scroller. The content is rendered twice and each copy slides by its own width.
 * speed: px per second. direction: 'left' | 'right' | 'up' | 'down'.
 * hover: 'pause' | 'slow' | 'none'. In Extra, hovering turbo-charges it instead.
 * With reduced motion it becomes a plain scrollable row.
 */
export function Marquee({
  children,
  speed = 50,
  direction = 'left',
  hover = 'pause',
  gap = 40,
  fade = true,
  label,
  className,
  style,
}) {
  const fx = useFx()
  const reduced = useReducedMotion()
  const root = useRef(null)
  const [groupRef, size] = useElementSize()
  const vertical = direction === 'up' || direction === 'down'
  const length = (vertical ? size.height : size.width) + gap
  const seconds = length > gap ? length / Math.max(1, speed) : 20

  // Change speed on the running animations (no restart, so no jump).
  const rate = (r) => root.current?.querySelectorAll('.ui-marquee__group').forEach((g) => g.getAnimations().forEach((a) => a.updatePlaybackRate(r)))
  const onEnter = () => {
    if (fx) rate(4)
    else if (hover === 'slow') rate(0.25)
  }
  const onLeave = () => (fx || hover === 'slow') && rate(1)

  return (
    <div
      ref={root}
      className={cx(
        'ui-marquee',
        vertical && 'ui-marquee--vertical',
        (direction === 'right' || direction === 'down') && 'ui-marquee--reverse',
        hover === 'pause' && !fx && 'ui-marquee--pausable',
        fade && 'ui-marquee--fade',
        reduced && 'is-static',
        className,
      )}
      style={{ '--_gap': `${gap}px`, '--_dur': `${seconds}s`, ...style }}
      role={label ? 'region' : undefined}
      aria-label={label}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <div ref={groupRef} className="ui-marquee__group">
        {children}
      </div>
      {!reduced && (
        <div className="ui-marquee__group" aria-hidden="true" inert>
          {children}
        </div>
      )}
    </div>
  )
}
