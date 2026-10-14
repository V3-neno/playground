import { useState } from 'react'
import { avatar } from '../../../lib/placeholder'
import { SidebarNav } from './SidebarNav'

const SECTIONS = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'home' },
      { id: 'inbox', label: 'Inbox', icon: 'inbox', badge: 8 },
      { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      {
        id: 'projects',
        label: 'Projects',
        icon: 'folder',
        children: [
          { id: 'p-website', label: 'Website redesign' },
          { id: 'p-mobile', label: 'Mobile app', badge: 3 },
          { id: 'p-brand', label: 'Brand refresh' },
        ],
      },
      { id: 'reports', label: 'Reports', icon: 'bar-chart' },
      { id: 'team', label: 'Team', icon: 'users' },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: 'billing', label: 'Billing', icon: 'credit-card' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

const Footer = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
    <img src={avatar('Ada Lovelace')} alt="" width={30} height={30} style={{ borderRadius: '50%', flexShrink: 0 }} />
    <div style={{ minWidth: 0, lineHeight: 1.25 }}>
      <div style={{ fontWeight: 600, fontSize: '0.9em' }}>Ada Lovelace</div>
      <div style={{ color: 'var(--ui-text-muted)', fontSize: '0.78em' }}>ada@example.com</div>
    </div>
  </div>
)

const Content = ({ title }) => (
  <div style={{ padding: 28, display: 'grid', gap: 14 }}>
    <div className="ui-heading" style={{ fontSize: '1.5em' }}>
      {title}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: 90, borderRadius: 'var(--ui-radius-md)', background: 'var(--ui-surface-2)' }} />
      ))}
    </div>
    <div style={{ height: 160, borderRadius: 'var(--ui-radius-md)', background: 'var(--ui-surface)' }} />
  </div>
)

const labelOf = (id) => SECTIONS.flatMap((s) => s.items.flatMap((i) => [i, ...(i.children ?? [])])).find((i) => i.id === id)?.label

export default {
  title: 'Sidebar nav',
  category: 'Navigation',
  status: 'ready',
  description:
    'App shell with sections, nested groups (animated open/close), badges and an icon-only collapsed rail. Below ~620px of container width it becomes a top bar + off-canvas drawer (Esc or the scrim closes it). Extra: a glowing gradient slab springs between items, icons wobble, the logo has an orbiting ring.',
  layout: 'fullscreen',
  height: 520,
  controls: {
    brand: { type: 'text', default: 'Northwind' },
    logo: { type: 'select', options: ['layers', 'zap', 'rocket', 'globe', 'sparkles'], default: 'layers' },
    collapsed: { type: 'boolean', default: false },
    footer: { type: 'boolean', default: true },
  },
}

export const Rail = () => (
  <div style={{ height: 300 }}>
    <SidebarNav brand="Northwind" sections={SECTIONS.slice(0, 1)} />
  </div>
)
Rail.height = 300

export const Playground = ({ footer, collapsed, ...args }) => {
  const [active, setActive] = useState('dashboard')
  return (
    <div style={{ height: 520 }}>
      <SidebarNav key={String(collapsed)} {...args} defaultCollapsed={collapsed} sections={SECTIONS} value={active} onChange={setActive} footer={footer ? <Footer /> : null}>
        <Content title={labelOf(active)} />
      </SidebarNav>
    </div>
  )
}

export const NestedOpen = () => {
  const [active, setActive] = useState('p-mobile')
  return (
    <div style={{ height: 520 }}>
      <SidebarNav brand="Northwind" sections={SECTIONS} value={active} onChange={setActive} footer={<Footer />}>
        <Content title={labelOf(active)} />
      </SidebarNav>
    </div>
  )
}

export const Collapsed = () => (
  <div style={{ height: 520 }}>
    <SidebarNav brand="Northwind" sections={SECTIONS} defaultCollapsed defaultValue="reports">
      <Content title="Reports" />
    </SidebarNav>
  </div>
)

export const Mobile = () => (
  <div style={{ height: 520, maxWidth: 390, margin: '0 auto', borderInline: '1px dashed var(--ui-border)' }}>
    <SidebarNav brand="Northwind" sections={SECTIONS} footer={<Footer />}>
      <Content title="Dashboard" />
    </SidebarNav>
  </div>
)
Mobile.storyName = 'Mobile (tap ☰)'
