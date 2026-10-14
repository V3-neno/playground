import { useId } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx, useTilt } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import { placeholder } from '../../../lib/placeholder'
import { useUI } from '../../../lib/ui-context'
import { Button } from '../../actions/Button/Button'
import { Blobs, Highlight } from '../_shared/SectionHeader'
import './Hero.css'

const SHOT = placeholder({ seed: 5, width: 1200, height: 720 })

export const DEFAULT_STATS = [
  { value: '12k+', label: 'Teams shipping' },
  { value: '99.98%', label: 'Uptime' },
  { value: '4.9/5', label: 'Average rating' },
  { value: '40ms', label: 'Median response' },
]

export const DEFAULT_LOGOS = ['Northwind', 'Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli']

export function Hero({
  variant = 'centered', // centered | split | stats
  eyebrow = 'New · Version 2.0 is here',
  title = 'Build pages people actually remember',
  highlight = 'remember',
  subtitle = 'A kit of components in eight wildly different styles. Swap the look of an entire site without touching a single component.',
  primary = 'Get started free',
  secondary = 'See how it works',
  image = true,
  stats = DEFAULT_STATS,
  logos = DEFAULT_LOGOS,
  className,
}) {
  const fx = useFx()
  const { style } = useUI()
  const tilt = useTilt(fx, { max: 6, scale: 1.01 })
  const showImage = image && variant !== 'stats'
  const titleId = useId()

  return (
    <section className={cx('ui-sec', 'ui-hero', `ui-hero--${variant}`, className)} aria-labelledby={titleId}>
      <Blobs />
      <div className="ui-sec__inner ui-hero__inner">
        <div className="ui-hero__copy">
          {eyebrow && (
            <a
              className="ui-hero__badge"
              href="#"
              onClick={(e) => e.preventDefault()}
              onPointerEnter={(e) => fx && sparkle(e.currentTarget)}
            >
              <span className="ui-hero__badge-dot">
                <Icon name="sparkles" size={13} />
              </span>
              {eyebrow}
              <Icon name="arrow-right" size={14} />
            </a>
          )}
          <h1 id={titleId} className="ui-hero__title ui-heading">
            <Highlight text={title} highlight={highlight} />
          </h1>
          {subtitle && <p className="ui-hero__subtitle">{subtitle}</p>}
          <div className="ui-hero__ctas">
            {primary && (
              <Button size="lg" iconRight="arrow-right">
                {primary}
              </Button>
            )}
            {secondary && (
              <Button size="lg" variant="outline" icon="play">
                {secondary}
              </Button>
            )}
          </div>
          {variant === 'split' && (
            <ul className="ui-hero__checks">
              {['No credit card', 'Free for small teams', 'Cancel anytime'].map((t) => (
                <li key={t}>
                  <Icon name="check" size={15} /> {t}
                </li>
              ))}
            </ul>
          )}
        </div>

        {showImage && (
          <div className="ui-hero__visual">
            <figure ref={tilt} className="ui-hero__shot ui-sec-card">
              <div className="ui-hero__chrome" aria-hidden>
                <span />
                <span />
                <span />
                <i>app.example.com</i>
              </div>
              <img src={SHOT} alt="Product dashboard preview" />
              {style === 'extra' && <div className="ui-hero__sheen" aria-hidden />}
            </figure>
            {variant === 'split' && (
              <div className="ui-hero__float ui-sec-card" aria-hidden>
                <Icon name="trending-up" size={18} />
                <div>
                  <strong>+38%</strong>
                  <span>conversion this week</span>
                </div>
              </div>
            )}
          </div>
        )}

        {variant === 'stats' && stats?.length > 0 && (
          <dl className="ui-hero__stats">
            {stats.map((s) => (
              <div key={s.label} className="ui-hero__stat">
                <dt>{s.label}</dt>
                <dd className="ui-heading">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {logos?.length > 0 && (
          <div className="ui-hero__logos">
            <p>Trusted by teams at</p>
            <div className={cx('ui-hero__logo-track', style === 'extra' && 'is-marquee')}>
              <ul>
                {logos.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              {style === 'extra' && (
                <ul aria-hidden>
                  {logos.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
