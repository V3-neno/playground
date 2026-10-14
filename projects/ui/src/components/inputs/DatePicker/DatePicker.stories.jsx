import { useState } from 'react'
import { Calendar, DatePicker } from './DatePicker'
import { addDays, startOfDay } from './calendar'

const today = startOfDay(new Date())

export default {
  title: 'Date picker',
  category: 'Inputs',
  status: 'ready',
  description: 'Field that opens a month calendar (an ARIA grid). Arrows move by day/week, PageUp/PageDown by month (Shift for year), Home/End within the week, Enter picks, Escape closes. Supports min/max and the first day of the week. In Extra, picking a date turns it into a glowing gem and sets off confetti.',
  controls: {
    label: { type: 'text', default: 'Check-in' },
    placeholder: { type: 'text', default: 'Pick a date' },
    weekStartsOn: { type: 'radio', options: ['1', '0'], default: '1', label: 'weekStartsOn (1 = Mon)' },
    locale: { type: 'select', options: ['en', 'sv', 'de', 'fr', 'ja'], default: 'en' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    disabled: { type: 'boolean', default: false },
  },
}

export const Playground = (args) => (
  <div style={{ width: 260 }}>
    <DatePicker {...args} weekStartsOn={Number(args.weekStartsOn)} defaultValue={addDays(today, 3)} />
  </div>
)
Playground.height = 440
Playground.layout = 'padded'

export const Open = () => (
  <div style={{ width: 260 }}>
    <DatePicker label="Departure" defaultValue={addDays(today, 5)} defaultOpen min={today} hint="Past dates are disabled" />
  </div>
)
Open.height = 470
Open.layout = 'padded'

export const InlineCalendar = () => {
  const [d, setD] = useState(today)
  return (
    <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
      <Calendar value={d} onChange={setD} max={addDays(today, 60)} />
      <small style={{ color: 'var(--ui-text-muted)' }}>Selected: {d.toDateString()}</small>
    </div>
  )
}

export const States = () => (
  <div style={{ display: 'grid', gap: 16, width: 260 }}>
    <DatePicker label="Birthday" error="Please enter your birthday" />
    <DatePicker label="Disabled" defaultValue={today} disabled />
  </div>
)
