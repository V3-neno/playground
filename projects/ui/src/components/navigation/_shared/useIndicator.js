import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Sliding indicator for tabs, pagination, menus and navs.
 * Put `data-indicator-target` on the one child the indicator should sit behind; the returned ref goes on a
 * position: relative container. Returns [ref, style, ready]: style carries --ind-x/-y/-w/-h, `ready` turns
 * true one frame after the first measurement so the indicator doesn't slide in from the corner on mount.
 */
export function useIndicator(key, deps = []) {
  const ref = useRef(null)
  const [rect, setRect] = useState(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const box = ref.current
    if (!box) return
    const measure = () => {
      const el = box.querySelector('[data-indicator-target]')
      if (!el || !el.offsetParent) return setRect(null)
      const next = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }
      setRect((r) => (r && r.x === next.x && r.y === next.y && r.w === next.w && r.h === next.h ? r : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    const target = box.querySelector('[data-indicator-target]')
    if (target) ro.observe(target)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [key, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!rect || ready) return
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [rect, ready])

  const style = rect
    ? { '--ind-x': `${rect.x}px`, '--ind-y': `${rect.y}px`, '--ind-w': `${rect.w}px`, '--ind-h': `${rect.h}px`, '--ind-o': 1 }
    : { '--ind-o': 0 }
  return [ref, style, ready]
}
