import { useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, sparkle, useFx } from '../../../lib/fx'
import { useControllable } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { useIndicator } from '../_shared/useIndicator'
import './Pagination.css'

/** Page numbers to show, with 'gap' markers: [1, 'gap', 4, 5, 6, 'gap', 20] */
export function pageRange(page, count, siblings = 1) {
  const slots = siblings * 2 + 5
  const span = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
  if (count <= slots) return span(1, count)
  const left = Math.max(page - siblings, 1)
  const right = Math.min(page + siblings, count)
  const leftGap = left > 3
  const rightGap = right < count - 2
  if (!leftGap && rightGap) return [...span(1, 3 + siblings * 2), 'gap', count]
  if (leftGap && !rightGap) return [1, 'gap', ...span(count - (2 + siblings * 2), count)]
  return [1, 'gap', ...span(left, right), 'gap', count]
}

/**
 * variant: default | outline | simple ("Page 3 of 12" between arrows)
 * Narrow containers automatically switch to the simple layout.
 */
export function Pagination({
  count,
  page,
  defaultPage = 1,
  onChange,
  siblings = 1,
  variant = 'default',
  size = 'md',
  labels = false,
  className,
  ...props
}) {
  const [current, setCurrent] = useControllable(page, defaultPage, onChange)
  const [flip, setFlip] = useState(0)
  const fx = useFx()
  const btnRefs = useRef({})
  const pages = pageRange(current, count, siblings)
  const [listRef, indStyle, ready] = useIndicator(current, [count, siblings, variant, size, pages.join()])

  const go = (n, e) => {
    const next = Math.min(count, Math.max(1, n))
    if (next === current) return
    setCurrent(next)
    setFlip((f) => f + 1)
    if (fx) {
      const target = e?.currentTarget ?? btnRefs.current[next]
      next === count ? burst(target, { count: 34 }) : sparkle(target)
    }
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') go(current - 1)
    else if (e.key === 'ArrowRight') go(current + 1)
    else if (e.key === 'Home') go(1)
    else if (e.key === 'End') go(count)
    else return
    e.preventDefault()
  }

  return (
    <nav
      aria-label="Pagination"
      className={cx('ui-pagination', `ui-pagination--${variant}`, `ui-pagination--${size}`, className)}
      onKeyDown={onKeyDown}
      {...props}
    >
      <div className="ui-pagination__inner">
        <button type="button" className="ui-pagination__btn ui-pagination__arrow" disabled={current <= 1} aria-label="Previous page" onClick={(e) => go(current - 1, e)}>
          <Icon name="chevron-left" size={16} />
          {labels && <span className="ui-pagination__label">Previous</span>}
        </button>

        <ul
          ref={listRef}
          className="ui-pagination__pages"
          style={indStyle}
          data-ready={ready || undefined}
          data-flip={flip % 2}
          data-moved={flip > 0 || undefined}
        >
          <li className="ui-pagination__indicator" aria-hidden />
          {pages.map((p, i) =>
            p === 'gap' ? (
              <li key={`gap-${i}`} className="ui-pagination__gap" aria-hidden>
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  ref={(el) => (btnRefs.current[p] = el)}
                  type="button"
                  className="ui-pagination__btn ui-pagination__page"
                  aria-label={`Page ${p}`}
                  aria-current={p === current ? 'page' : undefined}
                  data-indicator-target={p === current || undefined}
                  onClick={(e) => go(p, e)}
                >
                  {p}
                </button>
              </li>
            ),
          )}
        </ul>

        <span className="ui-pagination__status" aria-live="polite">
          Page <strong>{current}</strong> of {count}
        </span>

        <button type="button" className="ui-pagination__btn ui-pagination__arrow" disabled={current >= count} aria-label="Next page" onClick={(e) => go(current + 1, e)}>
          {labels && <span className="ui-pagination__label">Next</span>}
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </nav>
  )
}
