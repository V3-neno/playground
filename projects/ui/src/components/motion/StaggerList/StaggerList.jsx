import { Children, isValidElement, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { useFx } from '../../../lib/fx'
import { useInView } from '../../../lib/hooks'
import { useReducedMotion } from '../../../lib/ui-context'
import './StaggerList.css'

export const STAGGER_EFFECTS = ['rise', 'fade', 'scale', 'slide', 'flip', 'pop']

/**
 * Each child animates in a beat after the previous one. Children should have stable keys.
 * Items added later animate in on their own (no long delay); with `layout`, reorders glide (FLIP).
 * trigger: 'mount' | 'view' (wait until scrolled into view).
 */
export function StaggerList({
  children,
  as: Tag = 'ul',
  effect = 'auto',
  stagger = 70,
  duration,
  trigger = 'mount',
  layout = true,
  className,
  style,
  ...props
}) {
  const fx = useFx()
  const reduced = useReducedMotion()
  const [viewRef, inView] = useInView({ once: true, threshold: 0.1 })
  const [mounted, setMounted] = useState(false)
  const initial = useRef(null) // keys present at first reveal get staggered; later ones don't
  const nodes = useRef(new Map())
  const rects = useRef(new Map())
  const name = effect === 'auto' ? (fx ? 'warp' : 'rise') : effect

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])
  const started = reduced || (trigger === 'view' ? inView : mounted)

  const items = Children.toArray(children).filter(isValidElement)
  if (started && !initial.current) initial.current = new Set(items.map((c) => c.key))

  // FLIP: measure after each render, animate from the old position to the new one.
  useLayoutEffect(() => {
    const next = new Map()
    for (const [key, el] of nodes.current) {
      if (!el.isConnected) continue
      const r = el.getBoundingClientRect()
      next.set(key, r)
      const prev = rects.current.get(key)
      if (layout && !reduced && prev && (prev.left !== r.left || prev.top !== r.top)) {
        el.animate(
          [{ transform: `translate(${prev.left - r.left}px, ${prev.top - r.top}px)` }, { transform: 'none' }],
          { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        )
      }
    }
    rects.current = next
  })

  return (
    <Tag
      ref={viewRef}
      className={cx('ui-stagger', `ui-stagger--${name}`, started && 'is-started', className)}
      style={{ '--_stagger': `${stagger}ms`, ...(duration ? { '--_dur': `${duration}ms` } : null), ...style }}
      {...props}
    >
      {items.map((child, i) => {
        const late = initial.current && !initial.current.has(child.key)
        return (
          <li
            key={child.key}
            className="ui-stagger__item"
            ref={(el) => (el ? nodes.current.set(child.key, el) : nodes.current.delete(child.key))}
            style={{ '--_i': late ? 0 : i }}
          >
            <div className="ui-stagger__inner">{child}</div>
          </li>
        )
      })}
    </Tag>
  )
}
