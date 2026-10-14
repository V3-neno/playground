import { RadioGroup } from './RadioGroup'

const SHIPPING = [
  { value: 'standard', label: 'Standard', description: '4–6 business days' },
  { value: 'express', label: 'Express', description: '1–2 business days' },
  { value: 'pickup', label: 'Pick up in store', description: 'Ready in an hour' },
]
const PLANS = [
  { value: 'hobby', label: 'Hobby', icon: 'zap', description: 'Free forever' },
  { value: 'pro', label: 'Pro', icon: 'rocket', description: '$12 / month' },
  { value: 'team', label: 'Team', icon: 'users', description: '$49 / month' },
]

export default {
  title: 'Radio group',
  category: 'Inputs',
  status: 'ready',
  description: 'Native radios in a radiogroup (arrow keys move the selection). Three variants: dots, cards and segmented. In Extra the dot has a pulsing halo, cards tilt toward the cursor and choosing sparkles.',
  controls: {
    label: { type: 'text', default: 'Shipping' },
    variant: { type: 'radio', options: ['default', 'cards', 'segmented'], default: 'default' },
    orientation: { type: 'radio', options: ['vertical', 'horizontal'], default: 'vertical' },
    hint: { type: 'text', default: '' },
    error: { type: 'text', default: '' },
    disabled: { type: 'boolean', default: false },
  },
}

export const Playground = (args) => (
  <RadioGroup {...args} hint={args.hint || undefined} error={args.error || undefined} options={SHIPPING} defaultValue="express" />
)

export const Cards = () => (
  <div style={{ width: 'min(100%, 560px)' }}>
    <RadioGroup label="Plan" variant="cards" options={PLANS} defaultValue="pro" />
  </div>
)

export const Segmented = () => (
  <RadioGroup label="View" variant="segmented" options={['Day', 'Week', 'Month', 'Year']} defaultValue="Week" />
)

export const States = () => (
  <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
    <RadioGroup label="Size" options={['S', 'M', 'L']} orientation="horizontal" error="Pick a size" />
    <RadioGroup label="Disabled" options={['On', 'Off']} defaultValue="On" disabled />
    <RadioGroup label="One disabled" options={[{ value: 'a', label: 'Available' }, { value: 'b', label: 'Sold out', disabled: true }]} defaultValue="a" />
  </div>
)
