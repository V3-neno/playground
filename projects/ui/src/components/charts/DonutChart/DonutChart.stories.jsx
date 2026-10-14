import { useState } from 'react'
import { useInterval } from '../../../lib/hooks'
import { seeded } from '../_shared/demo'
import { DonutChart } from './DonutChart'

const BUDGET = [
  { label: 'Engineering', value: 4200 },
  { label: 'Marketing', value: 2600 },
  { label: 'Sales', value: 1900 },
  { label: 'Support', value: 1100 },
  { label: 'Operations', value: 800 },
  { label: 'Other', value: 400 },
]

export default {
  title: 'Donut chart',
  category: 'Charts',
  status: 'ready',
  description:
    'Part-to-whole for up to six categories. Slices sweep in, hovering a slice or legend row pulls it out and shows it in the centre. Extra spins a neon halo behind the ring and throws slice-coloured confetti on click.',
  controls: {
    slices: { type: 'range', min: 2, max: 6, default: 5 },
    thickness: { type: 'range', min: 0.1, max: 1, step: 0.05, default: 0.3 },
    size: { type: 'range', min: 120, max: 320, step: 10, default: 220 },
    half: { type: 'boolean', default: false },
    legend: { type: 'boolean', default: true },
    showPercent: { type: 'boolean', label: 'percent', default: true },
    animate: { type: 'boolean', default: true },
    card: { type: 'boolean', default: true },
  },
}

export const Thumbnail = () => (
  <div style={{ width: 110 }}>
    <DonutChart data={BUDGET.slice(0, 4)} size={104} legend={false} />
  </div>
)

export const Playground = ({ slices, ...args }) => (
  <div style={{ maxWidth: 520, margin: '0 auto' }}>
    <DonutChart {...args} data={BUDGET.slice(0, slices)} title="Budget split" subtitle="EUR thousands, FY26" format={(v) => `€${v}k`} tooltipFormat={(v) => `€${v}k`} />
  </div>
)

export const Pie = () => (
  <div style={{ maxWidth: 460, margin: '0 auto' }}>
    <DonutChart card thickness={1} data={BUDGET.slice(0, 4)} title="Pie" subtitle="thickness = 1" />
  </div>
)

export const HalfDonut = () => (
  <div style={{ maxWidth: 460, margin: '0 auto' }}>
    <DonutChart
      card
      half
      thickness={0.28}
      data={[
        { label: 'Yes', value: 58 },
        { label: 'No', value: 31 },
        { label: 'Undecided', value: 11 },
      ]}
      centerLabel="Responses"
      centerValue="1,284"
      title="Poll results"
    />
  </div>
)

export const Small = () => (
  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
    {[72, 45, 18].map((p, i) => (
      <div key={p} style={{ width: 120 }}>
        <DonutChart
          size={120}
          legend={false}
          thickness={0.22}
          data={[
            { label: ['Storage', 'Bandwidth', 'Seats'][i], value: p },
            { label: 'Free', value: 100 - p },
          ]}
          centerLabel={['Storage', 'Bandwidth', 'Seats'][i]}
          centerValue={`${p}%`}
        />
      </div>
    ))}
  </div>
)

export const Live = () => {
  const [data, setData] = useState(BUDGET.slice(0, 4))
  const [t, setT] = useState(1)
  useInterval(() => {
    const r = seeded(t * 7)
    setT((n) => n + 1)
    setData((d) => d.map((s) => ({ ...s, value: Math.max(200, Math.round(s.value * (0.8 + r() * 0.4))) })))
  }, 1800)
  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <DonutChart card data={data} title="Live share" subtitle="Rebalances every 1.8s" />
    </div>
  )
}
