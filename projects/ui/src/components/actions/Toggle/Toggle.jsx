import { useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { useControllable } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import './Toggle.css'

/**
 * A two-state button (aria-pressed): bold/italic, like, pin, mute…
 * `pressedIcon` swaps the icon when on; `celebrate` is the emoji the Extra style throws when switched on.
 */
export function Toggle({
  pressed,
  defaultPressed = false,
  onPressedChange,
  icon,
  pressedIcon,
  variant = 'outline',
  size = 'md',
  celebrate,
  className,
  children,
  onClick,
  ...props
}) {
  const [on, setOn] = useControllable(pressed, defaultPressed, onPressedChange)
  const fx = useFx()
  const [pop, setPop] = useState(0)
  const glyph = on && pressedIcon ? pressedIcon : icon
  return (
    <button
      type="button"
      aria-pressed={on}
      data-state={on ? 'on' : 'off'}
      className={cx('ui-toggle', `ui-toggle--${variant}`, `ui-toggle--${size}`, !children && 'ui-toggle--icon-only', className)}
      onClick={(e) => {
        const next = !on
        setOn(next)
        if (fx && next) {
          burst(e, celebrate ? { shapes: [celebrate], count: 14, spread: 90 } : { count: 18, spread: 80 })
          setPop((n) => n + 1)
        }
        onClick?.(e)
      }}
      {...props}
    >
      {glyph && (
        <span key={pop} className="ui-toggle__icon" data-pop={pop > 0 || undefined}>
          <Icon name={glyph} size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        </span>
      )}
      {children && <span className="ui-toggle__label">{children}</span>}
    </button>
  )
}
