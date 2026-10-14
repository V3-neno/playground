import { Fragment, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import './Breadcrumbs.css'

/**
 * items: [{ label, href?, icon? }] — the last item is the current page.
 * maxItems: collapse the middle into a "…" button when there are more items than this (0 = never).
 * onNavigate(item, event): called on click, e.g. to route client-side (call event.preventDefault()).
 */
export function Breadcrumbs({ items, separator = 'chevron', maxItems = 0, size = 'md', onNavigate, className, ...props }) {
  const [expanded, setExpanded] = useState(false)
  const fx = useFx()

  let visible = items.map((item, index) => ({ item, index }))
  const collapse = maxItems > 1 && items.length > maxItems && !expanded
  if (collapse) {
    const tail = maxItems - 1
    visible = [visible[0], { ellipsis: true, index: -1 }, ...visible.slice(items.length - tail)]
  }

  return (
    <nav aria-label="Breadcrumb" className={cx('ui-breadcrumbs', `ui-breadcrumbs--${size}`, className)} {...props}>
      <ol className="ui-breadcrumbs__list">
        {visible.map((entry, i) => (
          <Fragment key={entry.ellipsis ? 'ellipsis' : entry.index}>
            {i > 0 && (
              <li className="ui-breadcrumbs__sep" aria-hidden data-sep={separator}>
                <Separator kind={separator} />
              </li>
            )}
            <li className="ui-breadcrumbs__item">
              {entry.ellipsis ? (
                <button
                  type="button"
                  className="ui-breadcrumbs__ellipsis"
                  aria-label={`Show ${items.length - maxItems} more`}
                  onClick={(e) => {
                    setExpanded(true)
                    if (fx) sparkle(e.currentTarget)
                  }}
                >
                  <Icon name="more" size={16} />
                </button>
              ) : entry.index === items.length - 1 ? (
                <span className="ui-breadcrumbs__current" aria-current="page">
                  {entry.item.icon && <Icon name={entry.item.icon} size={15} />}
                  <span className="ui-breadcrumbs__text">{entry.item.label}</span>
                </span>
              ) : (
                <a
                  className="ui-breadcrumbs__link"
                  href={entry.item.href ?? '#'}
                  onClick={(e) => {
                    if (fx) sparkle(e.currentTarget)
                    onNavigate?.(entry.item, e)
                  }}
                >
                  {entry.item.icon && <Icon name={entry.item.icon} size={15} />}
                  <span className="ui-breadcrumbs__text">{entry.item.label}</span>
                </a>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}

function Separator({ kind }) {
  if (kind === 'slash') return <span>/</span>
  if (kind === 'dot') return <span>•</span>
  if (kind === 'arrow') return <Icon name="arrow-right" size={13} />
  return <Icon name="chevron-right" size={14} />
}
