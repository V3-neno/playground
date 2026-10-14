import { Button } from '../../actions/Button/Button'
import { Alert } from './Alert'

export default {
  title: 'Alert',
  category: 'Feedback',
  status: 'ready',
  layout: 'padded',
  description:
    'Inline banner for status messages. Four tones, three variants, optional title, actions and dismiss. Warnings and errors use role="alert"; others role="status".',
  controls: {
    title: { type: 'text', default: 'Update available' },
    children: { type: 'textarea', default: 'Version 2.4 adds dark mode and faster exports.' },
    tone: { type: 'radio', options: ['info', 'success', 'warning', 'danger'], default: 'info' },
    variant: { type: 'radio', options: ['soft', 'outline', 'solid'], default: 'soft' },
    dismissible: { type: 'boolean', default: true },
  },
}

export const Tones = () => (
  <div style={{ display: 'grid', gap: 8, maxWidth: 520, margin: '0 auto' }}>
    <Alert tone="info" title="Heads up">A new version is ready.</Alert>
    <Alert tone="success" title="Saved">Your changes are live.</Alert>
    <Alert tone="danger" title="Payment failed" />
  </div>
)

export const Playground = (args) => (
  <div style={{ maxWidth: 560, margin: '0 auto' }}>
    <Alert {...args} />
  </div>
)

export const Variants = () => (
  <div style={{ display: 'grid', gap: 10, maxWidth: 560, margin: '0 auto' }}>
    {['soft', 'outline', 'solid'].map((v) => (
      <Alert key={v} variant={v} tone="warning" title={`${v[0].toUpperCase()}${v.slice(1)} warning`}>
        Your trial ends in 3 days.
      </Alert>
    ))}
    <Alert variant="solid" tone="info" title="Solid info" dismissible>
      Dismissible, with the accent colour.
    </Alert>
  </div>
)

export const WithActions = () => (
  <div style={{ display: 'grid', gap: 10, maxWidth: 560, margin: '0 auto' }}>
    <Alert
      tone="danger"
      title="We couldn't sync 3 files"
      dismissible
      action={
        <>
          <Button size="sm" variant="danger">
            Retry
          </Button>
          <Button size="sm" variant="ghost">
            View details
          </Button>
        </>
      }
    >
      The server timed out. Your local copies are safe.
    </Alert>
    <Alert tone="success" icon="sparkles" title="Welcome aboard!" dismissible action={<Button size="sm">Take the tour</Button>}>
      Your workspace is ready.
    </Alert>
  </div>
)

export const Dismissible = () => (
  <div style={{ display: 'grid', gap: 10, maxWidth: 560, margin: '0 auto' }}>
    <Alert tone="info" dismissible>
      Click the × to dismiss me. Use ↻ to bring me back.
    </Alert>
    <Alert tone="success" variant="outline" dismissible title="Me too" />
  </div>
)
