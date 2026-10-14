import { Stat, StatGroup } from './Stat'

const TREND_UP = [12, 14, 13, 17, 16, 19, 22, 21, 25, 28, 27, 31]
const TREND_DOWN = [30, 28, 29, 25, 26, 22, 21, 23, 19, 17, 18, 15]

export default {
  title: 'Stat',
  category: 'Data display',
  status: 'ready',
  description:
    'KPI tile: label, a value that counts up when it scrolls into view, change vs. last period and an optional sparkline. In Extra the number is gradient-lit and sparkles when it lands.',
  controls: {
    label: { type: 'text', default: 'Monthly revenue' },
    value: { type: 'number', default: 48250 },
    prefix: { type: 'text', default: '$' },
    suffix: { type: 'text', default: '' },
    decimals: { type: 'number', min: 0, max: 3, default: 0 },
    delta: { type: 'number', default: 12.4 },
    invertDelta: { type: 'boolean', default: false, label: 'lower is better' },
    icon: { type: 'select', options: ['', 'credit-card', 'users', 'bar-chart', 'zap', 'eye'], default: 'credit-card' },
    trend: { type: 'boolean', default: true },
    variant: { type: 'radio', options: ['card', 'plain'], default: 'card' },
  },
}

export const Overview = () => (
  <Stat style={{ width: 190 }} label="Revenue" value={48250} prefix="$" delta={12.4} deltaLabel="" />
)

export const Playground = ({ trend, icon, ...args }) => (
  <div style={{ width: 280 }}>
    <Stat {...args} icon={icon || undefined} trend={trend ? (args.delta >= 0 !== args.invertDelta ? TREND_UP : TREND_DOWN) : undefined} />
  </div>
)

export const Dashboard = () => (
  <StatGroup>
    <Stat label="Revenue" value={48250} prefix="$" delta={12.4} icon="credit-card" trend={TREND_UP} />
    <Stat label="Active users" value={18420} compact delta={4.1} icon="users" trend={TREND_UP.map((v, i) => v + (i % 3) * 2)} />
    <Stat label="Conversion" value={3.84} decimals={2} suffix="%" delta={-0.6} icon="bar-chart" trend={TREND_DOWN} />
    <Stat label="Churn" value={1.9} decimals={1} suffix="%" delta={-0.3} invertDelta icon="zap" trend={TREND_DOWN} deltaLabel="lower is better" />
  </StatGroup>
)
Dashboard.layout = 'padded'

export const Plain = () => (
  <StatGroup style={{ maxWidth: 640 }}>
    <Stat variant="plain" label="Downloads" value={1200000} compact delta={8} />
    <Stat variant="plain" label="Stars" value={24890} delta={2.2} />
    <Stat variant="plain" label="Open issues" value={312} delta={0} deltaLabel="no change" />
  </StatGroup>
)
Plain.layout = 'padded'
