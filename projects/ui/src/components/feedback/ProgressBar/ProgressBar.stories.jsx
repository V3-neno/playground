import { useState } from 'react'
import { useInterval } from '../../../lib/hooks'
import { Button } from '../../actions/Button/Button'
import { ProgressBar } from './ProgressBar'

export default {
  title: 'Progress bar',
  category: 'Feedback',
  status: 'ready',
  description:
    'Linear progress with label and value, four tones, three sizes, stripes and an indeterminate mode (omit `value`). In Extra it grows a comet head and throws confetti when it reaches 100%.',
  controls: {
    value: { type: 'range', min: 0, max: 100, default: 62 },
    label: { type: 'text', default: 'Uploading assets' },
    showValue: { type: 'boolean', default: true },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    tone: { type: 'radio', options: ['accent', 'success', 'warning', 'danger'], default: 'accent' },
    striped: { type: 'boolean', default: false },
    indeterminate: { type: 'boolean', default: false },
  },
}

export const Overview = () => (
  <div style={{ display: 'grid', gap: 14, width: 'min(320px, 100%)' }}>
    <ProgressBar value={72} label="Storage" showValue />
    <ProgressBar value={35} tone="success" size="sm" label="Profile" />
  </div>
)

export const Playground = (args) => (
  <div style={{ width: 'min(420px, 100%)' }}>
    <ProgressBar {...args} value={args.indeterminate ? undefined : args.value} />
  </div>
)

export const Animated = () => {
  const [value, setValue] = useState(0)
  const [running, setRunning] = useState(true)
  useInterval(
    () => setValue((v) => {
      const next = Math.min(100, v + 4 + Math.random() * 9)
      if (next >= 100) setRunning(false)
      return next
    }),
    running ? 350 : null,
  )
  return (
    <div style={{ display: 'grid', gap: 14, width: 'min(420px, 100%)', justifyItems: 'start' }}>
      <ProgressBar value={value} label={value >= 100 ? 'Done!' : 'Deploying…'} showValue size="lg" tone={value >= 100 ? 'success' : 'accent'} />
      <Button
        size="sm"
        variant="outline"
        icon="refresh"
        onClick={() => {
          setValue(0)
          setRunning(true)
        }}
      >
        Run again
      </Button>
    </div>
  )
}

export const Tones = () => (
  <div style={{ display: 'grid', gap: 14, width: 'min(420px, 100%)' }}>
    <ProgressBar value={60} label="Accent" showValue />
    <ProgressBar value={100} tone="success" label="Success" showValue />
    <ProgressBar value={80} tone="warning" label="Warning" showValue />
    <ProgressBar value={95} tone="danger" label="Danger: almost out of credits" showValue />
  </div>
)

export const SizesAndStripes = () => (
  <div style={{ display: 'grid', gap: 14, width: 'min(420px, 100%)' }}>
    <ProgressBar value={40} size="sm" label="Small" />
    <ProgressBar value={55} size="md" label="Medium, striped" striped />
    <ProgressBar value={70} size="lg" label="Large, striped" striped />
  </div>
)

export const Indeterminate = () => (
  <div style={{ display: 'grid', gap: 14, width: 'min(420px, 100%)' }}>
    <ProgressBar label="Connecting…" />
    <ProgressBar size="sm" />
  </div>
)
