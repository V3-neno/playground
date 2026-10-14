import { Button } from '../../actions/Button/Button'
import { Navbar } from './Navbar'

const LINKS = [
  { id: 'product', label: 'Product' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'changelog', label: 'Changelog', badge: 'New' },
  { id: 'docs', label: 'Docs' },
]

const ACTIONS = (
  <>
    <Button variant="ghost" size="sm">
      Sign in
    </Button>
    <Button size="sm">Get started</Button>
  </>
)

// A fake page under the bar, so the bar has something to sit on.
const Page = () => (
  <div style={{ padding: '36px 24px', display: 'grid', gap: 12, maxWidth: 640 }}>
    <div className="ui-heading" style={{ fontSize: '1.8em' }}>
      Ship faster with less
    </div>
    <div style={{ height: 10, width: '80%', borderRadius: 6, background: 'var(--ui-surface-2)' }} />
    <div style={{ height: 10, width: '60%', borderRadius: 6, background: 'var(--ui-surface-2)' }} />
    <div style={{ height: 10, width: '70%', borderRadius: 6, background: 'var(--ui-surface-2)' }} />
  </div>
)

export default {
  title: 'Navbar',
  category: 'Navigation',
  status: 'ready',
  description:
    'Responsive top bar: a highlight follows the hovered link and settles back on the current page. Under ~720px of container width, links and actions fold into an animated hamburger panel (try Width 390). Extra: rainbow hairline, a neon pill that chases your cursor, a spinning gradient logo.',
  layout: 'fullscreen',
  height: 300,
  controls: {
    brand: { type: 'text', default: 'Acme' },
    variant: { type: 'radio', options: ['solid', 'floating', 'transparent'], default: 'solid' },
    logo: { type: 'select', options: ['sparkles', 'zap', 'rocket', 'layers', 'globe', 'heart'], default: 'sparkles' },
    withActions: { type: 'boolean', default: true, label: 'actions' },
  },
}

export const Bar = () => <Navbar links={LINKS.slice(0, 3)} />
Bar.height = 120

export const Playground = ({ withActions, ...args }) => (
  <>
    <Navbar {...args} links={LINKS} actions={withActions ? ACTIONS : null} />
    <Page />
  </>
)

export const Floating = () => (
  <>
    <Navbar variant="floating" brand="Orbit" logo="globe" links={LINKS.slice(0, 4)} actions={<Button size="sm">Book a demo</Button>} />
    <Page />
  </>
)

export const MobileOpen = () => (
  <div style={{ maxWidth: 390, margin: '0 auto', borderInline: '1px dashed var(--ui-border)', minHeight: 420 }}>
    <Navbar links={LINKS} actions={ACTIONS} defaultValue="pricing" />
    <Page />
  </div>
)
MobileOpen.height = 440
MobileOpen.storyName = 'Mobile (tap the burger)'
