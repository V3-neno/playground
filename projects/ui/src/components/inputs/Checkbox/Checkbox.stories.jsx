import { useState } from 'react'
import { Checkbox } from './Checkbox'

export default {
  title: 'Checkbox',
  category: 'Inputs',
  status: 'ready',
  description: 'Native checkbox with a drawn tick, indeterminate state, description and sizes. In Extra it backflips and sparkles when ticked.',
  controls: {
    label: { type: 'text', default: 'Send me the newsletter' },
    description: { type: 'text', default: 'One email a month, no spam.' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    indeterminate: { type: 'boolean', default: false },
    invalid: { type: 'boolean', default: false },
    disabled: { type: 'boolean', default: false },
  },
}

export const Playground = (args) => <Checkbox {...args} defaultChecked />

const TOPPINGS = ['Cheese', 'Mushrooms', 'Olives', 'Pineapple']

export const SelectAll = () => {
  const [picked, setPicked] = useState(['Cheese', 'Olives'])
  const all = picked.length === TOPPINGS.length
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <Checkbox
        label="All toppings"
        checked={all}
        indeterminate={!all && picked.length > 0}
        onChange={(on) => setPicked(on ? TOPPINGS : [])}
      />
      <div style={{ display: 'grid', gap: 8, paddingLeft: 30 }}>
        {TOPPINGS.map((t) => (
          <Checkbox key={t} label={t} checked={picked.includes(t)} onChange={(on) => setPicked((p) => (on ? [...p, t] : p.filter((x) => x !== t)))} />
        ))}
      </div>
    </div>
  )
}

export const States = () => (
  <div style={{ display: 'grid', gap: 10 }}>
    <Checkbox label="Unchecked" />
    <Checkbox label="Checked" defaultChecked />
    <Checkbox label="Indeterminate" indeterminate />
    <Checkbox label="Invalid" invalid description="You must accept the terms" />
    <Checkbox label="Disabled" disabled />
    <Checkbox label="Disabled + checked" disabled defaultChecked />
  </div>
)

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
    <Checkbox size="sm" label="Small" defaultChecked />
    <Checkbox size="md" label="Medium" defaultChecked />
    <Checkbox size="lg" label="Large" defaultChecked />
  </div>
)
