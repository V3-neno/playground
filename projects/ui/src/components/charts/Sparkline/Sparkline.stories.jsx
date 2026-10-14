import { useState } from 'react'
import { useInterval } from '../../../lib/hooks'
import { DAYS, seeded, walk } from '../_shared/demo'
import { Sparkline, SparkStat } from './Sparkline'

export default {
  title: 'Sparkline',
  category: 'Charts',
  status: 'ready',
  description:
    'Word-sized trends for tables, KPI tiles and inline text. Line, area or bar; hover for the value. SparkStat pairs one with a big number and a change badge (icon + sign, never colour alone). Extra adds a heartbeat ping on the latest point.',
  controls: {
    type: { type: 'radio', options: ['line', 'area', 'bar'], default: 'area' },
    curve: { type: 'radio', options: ['smooth', 'linear', 'step'], default: 'smooth' },
    points: { type: 'range', min: 5, max: 60, default: 24 },
    width: { type: 'range', min: 60, max: 400, step: 10, default: 220 },
    height: { type: 'range', min: 16, max: 100, step: 2, default: 48 },
    color: { type: 'range', label: 'palette slot', min: 0, max: 5, default: 0 },
    showLast: { type: 'boolean', label: 'last dot', default: true },
    showMinMax: { type: 'boolean', label: 'min / max', default: false },
    animate: { type: 'boolean', default: true },
  },
}

export const Thumbnail = () => (
  <div style={{ display: 'grid', gap: 10 }}>
    <Sparkline values={walk(24, { seed: 3 })} type="area" width={170} height={36} />
    <Sparkline values={walk(18, { seed: 8, start: 30 })} type="bar" width={170} height={28} color={2} />
  </div>
)

export const Playground = ({ points, ...args }) => <Sparkline {...args} values={walk(points, { seed: 5, start: 40 })} />

export const KpiTiles = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
    <SparkStat label="Revenue" value="€48.2k" change={12.4} values={walk(20, { seed: 1, start: 30, step: 6 })} />
    <SparkStat label="Active users" value="9,431" change={3.1} values={walk(20, { seed: 4, start: 60 })} color={1} type="line" />
    <SparkStat label="Churn" value="2.4%" change={-0.6} goodWhen="down" values={walk(20, { seed: 6, start: 20, step: 4 })} color={2} />
    <SparkStat label="Tickets" value="128" change={18} goodWhen="down" values={walk(14, { seed: 10, start: 12, step: 6 })} color={3} type="bar" />
  </div>
)
KpiTiles.layout = 'padded'

const ROWS = [
  { name: 'Northwind', seed: 2, price: 182.4, change: 2.3 },
  { name: 'Globex', seed: 5, price: 64.1, change: -1.2 },
  { name: 'Initech', seed: 9, price: 23.7, change: 0.4 },
  { name: 'Umbrella', seed: 13, price: 311.9, change: -3.8 },
]

export const InTable = () => (
  <table style={{ borderCollapse: 'collapse', fontSize: '0.92em', minWidth: 420 }}>
    <thead>
      <tr style={{ textAlign: 'left', color: 'var(--ui-text-muted)' }}>
        <th style={{ padding: '6px 12px', fontWeight: 500 }}>Ticker</th>
        <th style={{ padding: '6px 12px', fontWeight: 500 }}>30 days</th>
        <th style={{ padding: '6px 12px', fontWeight: 500, textAlign: 'right' }}>Price</th>
        <th style={{ padding: '6px 12px', fontWeight: 500, textAlign: 'right' }}>Day</th>
      </tr>
    </thead>
    <tbody>
      {ROWS.map((r) => (
        <tr key={r.name} style={{ borderTop: '1px solid var(--ui-border)' }}>
          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{r.name}</td>
          <td style={{ padding: '8px 12px' }}>
            <Sparkline values={walk(30, { seed: r.seed, start: 50 })} width={110} height={24} color={r.change >= 0 ? 2 : 4} curve="linear" />
          </td>
          <td style={{ padding: '8px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.price.toFixed(2)}</td>
          <td style={{ padding: '8px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {r.change >= 0 ? '▲' : '▼'} {Math.abs(r.change)}%
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

export const Inline = () => (
  <p style={{ maxWidth: 520, margin: 0, lineHeight: 2 }}>
    Signups climbed all week <Sparkline values={[12, 14, 13, 19, 22, 27, 31]} labels={DAYS} width={70} height={18} color={2} /> while refunds stayed flat{' '}
    <Sparkline values={[4, 5, 4, 4, 5, 4, 4]} labels={DAYS} width={70} height={18} color={4} type="bar" />.
  </p>
)

export const Live = () => {
  const [values, setValues] = useState(() => walk(40, { seed: 17, start: 50, step: 10 }))
  const [t, setT] = useState(1)
  useInterval(() => {
    const r = seeded(t + 300)
    setT((n) => n + 1)
    setValues((v) => [...v.slice(1), Math.max(0, Math.round(v[v.length - 1] + (r() - 0.5) * 14))])
  }, 700)
  return (
    <div style={{ width: 260 }}>
      <SparkStat label="Requests / s" value={values[values.length - 1]} change={Math.round(((values.at(-1) - values[0]) / Math.max(1, values[0])) * 100)} values={values} type="line" color={1} />
    </div>
  )
}
