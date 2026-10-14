import { useId, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useInterval } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { PEOPLE } from '../../../lib/placeholder'
import { useReducedMotion } from '../../../lib/ui-context'
import { Blobs, SectionHeader } from '../_shared/SectionHeader'
import './Testimonials.css'

const QUOTES = [
  'We rebuilt our whole marketing site in a weekend. Switching styles for the campaign took one line.',
  'Honestly the first component kit our designers and engineers both like. That never happens.',
  'Our conversion rate went up 38% after the redesign. Our CEO now thinks I’m a wizard.',
  'The docs are great, the defaults are better. We barely had to touch anything.',
  'Support answered in four minutes on a Sunday. Four. Minutes.',
  'I turned on the Extra style as a joke and now marketing won’t let me turn it off.',
]
const COMPANIES = ['Northwind', 'Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli']

export const DEFAULT_TESTIMONIALS = PEOPLE.map((p, i) => ({
  quote: QUOTES[i],
  name: p.name,
  role: `${p.role}, ${COMPANIES[i]}`,
  avatar: p.avatar,
  rating: i === 3 ? 4 : 5,
}))

function Stars({ rating, fx }) {
  return (
    <div
      className="ui-testi__stars"
      role="img"
      aria-label={`${rating} out of 5 stars`}
      onPointerEnter={(e) => fx && sparkle(e.currentTarget, { colors: ['#ffd23f', '#ffb703', '#fff'] })}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={15} className={n <= rating ? 'is-on' : undefined} />
      ))}
    </div>
  )
}

function Person({ t }) {
  return (
    <figcaption className="ui-testi__person">
      <img src={t.avatar} alt="" width="40" height="40" />
      <span>
        <strong>{t.name}</strong>
        <small>{t.role}</small>
      </span>
    </figcaption>
  )
}

function QuoteCard({ t, fx, hidden }) {
  return (
    <figure className="ui-testi__card ui-sec-card" aria-hidden={hidden || undefined}>
      <Stars rating={t.rating} fx={fx} />
      <blockquote>
        <p>{t.quote}</p>
      </blockquote>
      <Person t={t} />
    </figure>
  )
}

function Spotlight({ items, fx, autoplay }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()
  const go = (n) => setI((n + items.length) % items.length)
  useInterval(() => go(i + 1), autoplay && !paused && !reduced ? 6000 : null)
  const t = items[i]
  return (
    <div
      className="ui-testi__spotlight"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="group"
      aria-roledescription="carousel"
      aria-label="Customer quotes"
    >
      <Icon name="quote" size={44} className="ui-testi__mark" />
      <figure key={i} className="ui-testi__big" aria-live={autoplay && !paused ? 'off' : 'polite'}>
        <blockquote>
          <p className="ui-heading">{t.quote}</p>
        </blockquote>
        <Person t={t} />
      </figure>
      <div className="ui-testi__nav">
        <button type="button" className="ui-testi__arrow" aria-label="Previous quote" onClick={() => go(i - 1)}>
          <Icon name="arrow-left" size={18} />
        </button>
        <div className="ui-testi__dots">
          {items.map((it, n) => (
            <button
              key={it.name}
              type="button"
              aria-label={`Quote ${n + 1} of ${items.length}`}
              aria-current={n === i || undefined}
              onClick={(e) => {
                go(n)
                if (fx) sparkle(e.currentTarget)
              }}
            />
          ))}
        </div>
        <button type="button" className="ui-testi__arrow" aria-label="Next quote" onClick={() => go(i + 1)}>
          <Icon name="arrow-right" size={18} />
        </button>
      </div>
    </div>
  )
}

export function Testimonials({
  variant = 'grid', // grid | marquee | spotlight
  eyebrow = 'Testimonials',
  title = 'Loved by teams who ship',
  highlight = 'Loved',
  lead = 'Don’t take our word for it. Take theirs.',
  items = DEFAULT_TESTIMONIALS,
  autoplay = true,
  speed = 40,
  className,
}) {
  const fx = useFx()
  const id = useId()
  const half = Math.ceil(items.length / 2)
  const rows = [items.slice(0, half), items.slice(half)]
  return (
    <section className={cx('ui-sec', 'ui-testi', `ui-testi--${variant}`, className)} aria-labelledby={title ? id : undefined}>
      <Blobs />
      <div className="ui-sec__inner">
        <SectionHeader id={id} eyebrow={eyebrow} title={title} highlight={highlight} lead={lead} />
        {variant === 'grid' && (
          <div className="ui-testi__grid">
            {items.map((t) => (
              <QuoteCard key={t.name} t={t} fx={fx} />
            ))}
          </div>
        )}
        {variant === 'spotlight' && <Spotlight items={items} fx={fx} autoplay={autoplay} />}
      </div>
      {variant === 'marquee' && (
        <div className="ui-testi__marquee" style={{ '--_speed': `${speed}s` }}>
          {rows.map((row, r) => (
            <div key={r} className="ui-testi__row" data-dir={r % 2 ? 'right' : 'left'}>
              {[0, 1].map((copy) => (
                <div key={copy} className="ui-testi__track">
                  {row.map((t) => (
                    <QuoteCard key={t.name} t={t} fx={fx} hidden={copy === 1} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
