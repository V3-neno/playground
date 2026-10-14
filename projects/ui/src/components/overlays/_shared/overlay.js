// Shared bits for the overlay components: enter/exit presence and focus trapping.
import { useEffect, useRef, useState } from 'react'

export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Keeps an overlay mounted long enough to play its exit transition.
 * state: 'closed' on the first frame after mounting (so the enter transition runs), then 'open'.
 */
export function usePresence(open, exitMs = 240) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (open) {
      setMounted(true)
      let inner
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true))
      })
      return () => {
        cancelAnimationFrame(outer)
        cancelAnimationFrame(inner)
      }
    }
    setVisible(false)
    const t = setTimeout(() => setMounted(false), exitMs)
    return () => clearTimeout(t)
  }, [open, exitMs])
  return { mounted, state: visible && open ? 'open' : 'closed' }
}

/**
 * While active: moves focus into `ref` (initialFocus or the first focusable), keeps Tab inside it,
 * and gives focus back to whatever had it before when deactivated.
 */
export function useFocusTrap(ref, active, initialFocus) {
  const restore = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!active || !el) return
    restore.current = document.activeElement
    const first = initialFocus?.current ?? el.querySelector(FOCUSABLE) ?? el
    first.focus({ preventScroll: true })
    const onKey = (e) => {
      if (e.key !== 'Tab') return
      const items = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.getClientRects().length)
      if (!items.length) {
        e.preventDefault()
        return
      }
      const f = items[0]
      const l = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === f || !el.contains(document.activeElement))) {
        e.preventDefault()
        l.focus()
      } else if (!e.shiftKey && document.activeElement === l) {
        e.preventDefault()
        f.focus()
      }
    }
    el.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('keydown', onKey)
      restore.current?.focus?.({ preventScroll: true })
    }
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps
}

let uid = 0
/** Stable id for aria wiring that also works in the inline (static) previews. */
export function useStableId(prefix) {
  const ref = useRef(null)
  if (ref.current == null) ref.current = `${prefix}-${++uid}`
  return ref.current
}
