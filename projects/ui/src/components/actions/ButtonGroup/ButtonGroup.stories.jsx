import { useState } from 'react'
import { Button } from '../Button/Button'
import { ButtonGroup } from './ButtonGroup'

export default {
  title: 'Button group',
  category: 'Actions',
  status: 'ready',
  description:
    'Pass `options` for a segmented control (single choice, arrow keys move the selection, sliding thumb). Without options it joins its child buttons into one attached group.',
  controls: {
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    fullWidth: { type: 'boolean', default: false },
  },
}

export const Segmented = () => <ButtonGroup label="Period" options={['Day', 'Week', 'Month']} defaultValue="Week" />

export const Playground = (args) => {
  const [value, setValue] = useState('grid')
  return (
    <div style={{ width: args.fullWidth ? 360 : 'auto', display: 'grid', gap: 12, justifyItems: 'center' }}>
      <ButtonGroup
        {...args}
        label="View"
        value={value}
        onChange={setValue}
        options={[
          { value: 'grid', label: 'Grid', icon: 'grid' },
          { value: 'list', label: 'List', icon: 'list' },
          { value: 'chart', label: 'Chart', icon: 'bar-chart' },
        ]}
      />
      <small style={{ color: 'var(--ui-text-muted)' }}>value: {value}</small>
    </div>
  )
}

export const IconOnly = () => (
  <ButtonGroup
    label="Text alignment"
    size="sm"
    options={[
      { value: 'left', icon: 'align-left' },
      { value: 'center', icon: 'align-center' },
      { value: 'right', icon: 'align-right' },
    ]}
  />
)

export const WithDisabled = () => (
  <ButtonGroup
    label="Plan"
    options={[{ value: 'Free' }, { value: 'Pro' }, { value: 'Team', disabled: true }].map((o) => ({ ...o, label: o.value }))}
    defaultValue="Pro"
  />
)

export const Attached = () => (
  <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
    <ButtonGroup label="Pagination">
      <Button variant="outline" icon="chevron-left">Prev</Button>
      <Button variant="outline">1</Button>
      <Button variant="outline">2</Button>
      <Button variant="outline" iconRight="chevron-right">Next</Button>
    </ButtonGroup>
    <ButtonGroup label="Save">
      <Button>Save</Button>
      <Button icon="chevron-down" aria-label="More save options" />
    </ButtonGroup>
  </div>
)

export const Vertical = () => (
  <ButtonGroup label="Zoom" orientation="vertical">
    <Button variant="outline" icon="plus" aria-label="Zoom in" />
    <Button variant="outline" icon="minus" aria-label="Zoom out" />
  </ButtonGroup>
)
