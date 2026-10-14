import { useEffect, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { useFx } from '../../../lib/fx'
import { useReducedMotion } from '../../../lib/ui-context'
import './PageTransition.css'

export const PAGE_EFFECTS = ['fade', 'slide', 'scale', 'flip', 'wipe', 'portal']

/**
 * Animates between "pages": change `pageKey` and the old content plays out while the new one plays in.
 * effect: one of PAGE_EFFECTS or 'auto' (fade; 'portal' in the Extra style, a circle that opens from
 * wherever you last clicked). direction: 1 forward / -1 back, used by slide.
 */
export function PageTransition({ pageKey, effect = 'auto', direction = 1, duration, className, style, children }) {
  const fx = useFx()
  const reduced = useReducedMotion()
  const root = useRef(null)
  const lastPointer = useRef(null)
  const [pages, setPages] = useState([{ key: pageKey, node: children, phase: 'idle' }])
  const name = effect === 'auto' ? (fx ? 'portal' : 'fade') : effect

  // Remember the last click so 'portal' can open from it.
  useEffect(() => {
    const onDown = (e) => (lastPointer.current = { x: e.clientX, y: e.clientY })
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [])

  const current = pages[pages.length - 1]
  if (current.key !== pageKey) {
    // Adjusting state during render (React's recommended pattern for derived transitions).
    let origin = '50% 50%'
    const r = root.current?.getBoundingClientRect()
    if (r && lastPointer.current) origin = `${lastPointer.current.x - r.left}px ${lastPointer.current.y - r.top}px`
    setPages(
      reduced
        ? [{ key: pageKey, node: children, phase: 'idle' }]
        : [
            ...pages.filter((p) => p.phase !== 'exit').map((p) => ({ ...p, phase: 'exit' })),
            { key: pageKey, node: children, phase: 'enter', origin },
          ],
    )
  }

  const done = (key, phase) =>
    setPages((ps) => (phase === 'exit' ? ps.filter((p) => p.key !== key || p.phase !== 'exit') : ps.map((p) => (p.key === key ? { ...p, phase: 'idle' } : p))))

  return (
    <div
      ref={root}
      className={cx('ui-page-transition', `ui-page-transition--${name}`, pages.length > 1 && 'is-animating', className)}
      style={{ '--_dir': direction, ...(duration ? { '--_dur': `${duration}ms` } : null), ...style }}
    >
      {pages.map((p) => (
        <div
          key={p.phase === 'exit' ? `${p.key}-exit` : p.key}
          className={cx('ui-page-transition__page', `is-${p.phase}`)}
          style={p.origin ? { '--_origin': p.origin } : undefined}
          aria-hidden={p.phase === 'exit' || undefined}
          inert={p.phase === 'exit' || undefined}
          onAnimationEnd={(e) => e.target === e.currentTarget && !e.pseudoElement && p.phase !== 'idle' && done(p.key, p.phase)}
        >
          {p.key === pageKey ? children : p.node}
        </div>
      ))}
    </div>
  )
}
