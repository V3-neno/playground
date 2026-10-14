import { useEffect, useRef } from 'react'
import { cx } from '../../../lib/cx'
import { useFx } from '../../../lib/fx'
import { useReducedMotion } from '../../../lib/ui-context'
import './Parallax.css'

function scrollParent(el) {
  for (let p = el?.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p)
    if (/(auto|scroll|overlay)/.test(overflowY) && p.scrollHeight > p.clientHeight) return p
  }
  return window
}

/**
 * A scene of <ParallaxLayer>s that move at different speeds.
 * mode 'scroll': layers shift as the scene passes through its scroll container (or the page).
 * mode 'pointer': layers follow the cursor. In the Extra style the whole scene also tilts in 3D.
 * Layer speed: 0 = fixed to the scene, positive = moves with the input, negative = against it.
 */
export function Parallax({ mode = 'scroll', strength = 1, height = 320, className, style, children }) {
  const ref = useRef(null)
  const fx = useFx()
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    let frame = 0
    const set = (k, v) => el.style.setProperty(k, v)

    if (mode === 'pointer') {
      const move = (e) => {
        const r = el.getBoundingClientRect()
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => {
          set('--_mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
          set('--_my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
        })
      }
      const leave = () => {
        set('--_mx', 0)
        set('--_my', 0)
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        cancelAnimationFrame(frame)
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
      }
    }

    const scroller = scrollParent(el)
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const view = scroller === window ? { top: 0, height: window.innerHeight } : scroller.getBoundingClientRect()
      // -1 when the scene's centre is at the bottom of the view, +1 at the top
      const p = (view.top + view.height / 2 - (r.top + r.height / 2)) / (view.height / 2 + r.height / 2)
      set('--_p', Math.max(-1.2, Math.min(1.2, p)).toFixed(4))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [mode, reduced])

  return (
    <div
      ref={ref}
      className={cx('ui-parallax', `ui-parallax--${mode}`, fx && 'is-fx', className)}
      style={{ '--_strength': strength, height, ...style }}
    >
      <div className="ui-parallax__scene">{children}</div>
    </div>
  )
}

export function ParallaxLayer({ speed = 0.5, className, style, children }) {
  return (
    <div className={cx('ui-parallax__layer', className)} style={{ '--_speed': speed, ...style }}>
      {children}
    </div>
  )
}
