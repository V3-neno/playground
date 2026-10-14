import { Combobox } from './Combobox'

const CITIES = ['Amsterdam', 'Berlin', 'Copenhagen', 'Dublin', 'Edinburgh', 'Florence', 'Gothenburg', 'Helsinki', 'Istanbul', 'Lisbon', 'Madrid', 'Oslo', 'Paris', 'Reykjavík', 'Stockholm', 'Vienna']
const SKILLS = [
  { value: 'react', label: 'React', icon: 'layers' },
  { value: 'css', label: 'CSS', icon: 'sparkles' },
  { value: 'motion', label: 'Motion design', icon: 'zap' },
  { value: 'a11y', label: 'Accessibility', icon: 'eye' },
  { value: 'dataviz', label: 'Data visualisation', icon: 'bar-chart' },
  { value: 'typography', label: 'Typography', icon: 'bold' },
]

export default {
  title: 'Combobox',
  category: 'Inputs',
  status: 'ready',
  description: 'Type to filter, arrows to move, Enter to pick, Escape to close (or clear). Multiple mode turns picks into removable chips; Backspace removes the last one. In Extra, chips are glowing gradient pills and adding one throws confetti.',
  controls: {
    label: { type: 'text', default: 'City' },
    placeholder: { type: 'text', default: 'Search cities…' },
    multiple: { type: 'boolean', default: false },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    error: { type: 'text', default: '' },
    disabled: { type: 'boolean', default: false },
  },
}

export const Playground = (args) => (
  <div style={{ width: 280 }}>
    <Combobox key={String(args.multiple)} {...args} error={args.error || undefined} options={CITIES} />
  </div>
)
Playground.height = 380
Playground.layout = 'padded'

export const Multiple = () => (
  <div style={{ width: 340 }}>
    <Combobox label="Skills" multiple options={SKILLS} defaultValue={['react', 'motion']} placeholder="Add a skill…" hint="Backspace removes the last one" />
  </div>
)
Multiple.height = 380
Multiple.layout = 'padded'

export const States = () => (
  <div style={{ display: 'grid', gap: 16, width: 280 }}>
    <Combobox label="Destination" options={CITIES} error="We don't fly there yet" defaultValue="Reykjavík" />
    <Combobox label="Disabled" options={CITIES} defaultValue="Oslo" disabled />
  </div>
)
