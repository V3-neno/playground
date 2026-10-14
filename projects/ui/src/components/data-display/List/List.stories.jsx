import { PEOPLE } from '../../../lib/placeholder'
import { Button } from '../../actions/Button/Button'
import { List } from './List'

const FILES = [
  { id: 'brief', icon: 'file', title: 'Project brief.pdf', description: 'Updated by Maya · 2.4 MB', meta: '2h ago' },
  { id: 'assets', icon: 'folder', title: 'Brand assets', description: '48 files', meta: 'Yesterday' },
  { id: 'deck', icon: 'image', title: 'Launch deck', description: 'Shared with 6 people', meta: 'Mon' },
  { id: 'notes', icon: 'edit', title: 'Meeting notes', description: 'Draft', meta: 'Oct 2' },
]

const PLANS = [
  { id: 'starter', icon: 'zap', title: 'Starter', description: 'For side projects', meta: '$0' },
  { id: 'pro', icon: 'rocket', title: 'Pro', description: 'For growing teams', meta: '$24/mo' },
  { id: 'scale', icon: 'shield', title: 'Scale', description: 'SSO, audit log, SLA', meta: '$99/mo' },
]

export default {
  title: 'List',
  category: 'Data display',
  status: 'ready',
  description:
    'Rows with leading icon/avatar, title, description and trailing meta or action. `selectable` turns it into a keyboard-navigable listbox (arrows, Home/End, Enter). In Extra rows float in staggered and selection throws confetti.',
  controls: {
    variant: { type: 'radio', options: ['divided', 'separated', 'plain'], default: 'divided' },
    selectable: { type: 'boolean', default: false },
    dense: { type: 'boolean', default: false },
  },
}

export const Overview = () => (
  <div style={{ width: 200 }}>
    <List dense items={FILES.slice(0, 2).map(({ meta, ...f }) => f)} />
  </div>
)

export const Playground = (args) => (
  <div style={{ width: 420, maxWidth: '100%' }}>
    <List {...args} items={FILES} defaultValue="assets" />
  </div>
)

export const People = () => (
  <div style={{ width: 440, maxWidth: '100%' }}>
    <List
      variant="separated"
      items={PEOPLE.slice(0, 4).map((p) => ({
        id: p.name,
        avatar: p.avatar,
        title: p.name,
        description: `${p.role} · ${p.email}`,
        action: (
          <Button size="sm" variant="outline">
            Message
          </Button>
        ),
      }))}
    />
  </div>
)

export const Selectable = () => (
  <div style={{ width: 380, maxWidth: '100%' }}>
    <List selectable items={PLANS} defaultValue="pro" aria-label="Choose a plan" />
  </div>
)

export const Plain = () => (
  <div style={{ width: 360, maxWidth: '100%' }}>
    <List variant="plain" dense items={FILES} />
  </div>
)
