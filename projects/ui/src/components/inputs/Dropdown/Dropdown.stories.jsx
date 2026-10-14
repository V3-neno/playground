import { Dropdown } from './Dropdown'

const FRUIT = ['Apple', 'Banana', 'Cherry', 'Dragonfruit', 'Elderberry', 'Fig', 'Grape']
const PLANS = [
  { value: 'free', label: 'Free', icon: 'zap', description: 'For side projects' },
  { value: 'pro', label: 'Pro', icon: 'rocket', description: 'For growing teams' },
  { value: 'enterprise', label: 'Enterprise', icon: 'shield', description: 'SSO, audit logs, SLA' },
  { value: 'legacy', label: 'Legacy', icon: 'clock', description: 'No longer available', disabled: true },
]

export default {
  title: 'Dropdown',
  category: 'Inputs',
  status: 'ready',
  description: 'Select-only listbox: arrow keys, Home/End, type-ahead, Escape. Options can carry icons, descriptions and a disabled state. In Extra the options cascade in and choosing one throws sparkles.',
  controls: {
    label: { type: 'text', default: 'Favourite fruit' },
    placeholder: { type: 'text', default: 'Pick one…' },
    hint: { type: 'text', default: '' },
    error: { type: 'text', default: '' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    disabled: { type: 'boolean', default: false },
  },
}

export const Playground = (args) => (
  <div style={{ width: 260 }}>
    <Dropdown {...args} hint={args.hint || undefined} error={args.error || undefined} options={FRUIT} defaultValue="Cherry" />
  </div>
)
Playground.height = 360
Playground.layout = 'padded'

export const Open = () => (
  <div style={{ width: 280 }}>
    <Dropdown label="Plan" options={PLANS} defaultValue="pro" defaultOpen />
  </div>
)
Open.height = 320
Open.layout = 'padded'

export const States = () => (
  <div style={{ display: 'grid', gap: 16, width: 260 }}>
    <Dropdown label="Country" options={['Sweden', 'Norway', 'Denmark']} error="Please choose a country" />
    <Dropdown label="Disabled" options={FRUIT} defaultValue="Fig" disabled />
  </div>
)

export const Sizes = () => (
  <div style={{ display: 'grid', gap: 12, width: 240 }}>
    <Dropdown size="sm" options={FRUIT} placeholder="Small" />
    <Dropdown size="md" options={FRUIT} placeholder="Medium" />
    <Dropdown size="lg" options={FRUIT} placeholder="Large" />
  </div>
)
