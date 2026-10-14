import { Slider } from './Slider'

export default {
  title: 'Slider',
  category: 'Inputs',
  status: 'ready',
  description: 'Single or range slider: drag anywhere on the track, or use arrows, PageUp/PageDown, Home and End. Value bubble, marks and a custom formatter. In Extra the fill glows, the thumb is a glowing orb, and hitting either end sets off confetti.',
  controls: {
    label: { type: 'text', default: 'Volume' },
    min: { type: 'number', default: 0 },
    max: { type: 'number', default: 100 },
    step: { type: 'number', default: 1, min: 1 },
    range: { type: 'boolean', default: false },
    showValue: { type: 'radio', options: ['hover', 'always', 'never'], default: 'hover' },
    disabled: { type: 'boolean', default: false },
  },
}

export const Playground = (args) => (
  <div style={{ width: 'min(100%, 340px)', paddingTop: 16 }}>
    <Slider key={`${args.range}-${args.min}-${args.max}`} {...args} />
  </div>
)

export const PriceRange = () => (
  <div style={{ width: 'min(100%, 380px)', paddingTop: 20 }}>
    <Slider label="Price" range min={0} max={1000} step={10} defaultValue={[200, 650]} showValue="always" format={(v) => `$${v}`} />
  </div>
)

export const WithMarks = () => (
  <div style={{ width: 'min(100%, 380px)', paddingTop: 16 }}>
    <Slider label="Rating" min={1} max={5} step={1} defaultValue={4} marks={[1, 2, 3, 4, 5]} format={(v) => '★'.repeat(v)} />
  </div>
)

export const States = () => (
  <div style={{ display: 'grid', gap: 28, width: 'min(100%, 340px)', paddingTop: 16 }}>
    <Slider label="Brightness" defaultValue={70} format={(v) => `${v}%`} />
    <Slider label="Disabled" defaultValue={30} disabled />
  </div>
)
