import { useState } from 'react'
import { NumberCounter } from './NumberCounter'

export default {
  title: 'Number counter',
  category: 'Motion',
  status: 'ready',
  description:
    'Counts up when scrolled into view and tweens again whenever the value changes. Choose a tweened number or an odometer of rolling digit columns, formatted with Intl.NumberFormat (currency, compact, percent…). Screen readers only hear the final value. In Extra the digits spin like a slot machine in neon and finish with confetti.',
  controls: {
    value: { type: 'number', default: 12480 },
    variant: { type: 'radio', options: ['count', 'odometer'], default: 'count' },
    duration: { type: 'range', min: 200, max: 4000, step: 100, default: 1600 },
    decimals: { type: 'range', min: 0, max: 3, default: 0 },
    easing: { type: 'radio', options: ['out', 'inOut', 'linear', 'spring'], default: 'out' },
    prefix: { type: 'text', default: '' },
    suffix: { type: 'text', default: '+' },
  },
}

const Stat = ({ label, children }) => (
  <div className="ui-counter-stat">
    <span className="ui-counter-stat__value">{children}</span>
    <span className="ui-counter-stat__label">{label}</span>
  </div>
)

const COMPACT = { notation: 'compact' }
const EUR = { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }

export const Stats = () => (
  <div style={{ display: 'flex', gap: 'clamp(16px, 5cqi, 48px)', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
    <Stat label="Active users">
      <NumberCounter value={12480} suffix="+" />
    </Stat>
    <Stat label="Revenue">
      <NumberCounter value={1200000} format={EUR} />
    </Stat>
    <Stat label="Uptime">
      <NumberCounter value={99.98} decimals={2} suffix="%" />
    </Stat>
  </div>
)
Stats.storyName = 'Stats (press ↻ to replay)'

export const Playground = (args) => (
  <Stat label="Playground">
    <NumberCounter {...args} value={Number(args.value) || 0} />
  </Stat>
)

export const Odometer = () => (
  <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
    <Stat label="Downloads">
      <NumberCounter value={8675309} variant="odometer" duration={2200} />
    </Stat>
    <Stat label="Raised">
      <NumberCounter value={42195} variant="odometer" format={EUR} duration={2200} />
    </Stat>
  </div>
)

export const Live = () => {
  const [v, setV] = useState(1500)
  const [mode, setMode] = useState('count')
  const btn = { font: 'inherit', padding: '6px 12px', cursor: 'pointer' }
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center', textAlign: 'center' }}>
      <Stat label="Live value: tweens from the current number">
        <NumberCounter value={v} variant={mode} duration={900} />
      </Stat>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" style={btn} onClick={() => setV((x) => x + Math.round(Math.random() * 900 + 100))}>+ random</button>
        <button type="button" style={btn} onClick={() => setV((x) => Math.max(0, x - Math.round(Math.random() * 900 + 100)))}>− random</button>
        <button type="button" style={btn} onClick={() => setMode((m) => (m === 'count' ? 'odometer' : 'count'))}>Switch to {mode === 'count' ? 'odometer' : 'count'}</button>
      </div>
    </div>
  )
}
Live.storyName = 'Changing values'

export const Compact = () => (
  <Stat label="Compact notation">
    <NumberCounter value={3400000} format={COMPACT} decimals={1} duration={2000} />
  </Stat>
)
