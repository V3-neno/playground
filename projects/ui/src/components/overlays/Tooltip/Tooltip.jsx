import { cloneElement, isValidElement, useEffect, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useKey } from '../../../lib/hooks'
import { useStableId } from '../_shared/overlay'
import './Tooltip.css'

/**
 * Short hint shown on hover AND keyboard focus, wired with aria-describedby.
 * Wrap a single focusable element: <Tooltip content="Copy"><button>…</button></Tooltip>
 * `open` forces it visible (previews); Escape hides it.
 */
export function Tooltip({ content, children, placement = 'top', delay = 300, open: forced, className }) {
  const [shown, setShown] = useState(false)
  const timer = useRef(null)
  const tip = useRef(null)
  const id = useStableId('ui-tooltip')
  const fx = useFx()
  const visible = forced ?? shown

  const show = (wait) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setShown(true), wait)
  }
  const hide = () => {
    clearTimeout(timer.current)
    setShown(false)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  useKey('Escape', hide, shown)

  // Extra: a tiny sparkle every time it appears.
  useEffect(() => {
    if (fx && shown && tip.current) sparkle(tip.current, { count: 6, spread: 34 })
  }, [fx, shown])

  const child = isValidElement(children)
    ? cloneElement(children, {
        'aria-describedby': cx(children.props['aria-describedby'], id) || undefined,
        onPointerEnter: (e) => {
          children.props.onPointerEnter?.(e)
          show(delay)
        },
        onPointerLeave: (e) => {
          children.props.onPointerLeave?.(e)
          hide()
        },
        onFocus: (e) => {
          children.props.onFocus?.(e)
          show(0)
        },
        onBlur: (e) => {
          children.props.onBlur?.(e)
          hide()
        },
      })
    : children

  return (
    <span className={cx('ui-tooltip', className)}>
      {child}
      <span ref={tip} id={id} role="tooltip" className="ui-tooltip__bubble" data-placement={placement} data-state={visible ? 'open' : 'closed'}>
        {content}
      </span>
    </span>
  )
}
