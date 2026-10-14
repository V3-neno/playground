import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Controlled-or-uncontrolled state, the usual component pattern:
 *   const [open, setOpen] = useControllable(props.open, props.defaultOpen ?? false, props.onOpenChange)
 */
export function useControllable(value, defaultValue, onChange) {
  const [inner, setInner] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : inner
  const ref = useRef(current)
  ref.current = current
  const set = useCallback(
    (next) => {
      const v = typeof next === 'function' ? next(ref.current) : next
      if (!controlled) setInner(v)
      onChange?.(v)
    },
    [controlled, onChange],
  )
  return [current, set]
}

/** Calls handler on pointerdown outside every ref'd element (dropdowns, popovers). */
export function useOutsideClick(refs, handler, enabled = true) {
  const saved = useRef(handler)
  saved.current = handler
  useEffect(() => {
    if (!enabled) return
    const list = Array.isArray(refs) ? refs : [refs]
    const onDown = (e) => {
      if (list.some((r) => r.current?.contains(e.target))) return
      saved.current(e)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps
}

/** useKey('Escape', close, open) */
export function useKey(key, handler, enabled = true) {
  const saved = useRef(handler)
  saved.current = handler
  useEffect(() => {
    if (!enabled) return
    const onKey = (e) => e.key === key && saved.current(e)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [key, enabled])
}

/** [ref, inView]: true once the element scrolls into view (or every time, with once: false). */
export function useInView({ once = true, threshold = 0.2, rootMargin = '0px' } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) setInView(false)
      },
      { threshold, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once, threshold, rootMargin])
  return [ref, inView]
}

/** [ref, { width, height }] tracked with a ResizeObserver. Charts use this to size their SVG. */
export function useElementSize() {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((s) => (s.width === width && s.height === height ? s : { width, height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size]
}

/** setInterval that always calls the latest callback; pass ms = null to pause. */
export function useInterval(callback, ms) {
  const saved = useRef(callback)
  saved.current = callback
  useEffect(() => {
    if (ms == null) return
    const id = setInterval(() => saved.current(), ms)
    return () => clearInterval(id)
  }, [ms])
}

/** Arrow-key roving focus inside a list (menus, tabs, listboxes). Returns an onKeyDown handler. */
export function useRovingKeys({ count, index, setIndex, orientation = 'vertical', loop = true, onSelect }) {
  return (e) => {
    const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    let i = index
    if (e.key === next) i = index + 1
    else if (e.key === prev) i = index - 1
    else if (e.key === 'Home') i = 0
    else if (e.key === 'End') i = count - 1
    else if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
      e.preventDefault()
      onSelect(index)
      return
    } else return
    e.preventDefault()
    if (loop) i = (i + count) % count
    else i = Math.max(0, Math.min(count - 1, i))
    setIndex(i)
  }
}
