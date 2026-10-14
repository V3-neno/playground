/*
 * Flourishes for the "extra" style. They're deliberately over the top.
 *
 *   const fx = useFx()                       // true only in the extra style with motion allowed
 *   onClick={(e) => fx && burst(e)}          // confetti from the click point
 *   const ref = useTilt(fx)                  // 3D tilt toward the cursor
 *   const ref = useMagnet(fx)                // element leans toward the cursor
 *
 * Particles are appended to the nearest .ui-root (position: relative) and removed when done.
 */
import { useEffect, useRef } from 'react'
import { useReducedMotion, useUI } from './ui-context'

export function useFx() {
  const { style } = useUI()
  const reduced = useReducedMotion()
  return style === 'extra' && !reduced
}

const SHAPES = ['circle', 'square', 'star', 'strip']

function palette(root) {
  const cs = getComputedStyle(root)
  const colors = [1, 2, 3, 4, 5, 6].map((i) => cs.getPropertyValue(`--ui-chart-${i}`).trim()).filter(Boolean)
  return colors.length ? colors : ['#ff3cac', '#2b86c5', '#00e5c7', '#ffd23f']
}

/**
 * Confetti burst. `from` is a pointer event, an element, or { x, y } in client coordinates.
 * Options: count, spread (px), colors, shapes ('circle' | 'square' | 'star' | 'strip' | an emoji string), gravity,
 * root (the .ui-root to draw in, needed only for a bare { x, y } outside any root).
 */
export function burst(from, { count = 26, spread = 120, colors, shapes = SHAPES, gravity = 1, duration = 900, root: rootEl } = {}) {
  const el = from?.currentTarget ?? from?.target ?? (from instanceof Element ? from : null)
  // A bare { x, y } has no element: use the root passed in, else the .ui-root under that point.
  const atPoint = !el && from && 'x' in from ? document.elementFromPoint(from.x, from.y)?.closest('.ui-root') : null
  const root = rootEl ?? (el ?? document.activeElement)?.closest?.('.ui-root') ?? atPoint
  if (!root) return
  const rr = root.getBoundingClientRect()
  let x, y
  if (from && 'clientX' in from && from.clientX) [x, y] = [from.clientX, from.clientY]
  else if (from && 'x' in from && !(from instanceof Element)) [x, y] = [from.x, from.y]
  else {
    const r = el.getBoundingClientRect()
    ;[x, y] = [r.left + r.width / 2, r.top + r.height / 2]
  }
  x -= rr.left
  y -= rr.top
  const cols = colors ?? palette(root)
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span')
    const shape = shapes[i % shapes.length]
    const size = 5 + Math.random() * 7
    const isEmoji = shape.length > 0 && !SHAPES.includes(shape)
    Object.assign(p.style, {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: isEmoji ? 'auto' : `${shape === 'strip' ? size / 2.5 : size}px`,
      height: isEmoji ? 'auto' : `${shape === 'strip' ? size * 1.6 : size}px`,
      background: isEmoji ? 'none' : cols[i % cols.length],
      borderRadius: shape === 'circle' ? '50%' : '1px',
      clipPath: shape === 'star' ? 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' : 'none',
      fontSize: isEmoji ? `${12 + Math.random() * 10}px` : undefined,
      pointerEvents: 'none',
      zIndex: 9999,
      willChange: 'transform, opacity',
    })
    if (isEmoji) p.textContent = shape
    root.appendChild(p)
    const angle = Math.random() * Math.PI * 2
    const dist = spread * (0.4 + Math.random() * 0.8)
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist - spread * 0.35
    const rot = (Math.random() - 0.5) * 720
    const anim = p.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.4) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy + 80 * gravity}px)) scale(0.8) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: duration * (0.75 + Math.random() * 0.5), easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
    )
    anim.onfinish = () => p.remove()
  }
}

/** A few twinkling stars around an element (or point). Lighter than burst, nice on hover. */
export function sparkle(from, opts = {}) {
  burst(from, { count: 8, spread: 50, shapes: ['star'], gravity: 0.2, duration: 700, ...opts })
}

function withTransition(el, extra) {
  const current = getComputedStyle(el).transition
  return !current || current.startsWith('all 0s') ? extra : `${current}, ${extra}`
}

/** 3D tilt toward the cursor. Returns a ref; pass enabled = false to switch it off. */
export function useTilt(enabled = true, { max = 10, scale = 1.02 } = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(800px) rotateX(${-py * max}deg) rotateY(${px * max}deg) scale(${scale})`
      el.style.setProperty('--fx-x', `${(px + 0.5) * 100}%`) // for an optional sheen: radial-gradient(at var(--fx-x) var(--fx-y), ...)
      el.style.setProperty('--fx-y', `${(py + 0.5) * 100}%`)
    }
    const leave = () => {
      el.style.transform = ''
    }
    // Append to (not replace) the element's own CSS transitions, so its hover/border transitions keep working.
    const prev = el.style.transition
    el.style.transition = withTransition(el, 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)')
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      el.style.transform = ''
      el.style.transition = prev
    }
  }, [enabled, max, scale])
  return ref
}

/** Element drifts toward the cursor while hovered (magnetic buttons). */
export function useMagnet(enabled = true, { strength = 0.3 } = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      el.style.translate = `${dx * strength}px ${dy * strength}px`
    }
    const leave = () => {
      el.style.translate = ''
    }
    const prev = el.style.transition
    el.style.transition = withTransition(el, 'translate 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)')
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      el.style.translate = ''
      el.style.transition = prev
    }
  }, [enabled, strength])
  return ref
}
