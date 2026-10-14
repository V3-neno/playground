import { Timeline } from './Timeline'

const ORDER = [
  { id: 1, title: 'Order placed', time: 'Oct 10, 09:14', icon: 'check', tone: 'success', description: 'We received your order #4821.' },
  { id: 2, title: 'Payment confirmed', time: 'Oct 10, 09:15', icon: 'credit-card', tone: 'success' },
  { id: 3, title: 'Shipped', time: 'Oct 11, 16:02', icon: 'rocket', tone: 'accent', current: true, description: 'Out for delivery with PostNord.' },
  { id: 4, title: 'Delivered', time: 'Expected Oct 14', tone: 'muted' },
]

const HISTORY = [
  { id: 'a', time: '2019', title: 'Founded', description: 'Two people, one kitchen table.', icon: 'sparkles', tone: 'accent' },
  { id: 'b', time: '2020', title: 'First customer', description: 'A bakery in Malmö.' },
  { id: 'c', time: '2022', title: 'Series A', description: 'Team grows to 40.', icon: 'trending-up', tone: 'success' },
  { id: 'd', time: '2023', title: 'Outage', description: 'Six hours we would rather forget.', icon: 'alert', tone: 'danger' },
  { id: 'e', time: '2025', title: 'Going global', description: 'Offices in three countries.', icon: 'globe', tone: 'accent', current: true },
]

export default {
  title: 'Timeline',
  category: 'Data display',
  status: 'ready',
  description:
    'Ordered events with toned markers, a current step, alternate (zig-zag) and horizontal layouts that collapse on narrow containers. Items reveal as they scroll in. In Extra the spine is a flowing gradient and the current step pulses.',
  controls: {
    orientation: { type: 'radio', options: ['vertical', 'horizontal'], default: 'vertical' },
    alternate: { type: 'boolean', default: false },
    reveal: { type: 'boolean', default: true },
  },
}

export const Overview = () => (
  <div style={{ width: 190 }}>
    <Timeline reveal={false} items={ORDER.slice(0, 3).map(({ description, time, ...i }) => i)} style={{ '--_m': '20px', fontSize: 13 }} />
  </div>
)

export const Playground = (args) => (
  <div style={{ width: args.orientation === 'horizontal' ? 720 : 560, maxWidth: '100%' }}>
    <Timeline {...args} items={HISTORY} />
  </div>
)

export const OrderTracking = () => (
  <div style={{ width: 380, maxWidth: '100%' }}>
    <Timeline items={ORDER} />
  </div>
)
OrderTracking.storyName = 'Order tracking'

export const Alternate = () => (
  <div style={{ width: 720, maxWidth: '100%' }}>
    <Timeline alternate items={HISTORY} />
  </div>
)

export const Horizontal = () => (
  <div style={{ width: 760, maxWidth: '100%' }}>
    <Timeline orientation="horizontal" items={ORDER} />
  </div>
)
