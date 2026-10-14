import { Breadcrumbs } from './Breadcrumbs'

// Stories stop links from navigating, so clicking doesn't leave the workshop.
const stay = (_item, e) => e.preventDefault()

const PATH = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Projects', href: '/projects' },
  { label: 'Website redesign', href: '/projects/website' },
  { label: 'Design', href: '/projects/website/design' },
  { label: 'Homepage hero' },
]

export default {
  title: 'Breadcrumbs',
  category: 'Navigation',
  status: 'ready',
  description:
    'A nav landmark with an ordered list; the last crumb is aria-current="page". Long trails collapse into a "…" button. Extra adds gradient text, a sweeping underline and spinning ✦ separators.',
  controls: {
    separator: { type: 'radio', options: ['chevron', 'slash', 'dot', 'arrow'], default: 'chevron' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    maxItems: { type: 'range', min: 0, max: 6, default: 0, label: 'maxItems (0 = all)' },
  },
}

export const Simple = () => <Breadcrumbs onNavigate={stay} items={[{ label: 'Home', icon: 'home' }, { label: 'Docs' }, { label: 'Tabs' }]} />

export const Playground = (args) => <Breadcrumbs {...args} items={PATH} onNavigate={stay} />

export const Separators = () => (
  <div style={{ display: 'grid', gap: 14 }}>
    {['chevron', 'slash', 'dot', 'arrow'].map((s) => (
      <Breadcrumbs key={s} separator={s} items={PATH.slice(0, 4)} onNavigate={stay} />
    ))}
  </div>
)

export const Collapsed = () => <Breadcrumbs maxItems={3} items={PATH} onNavigate={stay} />

export const LongLabels = () => (
  <div style={{ maxWidth: 340 }}>
    <Breadcrumbs
      onNavigate={stay}
      items={[
        { label: 'Home', icon: 'home' },
        { label: 'An extraordinarily long category name' },
        { label: 'Another quite long subsection title' },
        { label: 'The current page with a long title' },
      ]}
    />
  </div>
)
