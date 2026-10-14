import { useState } from 'react'
import { useInterval } from '../../../lib/hooks'
import { seeded } from '../_shared/demo'
import { Gauge } from './Gauge'

export default {
  title: 'Gauge',
  category: 'Charts',
  status: 'ready',
  description:
    'One value against a range, with status zones. The needle swings in on a spring and the zone status ships as icon + label (role="meter" for screen readers). Extra lights the ticks up, sprays sparks from the needle tip on every change, and throbs red in the danger zone.',
  controls: {
    value: { type: 'range', min: 0, max: 100, default: 72 },
    sweep: { type: 'range', min: 180, max: 300, step: 10, default: 240 },
    thickness: { type: 'range', min: 6, max: 32, default: 16 },
    size: { type: 'range', min: 140, max: 360, step: 10, default: 240 },
    needle: { type: 'boolean', default: true },
    ticks: { type: 'boolean', default: true },
    showStatus: { type: 'boolean', label: 'status', default: true },
    animate: { type: 'boolean', default: true },
    card: { type: 'boolean', default: true },
  },
}

export const Thumbnail = () => (
  <div style={{ width: 160 }}>
    <Gauge value={68} size={160} thickness={12} ticks={false} showStatus={false} />
  </div>
)

export const Playground = (args) => (
  <div style={{ maxWidth: 320, margin: '0 auto' }}>
    <Gauge {...args} label="CPU load" unit="%" title="Server health" />
  </div>
)

export const Zones = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
    {[
      [34, 'Disk'],
      [74, 'Memory'],
      [93, 'CPU'],
    ].map(([v, l]) => (
      <div key={l} style={{ width: 200 }}>
        <Gauge card value={v} label={l} unit="%" size={200} thickness={14} />
      </div>
    ))}
  </div>
)

export const Semicircle = () => (
  <div style={{ maxWidth: 320, margin: '0 auto' }}>
    <Gauge
      card
      value={4.3}
      min={0}
      max={5}
      sweep={180}
      needle={false}
      thickness={22}
      format={(v) => v.toFixed(1)}
      zones={[
        { to: 2.5, tone: 'danger', label: 'Poor' },
        { to: 3.8, tone: 'warning', label: 'Okay' },
        { to: Infinity, tone: 'success', label: 'Great' },
      ]}
      label="Customer rating"
      title="Satisfaction"
    />
  </div>
)

export const Live = () => {
  const [v, setV] = useState(48)
  const [t, setT] = useState(1)
  useInterval(() => {
    const r = seeded(t * 13)
    setT((n) => n + 1)
    setV((x) => Math.max(5, Math.min(99, Math.round(x + (r() - 0.45) * 40))))
  }, 2200)
  return (
    <div style={{ maxWidth: 300, margin: '0 auto' }}>
      <Gauge card value={v} label="Requests / min" unit="k" title="Live throughput" subtitle="New reading every 2.2s" />
    </div>
  )
}
