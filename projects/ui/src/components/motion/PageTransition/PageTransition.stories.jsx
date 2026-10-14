import { useState } from 'react'
import { useInterval } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { PEOPLE, PHOTOS } from '../../../lib/placeholder'
import { PAGE_EFFECTS, PageTransition } from './PageTransition'

export default {
  title: 'Page transition',
  category: 'Motion',
  status: 'ready',
  description:
    'Change pageKey and the old page plays out while the new one plays in, stacked in the same grid cell. Effects: fade, direction-aware slide, scale, flip, wipe and portal, a circle that opens from wherever you last clicked. In Extra the portal has a glowing rainbow rim and the leaving page glitches out.',
  layout: 'padded',
  controls: {
    effect: { type: 'select', options: ['auto', ...PAGE_EFFECTS], default: 'auto' },
    duration: { type: 'range', min: 0, max: 1500, step: 50, default: 0, label: 'duration (0 = style default)' },
  },
}

const surface = {
  border: 'var(--ui-border-width) solid var(--ui-raised-border)',
  borderRadius: 'var(--ui-radius-md)',
  background: 'var(--ui-raised)',
  boxShadow: 'var(--ui-shadow-sm)',
}

const PAGES = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    render: () => (
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ height: 120, borderRadius: 'var(--ui-radius-md)', background: `url("${PHOTOS[0].src}") center / cover` }} />
        <h3 className="ui-heading" style={{ margin: 0, fontSize: '1.4em' }}>Welcome home</h3>
        <p style={{ margin: 0, color: 'var(--ui-text-muted)' }}>Pick a tab to watch the transition.</p>
      </div>
    ),
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'grid',
    render: () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
        {PHOTOS.slice(1, 7).map((p) => (
          <div key={p.title} style={{ ...surface, overflow: 'hidden' }}>
            <img src={p.src} alt="" style={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'cover' }} />
            <div style={{ padding: '6px 10px', fontSize: '0.85em', fontWeight: 600 }}>{p.title}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'team',
    label: 'Team',
    icon: 'users',
    render: () => (
      <div style={{ display: 'grid', gap: 8 }}>
        {PEOPLE.slice(0, 4).map((p) => (
          <div key={p.name} style={{ ...surface, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
            <img src={p.avatar} alt="" width={30} height={30} style={{ borderRadius: '50%' }} />
            <strong style={{ flex: 1 }}>{p.name}</strong>
            <span style={{ color: 'var(--ui-text-muted)', fontSize: '0.85em' }}>{p.role}</span>
          </div>
        ))}
      </div>
    ),
  },
]

function MiniApp({ effect, duration, autoCycle = false }) {
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const go = (k) => {
    setDir(k >= i ? 1 : -1)
    setI(k)
  }
  useInterval(() => go((i + 1) % PAGES.length), autoCycle ? 2200 : null)
  return (
    <div style={{ ...surface, width: '100%', maxWidth: 560, margin: '0 auto', overflow: 'hidden', background: 'var(--ui-bg)' }}>
      <nav style={{ display: 'flex', gap: 4, padding: 8, borderBottom: 'var(--ui-border-width) solid var(--ui-border)' }}>
        {PAGES.map((p, k) => (
          <button
            key={p.id}
            type="button"
            onClick={() => go(k)}
            aria-current={k === i ? 'page' : undefined}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              border: 0,
              borderRadius: 'var(--ui-radius-sm)',
              background: k === i ? 'var(--ui-accent-soft)' : 'transparent',
              color: k === i ? 'var(--ui-accent)' : 'var(--ui-text)',
              font: 'inherit',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Icon name={p.icon} size={15} /> {p.label}
          </button>
        ))}
      </nav>
      <PageTransition pageKey={PAGES[i].id} effect={effect} direction={dir} duration={duration || undefined} style={{ padding: 16, minHeight: 260 }}>
        {PAGES[i].render()}
      </PageTransition>
    </div>
  )
}

export const AutoCycle = () => <MiniApp effect="auto" autoCycle />
AutoCycle.storyName = 'Auto-cycling tabs'

export const Playground = (args) => <MiniApp {...args} />

export const AllEffects = () => {
  const [effect, setEffect] = useState('slide')
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {PAGE_EFFECTS.map((e) => (
          <button key={e} type="button" onClick={() => setEffect(e)} aria-pressed={e === effect} style={{ font: 'inherit', padding: '4px 10px', cursor: 'pointer', fontWeight: e === effect ? 700 : 400 }}>
            {e}
          </button>
        ))}
      </div>
      <MiniApp effect={effect} />
    </div>
  )
}
AllEffects.storyName = 'Pick an effect'
