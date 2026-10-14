import { useState } from 'react'
import { Button } from '../../actions/Button/Button'
import { CommandPalette } from './CommandPalette'

export default {
  title: 'Command palette',
  category: 'Overlays',
  status: 'ready',
  description:
    'A ⌘K launcher: combobox input + grouped listbox with fuzzy matching (word starts and runs rank higher, matched letters highlighted), ↑/↓/Enter, Escape, focus trap and focus return. `hotkey="k"` binds Ctrl/⌘+K; `inline` embeds it. Extra drops it in on a spring, turns the active row into a glowing gradient pill, shimmers the matched letters and pops confetti on select.',
  height: 500,
  controls: {
    placeholder: { type: 'text', default: 'Type a command or search…' },
    emptyText: { type: 'text', default: 'No results' },
  },
}

const ITEMS = [
  { id: 'new', label: 'New project', group: 'Actions', icon: 'plus', shortcut: '⌘ N' },
  { id: 'invite', label: 'Invite teammate', group: 'Actions', icon: 'users', keywords: ['add', 'member'] },
  { id: 'upload', label: 'Upload file', group: 'Actions', icon: 'upload', shortcut: '⌘ U' },
  { id: 'theme', label: 'Toggle dark mode', group: 'Actions', icon: 'moon', shortcut: '⌘ ⇧ L', keywords: ['theme', 'light'] },
  { id: 'home', label: 'Go to dashboard', group: 'Navigation', icon: 'home', shortcut: 'G D' },
  { id: 'inbox', label: 'Go to inbox', group: 'Navigation', icon: 'inbox', shortcut: 'G I' },
  { id: 'reports', label: 'Open reports', group: 'Navigation', icon: 'bar-chart' },
  { id: 'settings', label: 'Settings', group: 'Navigation', icon: 'settings', shortcut: '⌘ ,', keywords: ['preferences'] },
  { id: 'help', label: 'Help center', group: 'Help', icon: 'info', keywords: ['docs', 'support'] },
  { id: 'feedback', label: 'Send feedback', group: 'Help', icon: 'message' },
]

export const Preview = () => <CommandPalette inline items={ITEMS.slice(0, 5)} placeholder="Search…" />
Preview.layout = 'padded'
Preview.height = 300

export const Playground = (args) => {
  const [open, setOpen] = useState(false)
  const [last, setLast] = useState(null)
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
      <Button variant="outline" icon="command" onClick={() => setOpen(true)}>
        Open palette <kbd style={{ opacity: 0.6, fontFamily: 'var(--ui-font-mono)', fontSize: '0.8em' }}>Ctrl K</kbd>
      </Button>
      <span style={{ color: 'var(--ui-text-muted)', fontSize: '0.9em' }}>{last ? `Ran: ${last}` : 'Ctrl/⌘+K works too'}</span>
      <CommandPalette {...args} hotkey="k" items={ITEMS} open={open} onOpenChange={setOpen} onSelect={(item) => setLast(item.label)} />
    </div>
  )
}

export const Inline = () => {
  const [last, setLast] = useState('nothing yet')
  return (
    <div style={{ display: 'grid', gap: 10, width: '100%', justifyItems: 'center' }}>
      <CommandPalette inline items={ITEMS} onSelect={(item) => setLast(item.label)} />
      <span style={{ color: 'var(--ui-text-muted)', fontSize: '0.9em' }}>Selected: {last}</span>
    </div>
  )
}
Inline.height = 460

export const Empty = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="ghost" icon="search" onClick={() => setOpen(true)}>Search an empty index</Button>
      <CommandPalette items={[]} open={open} onOpenChange={setOpen} placeholder="Nothing to find here…" emptyText="Nothing matches" />
    </>
  )
}
