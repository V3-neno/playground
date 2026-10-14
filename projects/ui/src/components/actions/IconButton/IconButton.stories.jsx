import { ICON_NAMES } from '../../../lib/icons'
import { IconButton } from './IconButton'

export default {
  title: 'Icon button',
  category: 'Actions',
  status: 'ready',
  description: 'A button that is just an icon. Always pass a `label`: it is the accessible name and the tooltip. Optional badge (number or dot).',
  controls: {
    icon: { type: 'select', options: ICON_NAMES, default: 'heart' },
    label: { type: 'text', default: 'Like' },
    variant: { type: 'radio', options: ['solid', 'outline', 'ghost'], default: 'outline' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    shape: { type: 'radio', options: ['square', 'round'], default: 'square' },
    disabled: { type: 'boolean', default: false },
  },
}

export const Toolbar = () => (
  <div style={{ display: 'flex', gap: 8 }}>
    <IconButton icon="edit" label="Edit" variant="outline" />
    <IconButton icon="copy" label="Duplicate" variant="outline" />
    <IconButton icon="bell" label="Notifications, 3 unread" variant="outline" badge={3} />
    <IconButton icon="plus" label="Add" variant="solid" />
  </div>
)

export const Playground = (args) => <IconButton {...args} />

export const Variants = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <IconButton icon="sparkles" label="Solid" variant="solid" />
    <IconButton icon="sparkles" label="Outline" variant="outline" />
    <IconButton icon="sparkles" label="Ghost" variant="ghost" />
    <IconButton icon="sparkles" label="Round solid" variant="solid" shape="round" />
    <IconButton icon="sparkles" label="Round outline" variant="outline" shape="round" />
  </div>
)

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <IconButton icon="settings" label="Small" size="sm" variant="outline" />
    <IconButton icon="settings" label="Medium" size="md" variant="outline" />
    <IconButton icon="settings" label="Large" size="lg" variant="outline" />
  </div>
)

export const Badges = () => (
  <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
    <IconButton icon="mail" label="Inbox, 12 unread" variant="outline" badge={12} />
    <IconButton icon="bell" label="Notifications, new" variant="ghost" badge />
    <IconButton icon="message" label="Messages, 99+ unread" variant="solid" shape="round" badge="99+" />
  </div>
)

export const Disabled = () => (
  <div style={{ display: 'flex', gap: 12 }}>
    <IconButton icon="trash" label="Delete" variant="solid" disabled />
    <IconButton icon="trash" label="Delete" variant="outline" disabled />
    <IconButton icon="trash" label="Delete" disabled />
  </div>
)
