import { DAYS, MONTHS, seeded } from '../_shared/demo'
import { Heatmap } from './Heatmap'

const HOURS = Array.from({ length: 24 }, (_, h) => (h % 3 === 0 ? `${String(h).padStart(2, '0')}` : ''))

/** Busy on weekday working hours, quieter at night and weekends. */
function weekly(seed = 1) {
  const r = seeded(seed)
  return DAYS.map((_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      const work = h >= 8 && h <= 18 ? 1 : h >= 6 && h <= 22 ? 0.45 : 0.08
      const weekend = d >= 5 ? 0.45 : 1
      const lunch = h === 12 ? 0.7 : 1
      return Math.round(work * weekend * lunch * 100 * (0.6 + r() * 0.6))
    }),
  )
}

/** GitHub-style: 7 rows (days) x N weeks, some empty days. */
function contributions(weeks = 30, seed = 4) {
  const r = seeded(seed)
  return DAYS.map((_, d) =>
    Array.from({ length: weeks }, (_, w) => {
      const x = r()
      if (x < 0.22) return 0
      const streak = Math.sin(w / 3.2) * 0.5 + 0.5
      return Math.round((d < 5 ? 1 : 0.4) * (1 + streak * 9) * x)
    }),
  )
}

export default {
  title: 'Heatmap',
  category: 'Charts',
  status: 'ready',
  description:
    'Magnitude across two dimensions. Sequential uses one hue light→dark; diverging (data around zero) uses two hues with a neutral middle. Hover highlights the row and column; levels quantise like a contribution calendar. Extra makes the grid breathe in a diagonal wave and the hottest cells glow.',
  layout: 'padded',
  controls: {
    levels: { type: 'range', label: 'levels (0 = smooth)', min: 0, max: 8, default: 5 },
    maxCell: { type: 'range', label: 'max cell', min: 10, max: 48, default: 30 },
    showValues: { type: 'boolean', label: 'values', default: false },
    legend: { type: 'boolean', default: true },
    animate: { type: 'boolean', default: true },
    card: { type: 'boolean', default: true },
  },
}

export const Thumbnail = () => (
  <div style={{ width: 200, margin: '0 auto' }}>
    <Heatmap rows={DAYS.map(() => '')} columns={Array.from({ length: 16 }, () => '')} values={contributions(16, 9)} maxCell={10} legend={false} />
  </div>
)

export const Playground = (args) => (
  <Heatmap {...args} rows={DAYS} columns={HOURS} columnTitles={HOURS.map((_, h) => `${h}:00`)} values={weekly(3)} unit=" visits" title="When visitors arrive" subtitle="Average visits per hour, last 8 weeks" />
)

export const Contributions = () => (
  <Heatmap
    card
    rows={DAYS.map((d, i) => (i % 2 === 0 ? d : ''))}
    rowTitles={DAYS}
    columnTitles={Array.from({ length: 30 }, (_, w) => `Week ${w + 1}`)}
    columns={Array.from({ length: 30 }, (_, w) => {
      // Label a week only when it starts a new month.
      const month = (wk) => Math.floor((wk * 7) / 30.44)
      return w === 0 || month(w) !== month(w - 1) ? MONTHS[month(w) % 12] : ''
    })}
    colLabelEvery={1}
    values={contributions(30)}
    levels={4}
    maxCell={16}
    unit=" commits"
    title="1,204 contributions"
    subtitle="Last 30 weeks"
  />
)

const TEAMS = ['Platform', 'Payments', 'Growth', 'Mobile', 'Data']
export const Diverging = () => {
  const r = seeded(21)
  const values = TEAMS.map(() => MONTHS.slice(0, 8).map(() => Math.round((r() - 0.45) * 40)))
  return (
    <Heatmap
      card
      diverging
      showValues
      levels={0}
      rows={TEAMS}
      columns={MONTHS.slice(0, 8)}
      values={values}
      maxCell={44}
      format={(v) => (v > 0 ? `+${v}` : `${v}`)}
      unit="%"
      title="Budget variance"
      subtitle="Percent over (+) or under (−) plan; neutral = on plan"
    />
  )
}

export const WithGaps = () => {
  const v = weekly(8).slice(0, 5).map((row, i) => row.map((x, h) => ((h + i) % 7 === 0 ? null : x)))
  return <Heatmap card rows={DAYS.slice(0, 5)} columns={HOURS} columnTitles={HOURS.map((_, h) => `${h}:00`)} values={v} levels={0} title="Sensor coverage" subtitle="Empty cells = no reading" />
}
