import { ICON_NAMES } from '../../../lib/icons'
import { Button } from '../../actions/Button/Button'
import { EmptyState } from './EmptyState'

export default {
  title: 'Empty state',
  category: 'Feedback',
  status: 'ready',
  description:
    'What to show when there is nothing to show: icon art, title, a short explanation and the action that fixes it. Plain or card variant; accent, danger or success tone.',
  controls: {
    icon: { type: 'select', options: ICON_NAMES, default: 'folder' },
    title: { type: 'text', default: 'No projects yet' },
    description: { type: 'textarea', default: 'Projects keep your files, people and deadlines in one place. Create your first one to get going.' },
    tone: { type: 'radio', options: ['accent', 'success', 'danger'], default: 'accent' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    variant: { type: 'radio', options: ['plain', 'card'], default: 'card' },
  },
}

export const Compact = () => <EmptyState size="sm" icon="inbox" title="Inbox zero" description="You're all caught up." />

export const Playground = (args) => (
  <EmptyState {...args}>
    <Button icon="plus">New project</Button>
    <Button variant="ghost">Import</Button>
  </EmptyState>
)

export const NoResults = () => (
  <EmptyState variant="card" icon="search" title="No results for “quarterly”" description="Check the spelling, or try a broader term like “report”.">
    <Button variant="outline">Clear search</Button>
  </EmptyState>
)

export const ErrorState = () => (
  <EmptyState variant="card" tone="danger" icon="alert" title="Something went wrong" description="We couldn't load your dashboard. It's us, not you.">
    <Button icon="refresh">Try again</Button>
    <Button variant="ghost">Status page</Button>
  </EmptyState>
)
ErrorState.storyName = 'Error'

export const Success = () => (
  <EmptyState size="lg" tone="success" icon="check-circle" title="All tasks done" description="Nothing left on your plate today. Go outside!" />
)

export const InAList = () => (
  <div
    style={{
      width: 'min(420px, 100%)',
      border: 'var(--ui-border-width) solid var(--ui-raised-border)',
      borderRadius: 'var(--ui-radius-lg)',
      background: 'var(--ui-raised)',
      boxShadow: 'var(--ui-shadow-sm)',
    }}
  >
    <div style={{ padding: '12px 16px', borderBottom: 'var(--ui-border-width) solid var(--ui-border)', fontWeight: 'var(--ui-weight-strong)' }}>
      Notifications
    </div>
    <EmptyState size="sm" icon="bell" title="No notifications" description="We'll let you know when something happens." />
  </div>
)
