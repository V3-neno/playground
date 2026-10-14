import { Button } from '../../actions/Button/Button'
import { Spinner } from './Spinner'

const VARIANTS = ['ring', 'dots', 'bars', 'pulse', 'orbit']

export default {
  title: 'Spinner',
  category: 'Feedback',
  status: 'ready',
  description:
    'Loading indicator in five shapes. role="status" with a hidden `label`. tone="current" inherits the text colour, for use inside buttons.',
  controls: {
    variant: { type: 'radio', options: VARIANTS, default: 'ring' },
    size: { type: 'range', min: 12, max: 96, default: 44 },
    label: { type: 'text', default: 'Loading' },
  },
}

export const All = () => (
  <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
    {VARIANTS.map((v) => (
      <Spinner key={v} variant={v} size="md" />
    ))}
  </div>
)

export const Playground = (args) => <Spinner {...args} />

export const Sizes = () => (
  <div style={{ display: 'grid', gap: 18 }}>
    {VARIANTS.map((v) => (
      <div key={v} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <code style={{ width: 52, fontSize: 12, color: 'var(--ui-text-muted)' }}>{v}</code>
        <Spinner variant={v} size="sm" />
        <Spinner variant={v} size="md" />
        <Spinner variant={v} size="lg" />
        <Spinner variant={v} size={72} />
      </div>
    ))}
  </div>
)

export const InContext = () => (
  <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
    <Button disabled>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Spinner size="sm" tone="current" label="Saving" /> Saving…
      </span>
    </Button>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ui-text-muted)' }}>
      <Spinner variant="dots" size={24} /> Fetching your projects
    </div>
  </div>
)
