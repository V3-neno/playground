import { useState } from 'react'
import { useInterval } from '../../../lib/hooks'
import { monthly, seeded, seriesFor, walk } from '../_shared/demo'
import { AreaChart } from './AreaChart'

export default {
  title: 'Area chart',
  category: 'Charts',
  status: 'ready',
  description:
    'Volume over time, from zero. Overlapping series fade to transparent; stacked series show part-to-whole with totals in the tooltip. Extra adds breathing neon fills and comets riding the ridgelines.',
  layout: 'padded',
  controls: {
    seriesCount: { type: 'range', label: 'series', min: 1, max: 6, default: 3 },
    stacked: { type: 'boolean', default: true },
    curve: { type: 'radio', options: ['smooth', 'linear', 'step'], default: 'smooth' },
    grid: { type: 'boolean', default: true },
    animate: { type: 'boolean', default: true },
    card: { type: 'boolean', default: true },
    height: { type: 'range', min: 140, max: 420, step: 10, default: 280 },
  },
}

export const Thumbnail = () => (
  <div style={{ width: 200, margin: '0 auto' }}>
    <AreaChart stacked data={monthly(3, { seed: 12 })} series={seriesFor(3)} height={110} axes={false} legend={false} />
  </div>
)

export const Playground = ({ seriesCount, ...args }) => (
  <AreaChart {...args} data={monthly(seriesCount, { seed: 12 })} series={seriesFor(seriesCount)} title="Traffic by channel" subtitle="Sessions, thousands" />
)

export const Overlapping = () => (
  <AreaChart card data={monthly(2, { seed: 5 })} series={seriesFor(2)} title="This year vs last" subtitle="Fading fills keep both shapes readable" height={260} />
)

export const SingleSeries = () => {
  const data = walk(40, { seed: 2, start: 30, step: 9, min: 4 }).map((v, i) => ({ label: `Day ${i + 1}`, downloads: v }))
  return <AreaChart card data={data} series={[{ key: 'downloads', label: 'Downloads' }]} curve="linear" title="Downloads" subtitle="Last 40 days" height={220} />
}

export const Live = () => {
  const [rows, setRows] = useState(() => monthly(3, { seed: 30 }))
  const [t, setT] = useState(1)
  useInterval(() => {
    const r = seeded(t + 100)
    setT((n) => n + 1)
    setRows((prev) => prev.map((d) => ({ ...d, web: Math.max(5, d.web + Math.round((r() - 0.5) * 14)), mobile: Math.max(5, d.mobile + Math.round((r() - 0.5) * 12)), api: Math.max(3, d.api + Math.round((r() - 0.5) * 10)) })))
  }, 1500)
  return <AreaChart card stacked data={rows} series={seriesFor(3)} title="Live mix" subtitle="Shapes morph between updates" height={260} />
}
