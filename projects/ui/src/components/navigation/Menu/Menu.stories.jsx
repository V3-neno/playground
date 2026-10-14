import { useState } from 'react'
import { Menu } from './Menu'

const ACTIONS = [
  { id: 'edit', label: 'Edit', icon: 'edit', shortcut: 'E' },
  { id: 'duplicate', label: 'Duplicate', icon: 'copy', shortcut: '⌘D' },
  { id: 'share', label: 'Share…', icon: 'external' },
  { type: 'separator' },
  { id: 'archive', label: 'Archive', icon: 'folder', disabled: true },
  { id: 'delete', label: 'Delete', icon: 'trash', danger: true, shortcut: '⌫' },
]

const Log = ({ value }) => (
  <div style={{ minHeight: 22, color: 'var(--ui-text-muted)', fontSize: '0.875em' }}>{value ? `Selected: ${value}` : 'Pick something'}</div>
)

export default {
  title: 'Menu',
  category: 'Navigation',
  status: 'ready',
  description:
    'Action menu (role="menu"): Enter/Space/↓ opens, arrows + Home/End move, letters type-ahead, Esc closes and returns focus. Supports separators, group labels, shortcuts, danger and checkbox items. Extra: rainbow rim, items cascade in on a spring, a glowing highlight glides behind them, and every pick pops confetti.',
  height: 320,
  layout: 'padded',
  controls: {
    label: { type: 'text', default: 'Actions' },
    trigger: { type: 'radio', options: ['button', 'icon'], default: 'button' },
    align: { type: 'radio', options: ['start', 'end'], default: 'start' },
  },
}

export const Open = () => <Menu label="Actions" defaultOpen items={ACTIONS.slice(0, 3)} />
Open.layout = 'padded'
Open.height = 240

export const Playground = (args) => {
  const [last, setLast] = useState('')
  return (
    <div style={{ display: 'grid', gap: 10, justifyItems: args.align === 'end' ? 'end' : 'start' }}>
      <Menu {...args} items={ACTIONS} onSelect={setLast} />
      <Log value={last} />
    </div>
  )
}

export const Grouped = () => (
  <Menu
    label="Account"
    icon="user"
    items={[
      { type: 'label', label: 'Signed in as Ada' },
      { id: 'profile', label: 'Profile', icon: 'user' },
      { id: 'settings', label: 'Settings', icon: 'settings', shortcut: '⌘,' },
      { id: 'billing', label: 'Billing', icon: 'credit-card' },
      { type: 'separator' },
      { type: 'label', label: 'Workspace' },
      { id: 'invite', label: 'Invite people', icon: 'users' },
      { id: 'help', label: 'Help & feedback', icon: 'message' },
      { type: 'separator' },
      { id: 'logout', label: 'Log out', icon: 'arrow-right' },
    ]}
  />
)

export const Checkable = () => {
  const [cols, setCols] = useState({ name: true, email: true, role: false, status: true })
  return (
    <Menu
      label="Columns"
      icon="list"
      closeOnSelect={false}
      items={[
        { type: 'label', label: 'Visible columns' },
        ...Object.entries(cols).map(([id, checked]) => ({ id, label: id[0].toUpperCase() + id.slice(1), checked })),
      ]}
      onSelect={(id) => setCols((c) => ({ ...c, [id]: !c[id] }))}
    />
  )
}

export const IconTrigger = () => (
  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <Menu label="Row actions" trigger="icon" align="end" items={ACTIONS} />
  </div>
)
