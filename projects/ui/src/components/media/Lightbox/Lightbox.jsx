import { useEffect, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useControllable } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import './Lightbox.css'

/**
 * Full-screen image viewer. images: [{ src, title?, caption?, alt? }].
 * Keys: ←/→ navigate, +/−/0 zoom, Escape un-zooms then closes. Click the image to zoom at that point;
 * while zoomed the image follows the cursor (or drag on touch).
 */
export function Lightbox({
  images,
  open,
  defaultOpen = false,
  onOpenChange,
  index,
  defaultIndex = 0,
  onIndexChange,
  loop = true,
  thumbnails = true,
  label = 'Image viewer',
}) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange)
  const [i, setI] = useControllable(index, defaultIndex, onIndexChange)
  const [zoom, setZoom] = useState(1)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [dir, setDir] = useState(0)
  const fx = useFx()
  const dialog = useRef(null)
  const closeBtn = useRef(null)
  const stage = useRef(null)
  const n = images.length
  const img = images[i] ?? images[0]

  const go = (to) => {
    const next = loop ? (to + n) % n : Math.max(0, Math.min(n - 1, to))
    if (next === i) return
    setDir(to > i ? 1 : -1)
    setZoom(1)
    setI(next)
  }
  const close = () => {
    setZoom(1)
    setOpen(false)
  }

  // Focus the close button on open, give focus back to whatever opened us on close.
  useEffect(() => {
    if (!isOpen) return
    const opener = document.activeElement
    closeBtn.current?.focus({ preventScroll: true })
    if (fx) requestAnimationFrame(() => stage.current && sparkle(stage.current, { count: 14, spread: 160 }))
    return () => opener?.focus?.({ preventScroll: true })
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !img) return null

  const onKeyDown = (e) => {
    const keys = {
      ArrowRight: () => go(i + 1),
      ArrowLeft: () => go(i - 1),
      Escape: () => (zoom > 1 ? setZoom(1) : close()),
      '+': () => setZoom((z) => Math.min(4, z + 0.5)),
      '=': () => setZoom((z) => Math.min(4, z + 0.5)),
      '-': () => setZoom((z) => Math.max(1, z - 0.5)),
      0: () => setZoom(1),
    }
    if (keys[e.key]) {
      e.preventDefault()
      e.stopPropagation()
      keys[e.key]()
    }
    if (e.key === 'Tab') trapFocus(e, dialog.current)
  }

  const pointAt = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }
  }

  return (
    <div
      ref={dialog}
      className={cx('ui-lightbox', zoom > 1 && 'is-zoomed')}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onKeyDown={onKeyDown}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <header className="ui-lightbox__bar">
        <span className="ui-lightbox__count" aria-live="polite">
          {i + 1} / {n}
        </span>
        <span className="ui-lightbox__title">{img.title}</span>
        <div className="ui-lightbox__tools">
          <button type="button" className="ui-lightbox__btn" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom((z) => Math.max(1, z - 0.5))}>
            <Icon name="minus" size={18} />
          </button>
          <span className="ui-lightbox__zoom">{Math.round(zoom * 100)}%</span>
          <button type="button" className="ui-lightbox__btn" aria-label="Zoom in" disabled={zoom >= 4} onClick={() => setZoom((z) => Math.min(4, z + 0.5))}>
            <Icon name="plus" size={18} />
          </button>
          <button ref={closeBtn} type="button" className="ui-lightbox__btn" aria-label="Close" onClick={close}>
            <Icon name="x" size={18} />
          </button>
        </div>
      </header>

      <div ref={stage} className="ui-lightbox__stage" onClick={(e) => e.target === e.currentTarget && close()}>
        <figure key={i} className="ui-lightbox__figure" data-dir={dir}>
          <img
            src={img.src}
            alt={img.alt ?? img.title ?? ''}
            draggable={false}
            style={{ transform: `scale(${zoom})`, transformOrigin: `${origin.x}% ${origin.y}%` }}
            onClick={(e) => {
              setOrigin(pointAt(e))
              setZoom((z) => (z > 1 ? 1 : 2.5))
            }}
            onPointerMove={(e) => zoom > 1 && setOrigin(pointAt(e))}
          />
          {img.caption && <figcaption>{img.caption}</figcaption>}
        </figure>
        {n > 1 && (
          <>
            <button type="button" className="ui-lightbox__nav ui-lightbox__nav--prev" aria-label="Previous image" disabled={!loop && i === 0} onClick={() => go(i - 1)}>
              <Icon name="chevron-left" size={26} />
            </button>
            <button type="button" className="ui-lightbox__nav ui-lightbox__nav--next" aria-label="Next image" disabled={!loop && i === n - 1} onClick={() => go(i + 1)}>
              <Icon name="chevron-right" size={26} />
            </button>
          </>
        )}
      </div>

      {thumbnails && n > 1 && (
        <div className="ui-lightbox__thumbs">
          {images.map((im, k) => (
            <button
              key={k}
              type="button"
              className={cx('ui-lightbox__thumb', k === i && 'is-active')}
              aria-label={`Show image ${k + 1}${im.title ? `: ${im.title}` : ''}`}
              aria-current={k === i || undefined}
              onClick={() => go(k)}
            >
              <img src={im.src} alt="" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function trapFocus(e, root) {
  const items = [...root.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
