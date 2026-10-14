import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, sparkle, useFx } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import '../_shared/surface.css'
import './Toast.css'

/*
 * API
 *   <ToastProvider position="bottom-right" max={5}> …app… </ToastProvider>
 *   const { toast, dismiss, clear } = useToast()
 *   const id = toast({ title, description, variant: 'info' | 'success' | 'warning' | 'danger', duration: 4000, action: { label, onClick } })
 *   duration: 0 keeps it until dismissed. Hover or focus pauses the countdown.
 * <Toast …/> is the presentational card on its own (static previews).
 */
const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

const ICONS = { info: 'info', success: 'check-circle', warning: 'alert', danger: 'x-circle' }
let seq = 0

export function ToastProvider({ children, position = 'bottom-right', max = 5 }) {
  const [items, setItems] = useState([])

  const remove = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), [])
  const dismiss = useCallback(
    (id) => {
      setItems((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
      setTimeout(() => remove(id), 260)
    },
    [remove],
  )
  const toast = useCallback(
    (opts) => {
      const id = ++seq
      setItems((list) => [...list, { variant: 'info', duration: 4000, ...opts, id }].slice(-max))
      return id
    },
    [max],
  )
  const clear = useCallback(() => setItems((list) => list.map((t) => ({ ...t, leaving: true }))), [])
  useEffect(() => {
    if (items.length && items.every((t) => t.leaving)) {
      const t = setTimeout(() => setItems([]), 260)
      return () => clearTimeout(t)
    }
  }, [items])

  const api = useMemo(() => ({ toast, dismiss, clear }), [toast, dismiss, clear])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section className="ui-toaster" data-position={position} aria-label="Notifications">
        <ol className="ui-toaster__list" aria-live="polite" aria-relevant="additions">
          {items.map((t) => (
            <ToastItem key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </ol>
      </section>
    </ToastContext.Provider>
  )
}

function ToastItem({ item, onDismiss }) {
  const ref = useRef(null)
  const timer = useRef(null)
  const left = useRef(item.duration)
  const started = useRef(0)
  const [paused, setPaused] = useState(false)
  const fx = useFx()

  const start = () => {
    if (!item.duration) return
    started.current = Date.now()
    timer.current = setTimeout(onDismiss, left.current)
  }
  const pause = () => {
    if (!item.duration || paused) return
    clearTimeout(timer.current)
    left.current -= Date.now() - started.current
    setPaused(true)
  }
  const resume = () => {
    if (!paused) return
    setPaused(false)
    start()
  }

  useEffect(() => {
    start()
    // Extra: successes throw confetti, everything else twinkles.
    if (fx && ref.current) {
      const el = ref.current
      setTimeout(() => (item.variant === 'success' ? burst(el, { count: 30, spread: 150 }) : sparkle(el)), 180)
    }
    return () => clearTimeout(timer.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <li
      ref={ref}
      className="ui-toaster__item"
      data-leaving={item.leaving || undefined}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <Toast {...item} paused={paused} onClose={onDismiss} />
    </li>
  )
}

export function Toast({ title, description, variant = 'info', action, onClose, duration = 0, paused = false, className }) {
  return (
    <div
      className={cx('ui-toast', 'ui-ov-surface', `ui-toast--${variant}`, className)}
      role={variant === 'danger' ? 'alert' : 'status'}
      style={duration ? { '--_duration': `${duration}ms` } : undefined}
      data-paused={paused || undefined}
    >
      <span className="ui-toast__icon">
        <Icon name={ICONS[variant] ?? 'info'} size={18} />
      </span>
      <div className="ui-toast__text">
        {title && <div className="ui-toast__title">{title}</div>}
        {description && <div className="ui-toast__desc">{description}</div>}
      </div>
      {action && (
        <button
          type="button"
          className="ui-toast__action"
          onClick={() => {
            action.onClick?.()
            onClose?.()
          }}
        >
          {action.label}
        </button>
      )}
      {onClose && (
        <button type="button" className="ui-ov-close ui-toast__close" aria-label="Dismiss notification" onClick={onClose}>
          <Icon name="x" size={15} />
        </button>
      )}
      {duration > 0 && <span className="ui-toast__progress" aria-hidden />}
    </div>
  )
}
