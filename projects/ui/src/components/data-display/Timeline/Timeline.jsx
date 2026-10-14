import { cx } from '../../../lib/cx'
import { useInView } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import './Timeline.css'

function TimelineItem({ item, index, reveal }) {
  const [ref, inView] = useInView({ threshold: 0.25 })
  return (
    <li
      ref={ref}
      className={cx('ui-timeline__item', `is-${item.tone ?? 'default'}`, item.current && 'is-current', reveal && inView && 'is-visible')}
      style={{ '--_i': index }}
      aria-current={item.current ? 'step' : undefined}
    >
      <span className="ui-timeline__marker" aria-hidden>
        {item.icon ? <Icon name={item.icon} size={14} strokeWidth={2.4} /> : <span className="ui-timeline__dot" />}
      </span>
      <div className="ui-timeline__body">
        {item.time && (
          <time className="ui-timeline__time" dateTime={item.dateTime}>
            {item.time}
          </time>
        )}
        <div className="ui-timeline__title">{item.title}</div>
        {item.description && <div className="ui-timeline__desc">{item.description}</div>}
      </div>
    </li>
  )
}

/**
 * Ordered events. Vertical by default; `alternate` zig-zags on wide containers; `horizontal` lays out a row.
 * Items reveal as they scroll into view. items: [{ id, title, time, description, icon, tone, current }]
 * tone: default | accent | success | warning | danger | muted
 */
export function Timeline({ items = [], orientation = 'vertical', alternate = false, reveal = true, className, ...props }) {
  return (
    <ol
      className={cx(
        'ui-timeline',
        `ui-timeline--${orientation}`,
        alternate && orientation === 'vertical' && 'ui-timeline--alternate',
        reveal && 'ui-timeline--reveal',
        className,
      )}
      {...props}
    >
      {items.map((item, i) => (
        <TimelineItem key={item.id ?? i} item={item} index={i} reveal={reveal} />
      ))}
    </ol>
  )
}
