import { Icon } from '../../../lib/icons'
import { PEOPLE } from '../../../lib/placeholder'
import { Marquee } from './Marquee'

const LOGOS = [
  ['zap', 'Voltage'],
  ['layers', 'Stackwise'],
  ['globe', 'Orbital'],
  ['rocket', 'Liftoff'],
  ['shield', 'Bastion'],
  ['sparkles', 'Glimmer'],
  ['bar-chart', 'Metricly'],
]
const Logos = () =>
  LOGOS.map(([icon, name]) => (
    <span key={name} className="ui-marquee__item" style={{ fontSize: '1.3em' }}>
      <Icon name={icon} size={22} /> {name}
    </span>
  ))

export default {
  title: 'Marquee',
  category: 'Motion',
  status: 'ready',
  description:
    'A seamless infinite scroller (two copies, each sliding by its own measured width) in any direction, with pause or slow on hover and faded edges. With reduced motion it becomes a normal scrollable row. In Extra the items are neon gradient text and hovering turbo-charges it to 4×.',
  layout: 'padded',
  controls: {
    speed: { type: 'range', min: 10, max: 300, step: 10, default: 60 },
    direction: { type: 'radio', options: ['left', 'right'], default: 'left' },
    hover: { type: 'radio', options: ['pause', 'slow', 'none'], default: 'pause' },
    gap: { type: 'range', min: 0, max: 120, step: 4, default: 48 },
    fade: { type: 'boolean', default: true },
  },
}

export const LogoWall = () => (
  <Marquee label="Customers" speed={45}>
    <Logos />
  </Marquee>
)
LogoWall.storyName = 'Logo wall'

export const Playground = (args) => (
  <Marquee {...args}>
    <Logos />
  </Marquee>
)

const TAGS = ['Design systems', 'Motion', 'Accessibility', 'Charts', 'Glassmorphism', 'Neumorphism', 'Brutalism', 'Dark mode', 'Tokens']

export const Bands = () => (
  <div style={{ display: 'grid', gap: 14, padding: '24px 0', overflow: 'hidden' }}>
    <div style={{ margin: '0 -40px', transform: 'rotate(-3deg)', background: 'var(--ui-accent)', color: 'var(--ui-accent-text)', padding: '12px 0', boxShadow: 'var(--ui-shadow-md)' }}>
      <Marquee speed={80} gap={28} fade={false}>
        {TAGS.map((t) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 28, fontWeight: 800, fontSize: '1.4em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {t} <Icon name="star" size={18} />
          </span>
        ))}
      </Marquee>
    </div>
    <div style={{ margin: '0 -40px', transform: 'rotate(2deg)' }}>
      <Marquee speed={60} direction="right" gap={12}>
        {TAGS.map((t) => (
          <span key={t} className="ui-marquee__pill">{t}</span>
        ))}
      </Marquee>
    </div>
  </div>
)
Bands.storyName = 'Crossing bands'

const TICKER = [
  ['ACME', 182.4, 2.1],
  ['GLOB', 54.12, -0.8],
  ['VOLT', 312.9, 4.6],
  ['ORBT', 12.08, -2.3],
  ['LIFT', 98.6, 0.4],
  ['BSTN', 41.55, 1.2],
]
export const Ticker = () => (
  <div style={{ border: 'var(--ui-border-width) solid var(--ui-border)', borderRadius: 'var(--ui-radius-md)', padding: '8px 0', background: 'var(--ui-surface)' }}>
    <Marquee speed={40} hover="slow" gap={32}>
      {TICKER.map(([sym, price, ch]) => (
        <span key={sym} style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontFamily: 'var(--ui-font-mono)', fontSize: '0.9em', whiteSpace: 'nowrap' }}>
          <strong>{sym}</strong> {price.toFixed(2)}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: ch >= 0 ? 'var(--ui-success)' : 'var(--ui-danger)' }}>
            <Icon name={ch >= 0 ? 'trending-up' : 'trending-down'} size={14} />
            {ch > 0 ? '+' : ''}
            {ch}%
          </span>
        </span>
      ))}
    </Marquee>
  </div>
)
Ticker.storyName = 'Ticker (slows on hover)'

export const Vertical = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: 280, maxWidth: 520, margin: '0 auto' }}>
    {['up', 'down'].map((dir) => (
      <Marquee key={dir} direction={dir} speed={30} gap={12}>
        {PEOPLE.map((p) => (
          <figure key={p.name} style={{ margin: 0, padding: 14, border: 'var(--ui-border-width) solid var(--ui-raised-border)', borderRadius: 'var(--ui-radius-md)', background: 'var(--ui-raised)', boxShadow: 'var(--ui-shadow-sm)' }}>
            <blockquote style={{ margin: '0 0 10px', fontSize: '0.9em' }}>“Honestly the best thing we shipped this year.”</blockquote>
            <figcaption style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8em', color: 'var(--ui-text-muted)' }}>
              <img src={p.avatar} alt="" width={24} height={24} style={{ borderRadius: '50%' }} /> {p.name}
            </figcaption>
          </figure>
        ))}
      </Marquee>
    ))}
  </div>
)
Vertical.storyName = 'Vertical testimonial columns'
