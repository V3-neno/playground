import { useState } from 'react'
import { Switch } from './Switch'

export default {
  title: 'Switch',
  category: 'Inputs',
  status: 'ready',
  description: 'role="switch" toggle with an iOS-style squish while pressed, optional icons in the thumb, description and sizes. In Extra the thumb spins over on a rainbow track and throws stars.',
  controls: {
    label: { type: 'text', default: 'Wi-Fi' },
    description: { type: 'text', default: '' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    labelPosition: { type: 'radio', options: ['right', 'left'], default: 'right' },
    disabled: { type: 'boolean', default: false },
  },
}

export const Playground = (args) => <Switch {...args} description={args.description || undefined} defaultChecked />

export const Settings = () => {
  const [dark, setDark] = useState(true)
  return (
    <div style={{ display: 'grid', gap: 16, width: 320 }}>
      <Switch label="Notifications" description="Push alerts for mentions and replies" defaultChecked />
      <Switch label="Autoplay videos" description="Uses more data on mobile" />
      <Switch label={dark ? 'Dark mode' : 'Light mode'} checked={dark} onChange={setDark} iconOff="sun" iconOn="moon" />
    </div>
  )
}

export const States = () => (
  <div style={{ display: 'grid', gap: 12 }}>
    <Switch label="Off" />
    <Switch label="On" defaultChecked />
    <Switch label="Disabled" disabled />
    <Switch label="Disabled on" disabled defaultChecked />
  </div>
)

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
    <Switch size="sm" defaultChecked aria-label="Small" />
    <Switch size="md" defaultChecked aria-label="Medium" />
    <Switch size="lg" defaultChecked iconOn="check" iconOff="x" aria-label="Large" />
  </div>
)
