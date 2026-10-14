import { Icon } from '../../../lib/icons'
import { Parallax, ParallaxLayer } from './Parallax'

export default {
  title: 'Parallax',
  category: 'Motion',
  status: 'ready',
  description:
    'Layered scenes that move at different speeds, driven by scroll (the nearest scroll container, or the page) or by the pointer. Layers only use transforms through CSS variables updated in requestAnimationFrame. Reduced motion holds still. In Extra the scene becomes a 3D diorama that tilts toward the cursor, and its colours drift as you scroll.',
  layout: 'padded',
  controls: {
    mode: { type: 'radio', options: ['pointer', 'scroll'], default: 'pointer' },
    strength: { type: 'range', min: 0, max: 3, step: 0.1, default: 1 },
    height: { type: 'range', min: 180, max: 520, step: 20, default: 320 },
  },
}

// A landscape built from token colours, so it restyles with every theme.
const ridge = (points) => `M0 400 ${points} L1000 400 Z`
function Landscape({ title = 'Parallax' }) {
  return (
    <>
      <ParallaxLayer speed={0.05}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(var(--ui-accent-soft), var(--ui-surface-2))' }} />
      </ParallaxLayer>
      <ParallaxLayer speed={0.15}>
        <svg viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
          <circle cx="720" cy="140" r="56" fill="var(--ui-chart-4)" opacity="0.9" />
        </svg>
      </ParallaxLayer>
      <ParallaxLayer speed={0.3}>
        <svg viewBox="0 0 1000 400" preserveAspectRatio="xMidYMax slice" width="100%" height="100%">
          <path d={ridge('L0 250 L120 190 L260 240 L380 160 L520 230 L650 170 L800 220 L1000 180')} fill="var(--ui-chart-2)" opacity="0.45" />
        </svg>
      </ParallaxLayer>
      <ParallaxLayer speed={0.6}>
        <svg viewBox="0 0 1000 400" preserveAspectRatio="xMidYMax slice" width="100%" height="100%">
          <path d={ridge('L0 300 L150 240 L300 290 L460 220 L600 280 L760 230 L900 270 L1000 250')} fill="var(--ui-chart-1)" opacity="0.7" />
        </svg>
      </ParallaxLayer>
      <ParallaxLayer speed={1}>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <h2 className="ui-heading" style={{ margin: 0, fontSize: 'clamp(1.6em, 7cqi, 3.2em)', color: 'var(--ui-text)', textShadow: '0 2px 18px var(--ui-bg)' }}>
            {title}
          </h2>
        </div>
      </ParallaxLayer>
      <ParallaxLayer speed={1.4}>
        <svg viewBox="0 0 1000 400" preserveAspectRatio="xMidYMax slice" width="100%" height="100%">
          <path d={ridge('L0 350 L200 320 L420 345 L640 315 L820 340 L1000 325')} fill="var(--ui-text)" opacity="0.85" />
        </svg>
      </ParallaxLayer>
    </>
  )
}

export const Pointer = () => (
  <Parallax mode="pointer" height={280}>
    <Landscape title="Move your cursor" />
  </Parallax>
)

export const Playground = (args) => (
  <Parallax key={args.mode} {...args}>
    <Landscape title={args.mode === 'scroll' ? 'Scroll the page' : 'Move your cursor'} />
  </Parallax>
)

export const ScrollBox = () => (
  <div style={{ height: 420, overflow: 'auto', borderRadius: 'var(--ui-radius-md)' }}>
    <div style={{ height: 300, display: 'grid', placeItems: 'center', color: 'var(--ui-text-muted)' }}>
      <span style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
        <Icon name="arrow-down" size={24} /> Scroll inside this box
      </span>
    </div>
    <Parallax mode="scroll" height={320} strength={1.4}>
      <Landscape title="Scroll" />
    </Parallax>
    <div style={{ height: 340 }} />
  </div>
)
ScrollBox.storyName = 'Scroll (inside a scroll container)'

const CHIPS = [
  ['zap', 0.2, '12%', '18%'],
  ['heart', 0.9, '72%', '22%'],
  ['star', 0.5, '24%', '68%'],
  ['sparkles', 1.3, '62%', '62%'],
  ['rocket', 0.7, '44%', '38%'],
]
export const Floating = () => (
  <Parallax mode="pointer" height={260} strength={1.6}>
    {CHIPS.map(([icon, speed, left, top]) => (
      <ParallaxLayer key={icon} speed={speed}>
        <div
          style={{
            position: 'absolute',
            left: `calc(${left} + 13%)`,
            top: `calc(${top} + 13%)`,
            display: 'grid',
            placeItems: 'center',
            width: 56 + speed * 30,
            height: 56 + speed * 30,
            borderRadius: 'var(--ui-radius-lg)',
            border: 'var(--ui-border-width) solid var(--ui-raised-border)',
            background: 'var(--ui-raised)',
            boxShadow: 'var(--ui-shadow-md)',
            color: 'var(--ui-accent)',
          }}
        >
          <Icon name={icon} size={20 + speed * 14} />
        </div>
      </ParallaxLayer>
    ))}
  </Parallax>
)
Floating.storyName = 'Floating cards'
