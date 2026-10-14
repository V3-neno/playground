import { useState } from 'react'
import { Icon } from '../../../lib/icons'
import { PEOPLE } from '../../../lib/placeholder'
import { STAGGER_EFFECTS, StaggerList } from './StaggerList'

export default {
  title: 'Stagger list',
  category: 'Motion',
  status: 'ready',
  description:
    'Children enter one after another. Items added later animate in on their own, and reorders glide into place (FLIP). Playful pops, Brutalist and Mono step, and in Extra rows warp in and a neon comet streaks across each one.',
  layout: 'padded',
  controls: {
    effect: { type: 'select', options: ['auto', ...STAGGER_EFFECTS], default: 'auto' },
    stagger: { type: 'range', min: 0, max: 300, step: 10, default: 70 },
    duration: { type: 'range', min: 0, max: 1500, step: 50, default: 0, label: 'duration (0 = style default)' },
  },
}

const row = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 14px',
  border: 'var(--ui-border-width) solid var(--ui-raised-border)',
  borderRadius: 'var(--ui-radius-md)',
  background: 'var(--ui-raised)',
  boxShadow: 'var(--ui-shadow-sm)',
  backdropFilter: 'blur(var(--ui-blur))',
}

const Person = ({ p }) => (
  <div style={row}>
    <img src={p.avatar} alt="" width={32} height={32} style={{ borderRadius: 'var(--ui-radius-full)' }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <strong style={{ display: 'block' }}>{p.name}</strong>
      <span style={{ color: 'var(--ui-text-muted)', fontSize: '0.85em' }}>{p.role}</span>
    </div>
    <Icon name="chevron-right" size={16} style={{ color: 'var(--ui-text-muted)' }} />
  </div>
)

export const People = () => (
  <StaggerList style={{ maxWidth: 380, margin: '0 auto' }}>
    {PEOPLE.slice(0, 4).map((p) => (
      <Person key={p.name} p={p} />
    ))}
  </StaggerList>
)
People.storyName = 'People (press ↻ to replay)'

export const Playground = (args) => (
  <StaggerList {...args} duration={args.duration || undefined} style={{ maxWidth: 380, margin: '0 auto' }}>
    {PEOPLE.map((p) => (
      <Person key={p.name} p={p} />
    ))}
  </StaggerList>
)

const TASKS = ['Draft the brief', 'Sketch three directions', 'Pick one', 'Build it', 'Polish', 'Ship', 'Celebrate']

export const Live = () => {
  const [items, setItems] = useState(TASKS.slice(0, 4).map((t, i) => ({ id: i, t })))
  const [next, setNext] = useState(4)
  const add = () => {
    setItems((xs) => [...xs, { id: next, t: TASKS[next % TASKS.length] }])
    setNext((n) => n + 1)
  }
  const shuffle = () => setItems((xs) => [...xs].sort(() => Math.random() - 0.5))
  const remove = (id) => setItems((xs) => xs.filter((x) => x.id !== id))
  const btn = { font: 'inherit', padding: '6px 12px', cursor: 'pointer' }
  return (
    <div style={{ maxWidth: 400, margin: '0 auto', display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" style={btn} onClick={add}>Add</button>
        <button type="button" style={btn} onClick={shuffle}>Shuffle</button>
      </div>
      <StaggerList>
        {items.map((x) => (
          <div key={x.id} style={row}>
            <Icon name="check-circle" size={18} style={{ color: 'var(--ui-success)' }} />
            <span style={{ flex: 1 }}>{x.t}</span>
            <button type="button" aria-label={`Remove ${x.t}`} onClick={() => remove(x.id)} style={{ border: 0, background: 'none', color: 'var(--ui-text-muted)', cursor: 'pointer' }}>
              <Icon name="x" size={16} />
            </button>
          </div>
        ))}
      </StaggerList>
    </div>
  )
}
Live.storyName = 'Add, remove and shuffle'

export const Grid = () => (
  <StaggerList effect="pop" stagger={45} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
    {['zap', 'heart', 'star', 'globe', 'rocket', 'layers', 'shield', 'sparkles', 'sun', 'moon', 'bell', 'mail'].map((n) => (
      <div key={n} style={{ ...row, justifyContent: 'center', aspectRatio: '1', padding: 0 }}>
        <Icon name={n} size={24} style={{ color: 'var(--ui-accent)' }} />
      </div>
    ))}
  </StaggerList>
)
Grid.storyName = 'Grid (pop)'
