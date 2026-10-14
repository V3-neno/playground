import { useId } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx, useTilt } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import { placeholder } from '../../../lib/placeholder'
import { useUI } from '../../../lib/ui-context'
import { Blobs, SectionHeader } from '../_shared/SectionHeader'
import './FeatureGrid.css'

export const DEFAULT_FEATURES = [
  { icon: 'zap', title: 'Fast by default', text: 'Pages render in milliseconds. No spinners, no layout shift, no excuses.' },
  { icon: 'layers', title: 'Eight styles, one codebase', text: 'Swap the whole look with a single attribute. Components never change.' },
  { icon: 'shield', title: 'Secure', text: 'SSO, audit logs and fine-grained roles come standard on every plan.' },
  { icon: 'bar-chart', title: 'Built-in analytics', text: 'See what people click, where they drop off, and what to fix next.' },
  { icon: 'users', title: 'Made for teams', text: 'Comments, reviews and live cursors so nobody works in the dark.' },
  { icon: 'globe', title: 'Global edge', text: 'Served from 300 locations, so everyone gets the fast version.' },
]

const BENTO_IMG = placeholder({ seed: 6, width: 900, height: 560 })

function Feature({ feature, index, variant, fx, extra }) {
  const tilt = useTilt(fx && variant !== 'list', { max: 8 })
  const big = variant === 'bento' && index === 0
  return (
    <li
      ref={tilt}
      className={cx('ui-features__item', variant !== 'list' && 'ui-sec-card', big && 'is-big')}
      onPointerEnter={(e) => fx && sparkle(e.currentTarget.querySelector('.ui-features__icon'))}
    >
      <span className="ui-features__icon" aria-hidden>
        <Icon name={feature.icon} size={big ? 24 : 20} />
      </span>
      <div className="ui-features__body">
        <h3 className="ui-features__title ui-heading">{feature.title}</h3>
        <p className="ui-features__text">{feature.text}</p>
        {variant !== 'list' && (
          <a className="ui-features__more" href="#" onClick={(e) => e.preventDefault()}>
            Learn more <Icon name="arrow-right" size={14} />
          </a>
        )}
      </div>
      {big && <img className="ui-features__img" src={BENTO_IMG} alt="" />}
      {extra && variant !== 'list' && <span className="ui-features__sheen" aria-hidden />}
    </li>
  )
}

export function FeatureGrid({
  variant = 'cards', // cards | list | bento
  columns = 3,
  eyebrow = 'Features',
  title = 'Everything you need, nothing you don’t',
  highlight = 'nothing',
  lead = 'Six reasons teams switch, and the reason they stay: it just keeps getting out of the way.',
  features = DEFAULT_FEATURES,
  className,
}) {
  const fx = useFx()
  const { style } = useUI()
  const id = useId()
  return (
    <section
      className={cx('ui-sec', 'ui-features', `ui-features--${variant}`, className)}
      style={{ '--_cols': columns }}
      aria-labelledby={title ? id : undefined}
    >
      <Blobs />
      <div className="ui-sec__inner">
        <SectionHeader id={id} eyebrow={eyebrow} title={title} highlight={highlight} lead={lead} align={variant === 'list' ? 'left' : 'center'} />
        <ul className="ui-features__grid">
          {features.map((f, i) => (
            <Feature key={f.title} feature={f} index={i} variant={variant} fx={fx} extra={style === 'extra'} />
          ))}
        </ul>
      </div>
    </section>
  )
}
