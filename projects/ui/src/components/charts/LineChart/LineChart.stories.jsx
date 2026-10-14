import { useState } from 'react'
import { useInterval } from '../../../lib/hooks'
import { MONTHS, monthly, seeded, seriesFor, walk } from '../_shared/demo'
import { LineChart } from './LineChart'

export default {
  title: 'Line chart',
  category: 'Charts',
  status: 'ready',
  description:
    'Change over time. Lines draw in left to right, a crosshair tooltip follows the pointer, and 2–4 series get direct end labels. Mono separates series by dash pattern; Extra runs glowing comets along every line.',
  layout: 'padded',
  controls: {
    seriesCount: { type: 'range', label: 'series', min: 1, max: 6, default: 3 },
    curve: { type: 'radio', options: ['smooth', 'linear', 'step'], default: 'smooth' },
    dots: { type: 'boolean', default: false },
    grid: { type: 'boolean', default: true },
    yZero: { type: 'boolean', label: 'start at zero', default: false },
    animate: { type: 'boolean', default: true },
    card: { type: 'boolean', default: true },
    height: { type: 'range', min: 140, max: 420, step: 10, default: 280 },
  },
}

export const Thumbnail = () => (
  <div style={{ width: 200, margin: '0 auto' }}>
    <LineChart data={monthly(2, { seed: 4 })} series={seriesFor(2)} height={110} axes={false} legend={false} />
  </div>
)

export const Playground = ({ seriesCount, ...args }) => (
  <LineChart {...args} data={monthly(seriesCount, { seed: 4 })} series={seriesFor(seriesCount)} title="Active users" subtitle="Monthly, thousands" />
)

export const SingleSeries = () => {
  const values = walk(36, { seed: 9, start: 120, step: 14 })
  const data = values.map((v, i) => ({ label: `W${i + 1}`, price: v }))
  return (
    <LineChart card dots data={data} series={[{ key: 'price', label: 'Price' }]} curve="linear" title="Share price" subtitle="Weekly close, EUR" format={(v) => `€${v}`} tooltipFormat={(v) => `€${v.toFixed(1)}`} />
  )
}

export const Steps = () => {
  const data = MONTHS.map((label, i) => ({ label, rate: [2.5, 2.5, 2.75, 3, 3, 3, 3.25, 3.25, 3.5, 3.5, 3.25, 3][i] }))
  return <LineChart card curve="step" data={data} series={[{ key: 'rate', label: 'Rate' }]} title="Policy rate" subtitle="Step curve for values that change in jumps" format={(v) => `${v}%`} tooltipFormat={(v) => `${v}%`} height={220} />
}

export const Live = () => {
  const [rows, setRows] = useState(() =>
    walk(30, { seed: 21, start: 60, step: 10 }).map((v, i) => ({ label: `${i}s`, cpu: v, memory: 40 + (i % 7) * 2 })),
  )
  const [t, setT] = useState(30)
  useInterval(() => {
    const r = seeded(t)
    setT((n) => n + 1)
    setRows((prev) => {
      const last = prev[prev.length - 1]
      const cpu = Math.max(5, Math.min(100, Math.round(last.cpu + (r() - 0.5) * 22)))
      const memory = Math.max(20, Math.min(90, Math.round(last.memory + (r() - 0.5) * 6)))
      return [...prev.slice(1), { label: `${t}s`, cpu, memory }]
    })
  }, 900)
  return (
    <LineChart
      card
      data={rows}
      series={[
        { key: 'cpu', label: 'CPU' },
        { key: 'memory', label: 'Memory' },
      ]}
      yZero
      animate={false}
      curve="smooth"
      title="Server load"
      subtitle="Streaming, one point every 0.9s"
      format={(v) => `${v}%`}
      tooltipFormat={(v) => `${v}%`}
      height={240}
    />
  )
}
