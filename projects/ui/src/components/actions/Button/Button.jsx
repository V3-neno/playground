import { cx } from '../../../lib/cx'
import './Button.css'

export function Button({ variant = 'solid', size = 'md', loading = false, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cx('ui-button', `ui-button--${variant}`, `ui-button--${size}`, loading && 'is-loading', className)}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="ui-button__spinner" aria-hidden />}
      <span className="ui-button__label">{children}</span>
    </button>
  )
}
