import { Icon } from '../../../lib/icons'
import { REVEAL_EFFECTS, RevealOnScroll } from './RevealOnScroll'

export default {
  title: 'Reveal on scroll',
  category: 'Motion',
  status: 'ready',
  description:
    'Children animate in the first time they enter the viewport, using IntersectionObserver. Effects: fade, fade-up/down, slide, zoom, blur, flip and warp. Brutalist and Mono use stepped timing, Playful overshoots, and in Extra every element warps in with a chromatic flash and sparkles. With reduced motion everything is shown immediately.',
  layout: 'padded',
  controls: {
    effect: { type: 'select', options: ['auto', ...REVEAL_EFFECTS], default: 'auto' },
    delay: { type: 'range', min: 0, max: 1000, step: 50, default: 0 },
    duration: { type: 'range', min: 0, max: 2000, step: 50, default: 0, label: 'duration (0 = style default)' },
    once: { type: 'boolean', default: true },
  },
}

const card = {
  padding: 16,
  border: 'var(--ui-border-width) solid var(--ui-raised-border)',
  borderRadius: 'var(--ui-radius-md)',
  background: 'var(--ui-raised)',
  boxShadow: 'var(--ui-shadow-sm)',
  backdropFilter: 'blur(var(--ui-blur))',
}

const ICONS = ['zap', 'layers', 'sparkles', 'shield', 'rocket', 'heart', 'globe', 'bar-chart', 'star']

export const Effects = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
    {REVEAL_EFFECTS.map((e, i) => (
      <RevealOnScroll key={e} effect={e} delay={i * 90}>
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name={ICONS[i]} size={18} style={{ color: 'var(--ui-accent)' }} />
          <strong style={{ fontSize: '0.875em' }}>{e}</strong>
        </div>
      </RevealOnScroll>
    ))}
  </div>
)
Effects.storyName = 'All effects (press ↻ to replay)'

export const Playground = (args) => (
  <RevealOnScroll {...args} duration={args.duration || undefined}>
    <div style={{ ...card, maxWidth: 360, margin: '0 auto', padding: 24, textAlign: 'center' }}>
      <h3 className="ui-heading" style={{ margin: '0 0 6px', fontSize: '1.4em' }}>Hello there</h3>
      <p style={{ margin: 0, color: 'var(--ui-text-muted)' }}>Change the controls, then press ↻ to replay.</p>
    </div>
  </RevealOnScroll>
)

const FEATURES = [
  ['zap', 'Fast by default', 'Ships the minimum and streams the rest.'],
  ['shield', 'Secure', 'Every request is signed and every secret is sealed.'],
  ['layers', 'Composable', 'Small parts that snap together.'],
  ['globe', 'Everywhere', 'Runs close to your users, on every continent.'],
  ['bar-chart', 'Measurable', 'Every change comes with a number.'],
  ['heart', 'Loved', 'Teams stay because they want to.'],
]

export const ScrollContainer = () => (
  <div style={{ height: 420, overflow: 'auto', padding: '0 4px', borderRadius: 'var(--ui-radius-md)' }}>
    <div style={{ height: 380, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'var(--ui-text-muted)' }}>
      <div>
        <Icon name="arrow-down" size={28} />
        <p style={{ margin: '8px 0 0' }}>Scroll inside this box</p>
      </div>
    </div>
    <RevealOnScroll effect="fade-up">
      <h2 className="ui-heading" style={{ fontSize: '2em', margin: '0 0 20px', textAlign: 'center' }}>
        Everything you need
      </h2>
    </RevealOnScroll>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
      {FEATURES.map(([icon, title, text], i) => (
        <RevealOnScroll key={title} delay={(i % 3) * 110}>
          <div style={{ ...card, height: '100%' }}>
            <Icon name={icon} size={22} style={{ color: 'var(--ui-accent)' }} />
            <h4 className="ui-heading" style={{ margin: '10px 0 4px' }}>{title}</h4>
            <p style={{ margin: 0, color: 'var(--ui-text-muted)', fontSize: '0.9em' }}>{text}</p>
          </div>
        </RevealOnScroll>
      ))}
    </div>
    <RevealOnScroll effect="zoom" style={{ margin: '160px 0 40px' }}>
      <div style={{ ...card, padding: 32, textAlign: 'center', background: 'var(--ui-accent)', color: 'var(--ui-accent-text)' }}>
        <h3 className="ui-heading" style={{ margin: 0, fontSize: '1.6em' }}>You made it to the bottom 🎉</h3>
      </div>
    </RevealOnScroll>
  </div>
)
ScrollContainer.storyName = 'Inside a scroll container'

export const Repeat = () => (
  <div style={{ height: 300, overflow: 'auto' }}>
    {Array.from({ length: 10 }, (_, i) => (
      <RevealOnScroll key={i} effect={i % 2 ? 'slide-left' : 'slide-right'} once={false} threshold={0.5}>
        <div style={{ ...card, margin: '0 0 12px', width: '70%', marginLeft: i % 2 ? 'auto' : 0 }}>Row {i + 1}: re-animates every time it re-enters</div>
      </RevealOnScroll>
    ))}
  </div>
)
Repeat.storyName = 'Every time (once = false)'
