import { PHOTOS } from '../../../lib/placeholder'
import { Button } from '../../actions/Button/Button'
import { Card } from './Card'

export default {
  title: 'Card',
  category: 'Data display',
  status: 'ready',
  description:
    'Grouped content on a raised surface: optional media, eyebrow, title, body and footer. Interactive cards are buttons or links; in Extra they tilt in 3D with a holographic sheen that follows the cursor.',
  controls: {
    title: { type: 'text', default: 'Northern lights tour' },
    subtitle: { type: 'text', default: '3 nights · Tromsø' },
    eyebrow: { type: 'text', default: 'Featured' },
    variant: { type: 'radio', options: ['elevated', 'outline', 'filled'], default: 'elevated' },
    media: { type: 'boolean', default: true },
    interactive: { type: 'boolean', default: true },
    horizontal: { type: 'boolean', default: false },
  },
}

export const Compact = () => (
  <Card style={{ width: 200 }} eyebrow="Featured" title="Night Lake" subtitle="3 nights · from $640" interactive />
)

export const Playground = ({ media, ...args }) => (
  <div style={{ width: args.horizontal ? 560 : 300, maxWidth: '100%' }}>
    <Card
      {...args}
      media={media ? PHOTOS[2].src : undefined}
      footer={
        <>
          <strong>$640</strong>
          <span style={{ color: 'var(--ui-text-muted)', fontSize: '0.875em' }}>per person</span>
        </>
      }
    >
      Chase the aurora across frozen fjords with a local guide.
    </Card>
  </div>
)

export const Variants = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, width: '100%' }}>
    {['elevated', 'outline', 'filled'].map((v) => (
      <Card key={v} variant={v} title={v[0].toUpperCase() + v.slice(1)} subtitle="Card variant">
        Content sits on the {v} surface.
      </Card>
    ))}
  </div>
)
Variants.layout = 'padded'

export const InteractiveGrid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, width: '100%' }}>
    {PHOTOS.slice(0, 6).map((p, i) => (
      <Card key={p.title} interactive media={p.src} eyebrow={`Trip ${i + 1}`} title={p.title} subtitle={`${3 + i} nights`} />
    ))}
  </div>
)
InteractiveGrid.layout = 'padded'
InteractiveGrid.storyName = 'Interactive grid'

export const Horizontal = () => (
  <div style={{ width: 620, maxWidth: '100%' }}>
    <Card
      horizontal
      media={PHOTOS[4].src}
      eyebrow="New"
      title="Lagoon weekend"
      subtitle="Spa, sea and silence"
      footer={
        <>
          <Button size="sm">Book now</Button>
          <Button size="sm" variant="ghost">
            Details
          </Button>
        </>
      }
    >
      Two nights at a cliffside retreat with geothermal pools and a tasting menu.
    </Card>
  </div>
)
