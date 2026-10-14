import { Tabs } from './Tabs'

const BASIC = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'settings', label: 'Settings' },
]

const Panel = ({ title, children }) => (
  <div style={{ maxWidth: 520 }}>
    <strong className="ui-heading" style={{ display: 'block', marginBottom: 6, fontSize: '1.1em' }}>{title}</strong>
    <p style={{ margin: 0, color: 'var(--ui-text-muted)' }}>{children}</p>
  </div>
)

const WITH_CONTENT = [
  { id: 'overview', label: 'Overview', icon: 'home', content: <Panel title="Overview">Everything at a glance: traffic, revenue and what changed this week.</Panel> },
  { id: 'activity', label: 'Activity', icon: 'zap', badge: 12, content: <Panel title="Activity">Twelve new events since you last looked. Most of them are good news.</Panel> },
  { id: 'team', label: 'Team', icon: 'users', content: <Panel title="Team">Six people, three time zones, one shared calendar.</Panel> },
  { id: 'billing', label: 'Billing', icon: 'credit-card', disabled: true, content: null },
  { id: 'settings', label: 'Settings', icon: 'settings', content: <Panel title="Settings">Notifications, integrations and the danger zone.</Panel> },
]

export default {
  title: 'Tabs',
  category: 'Navigation',
  status: 'ready',
  description:
    'Accessible tablist with a sliding indicator. Arrow keys / Home / End move between tabs. In Extra the indicator is a neon blob that springs, stretches and squishes, and selecting a tab throws sparkles.',
  layout: 'padded',
  controls: {
    variant: { type: 'radio', options: ['underline', 'pills', 'segmented'], default: 'underline' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    fitted: { type: 'boolean', default: false },
  },
}

export const Segmented = () => <Tabs variant="segmented" items={BASIC} />
Segmented.layout = 'centered'

export const Playground = (args) => <Tabs {...args} items={WITH_CONTENT} />

export const Variants = () => (
  <div style={{ display: 'grid', gap: 28 }}>
    <Tabs variant="underline" items={BASIC} />
    <Tabs variant="pills" items={BASIC} />
    <Tabs variant="segmented" items={BASIC} />
  </div>
)

export const WithIconsAndBadges = () => (
  <Tabs
    variant="pills"
    items={[
      { id: 'inbox', label: 'Inbox', icon: 'inbox', badge: 4 },
      { id: 'sent', label: 'Sent', icon: 'mail' },
      { id: 'starred', label: 'Starred', icon: 'star', badge: 1 },
      { id: 'trash', label: 'Trash', icon: 'trash' },
    ]}
  />
)

export const Fitted = () => (
  <div style={{ maxWidth: 480 }}>
    <Tabs variant="segmented" fitted items={[{ id: 'm', label: 'Monthly' }, { id: 'y', label: 'Yearly' }, { id: 'l', label: 'Lifetime' }]} />
  </div>
)

export const ManyTabsScroll = () => (
  <div style={{ maxWidth: 360 }}>
    <Tabs
      items={['General', 'Profile', 'Security', 'Notifications', 'Billing', 'Integrations', 'Advanced'].map((label) => ({ id: label, label }))}
    />
  </div>
)
