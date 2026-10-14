import { useState } from 'react'
import { useInterval } from '../../../lib/hooks'
import { monthly, seeded, seriesFor } from '../_shared/demo'
import { BarChart } from './BarChart'

export default {
  title: 'Bar chart',
  category: 'Charts',
  status: 'ready',
  description:
    'Hand-drawn SVG bars: grouped, stacked, horizontal, negative values. Hover a category for its tooltip, click legend items to toggle series. Mono hatches, Brutalist inks, Playful pills, Extra glows, shimmers and throws sparkles (click for confetti).',
  layout: 'padded',
  controls: {
    seriesCount: { type: 'range', label: 'series', min: 1, max: 6, default: 3 },
    months: { type: 'range', min: 3, max: 12, default: 8 },
    stacked: { type: 'boolean', default: false },
    horizontal: { type: 'boolean', default: false },
    grid: { type: 'boolean', default: true },
    showValues: { type: 'boolean', label: 'values', default: false },
    animate: { type: 'boolean', default: true },
    card: { type: 'boolean', default: true },
    height: { type: 'range', min: 140, max: 420, step: 10, default: 280 },
  },
}

export const Thumbnail = () => (
  <div style={{ width: 200, margin: '0 auto' }}>
    <BarChart data={monthly(2, { months: 7 })} series={seriesFor(2)} height={110} axes={false} legend={false} />
  </div>
)

export const Playground = ({ seriesCount, months, ...args }) => (
  <BarChart
    {...args}
    data={monthly(seriesCount, { months })}
    series={seriesFor(seriesCount)}
    title="Revenue by channel"
    subtitle="Thousands of EUR, 2026"
  />
)

export const Stacked = () => (
  <BarChart card stacked data={monthly(4)} series={seriesFor(4)} title="Signups by source" subtitle="Stacked, with totals in the tooltip" height={300} />
)

const LANGS = [
  { label: 'TypeScript', share: 38.5 },
  { label: 'Python', share: 31.2 },
  { label: 'Rust', share: 12.8 },
  { label: 'Go', share: 9.4 },
  { label: 'Kotlin', share: 5.1 },
  { label: 'Elixir', share: 3 },
]

export const Horizontal = () => (
  <BarChart
    card
    horizontal
    showValues
    data={LANGS}
    series={[{ key: 'share', label: 'Share' }]}
    format={(v) => `${v}%`}
    tooltipFormat={(v) => `${v}%`}
    title="Most loved languages"
    height={250}
  />
)

const PROFIT = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'].map((label, i) => ({ label, profit: [12, 18, -6, -14, 4, 22, 30, -3][i] }))

export const Negative = () => (
  <BarChart card showValues data={PROFIT} series={[{ key: 'profit', label: 'Profit' }]} title="Quarterly profit" subtitle="Bars grow down from zero" height={260} />
)

export const Live = () => {
  const [rows, setRows] = useState(() => monthly(2, { months: 10, seed: 11 }))
  const [tick, setTick] = useState(1)
  useInterval(() => {
    const r = seeded(tick + 40)
    setTick((t) => t + 1)
    setRows((prev) => prev.map((d) => ({ ...d, web: Math.max(4, Math.round(d.web + (r() - 0.5) * 18)), mobile: Math.max(4, Math.round(d.mobile + (r() - 0.5) * 18)) })))
  }, 1600)
  return <BarChart card data={rows} series={seriesFor(2)} title="Live traffic" subtitle="Updates every 1.6s, bars morph between values" height={260} />
}
