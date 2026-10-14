import { useState } from 'react'
import { Badge } from './Badge'

const TONES = ['accent', 'success', 'warning', 'danger', 'neutral']
const row = { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }

export default {
  title: 'Badge',
  category: 'Data display',
  status: 'ready',
  description: 'Compact status labels, counts and removable tags. In Extra, accent badges shimmer across the rotating gradient and dots glow.',
  controls: {
    children: { type: 'text', default: 'New' },
    tone: { type: 'select', options: TONES, default: 'accent' },
    variant: { type: 'radio', options: ['soft', 'solid', 'outline'], default: 'solid' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    dot: { type: 'boolean', default: false },
    pulse: { type: 'boolean', default: false },
  },
}

export const Overview = () => (
  <div style={{ ...row, maxWidth: 190, justifyContent: 'center' }}>
    <Badge variant="solid">New</Badge>
    <Badge tone="success" dot pulse>
      Live
    </Badge>
    <Badge tone="warning">Beta</Badge>
    <Badge tone="danger" variant="solid" count={128} />
  </div>
)

export const Playground = (args) => <Badge {...args} />

export const Tones = () => (
  <div style={{ display: 'grid', gap: 12 }}>
    {['soft', 'solid', 'outline'].map((v) => (
      <div key={v} style={row}>
        {TONES.map((t) => (
          <Badge key={t} tone={t} variant={v}>
            {t}
          </Badge>
        ))}
      </div>
    ))}
  </div>
)

export const Status = () => (
  <div style={row}>
    <Badge tone="success" dot pulse>
      Operational
    </Badge>
    <Badge tone="warning" dot>
      Degraded
    </Badge>
    <Badge tone="danger" dot pulse variant="outline">
      Outage
    </Badge>
    <Badge tone="neutral" dot>
      Paused
    </Badge>
    <Badge icon="zap" variant="solid">
      Pro
    </Badge>
  </div>
)

export const Counts = () => (
  <div style={row}>
    <Badge variant="solid" count={3} />
    <Badge variant="solid" tone="danger" count={42} />
    <Badge variant="solid" tone="danger" count={1200} max={999} />
    <Badge variant="soft" tone="neutral" count={7} size="sm" />
  </div>
)

export const Removable = () => {
  const [tags, setTags] = useState(['react', 'design', 'css', 'tokens', 'motion'])
  return (
    <div style={row}>
      {tags.map((t) => (
        <Badge key={t} variant="outline" size="lg" onRemove={() => setTags((all) => all.filter((x) => x !== t))}>
          {t}
        </Badge>
      ))}
      {!tags.length && <span style={{ color: 'var(--ui-text-muted)' }}>All gone — press ↻ to reset</span>}
    </div>
  )
}
