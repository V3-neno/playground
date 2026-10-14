import { useState } from 'react'
import { Icon } from '../../../lib/icons'
import { Button } from '../../actions/Button/Button'
import { Drawer } from './Drawer'

export default {
  title: 'Drawer',
  category: 'Overlays',
  status: 'ready',
  description:
    'Edge panel (right, left, top, bottom) with backdrop, focus trap, Escape and backdrop-click to close. Glass and Soft float it off the edge. Extra overshoots on a spring, lights a neon edge, cascades the content in and leaves a sparkle trail.',
  height: 460,
  controls: {
    side: { type: 'radio', options: ['right', 'left', 'top', 'bottom'], default: 'right' },
    title: { type: 'text', default: 'Filters' },
    description: { type: 'text', default: 'Narrow down 1,284 results.' },
    closeOnBackdrop: { type: 'boolean', default: true },
  },
}

const row = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  marginBottom: 8,
  borderRadius: 'var(--ui-radius-md)',
  background: 'var(--ui-surface)',
  border: 'var(--ui-border-width) solid var(--ui-border)',
}

const Rows = () =>
  [
    ['grid', 'Category', 'All'],
    ['clock', 'Updated', 'This week'],
    ['user', 'Owner', 'Anyone'],
    ['star', 'Rating', '4+ stars'],
    ['globe', 'Region', 'Europe'],
  ].map(([icon, label, value]) => (
    <div key={label} style={row}>
      <Icon name={icon} size={16} />
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ color: 'var(--ui-text-muted)', fontSize: '0.9em' }}>{value}</span>
    </div>
  ))

export const Preview = () => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <Drawer inline title="Filters" description="12 active">
      <Rows />
    </Drawer>
  </div>
)
Preview.layout = 'fullscreen'
Preview.height = 320

export const Playground = (args) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button icon="sliders" onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer
        {...args}
        open={open}
        onOpenChange={setOpen}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Reset</Button>
            <Button onClick={() => setOpen(false)}>Apply</Button>
          </>
        }
      >
        <Rows />
      </Drawer>
    </>
  )
}

export const Sides = () => {
  const [side, setSide] = useState(null)
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {['left', 'right', 'top', 'bottom'].map((s) => (
        <Button key={s} variant="outline" onClick={() => setSide(s)}>
          {s}
        </Button>
      ))}
      <Drawer open={!!side} onOpenChange={() => setSide(null)} side={side ?? 'right'} title={`From the ${side ?? ''}`}>
        <p style={{ margin: 0 }}>Escape, the × button or a click on the backdrop closes it, and focus returns to the button you used.</p>
      </Drawer>
    </div>
  )
}

export const Navigation = () => {
  const [open, setOpen] = useState(false)
  const items = [
    ['home', 'Home'],
    ['inbox', 'Inbox'],
    ['bar-chart', 'Reports'],
    ['users', 'Team'],
    ['settings', 'Settings'],
  ]
  return (
    <>
      <Button variant="ghost" icon="menu" onClick={() => setOpen(true)} aria-label="Open menu">Menu</Button>
      <Drawer open={open} onOpenChange={setOpen} side="left" size="280px" title="Acme Inc.">
        {items.map(([icon, label], i) => (
          <a
            key={label}
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setOpen(false)
            }}
            style={{ ...row, background: i === 0 ? 'var(--ui-accent-soft)' : 'transparent', borderColor: 'transparent', color: 'inherit', textDecoration: 'none' }}
          >
            <Icon name={icon} size={18} />
            {label}
          </a>
        ))}
      </Drawer>
    </>
  )
}
