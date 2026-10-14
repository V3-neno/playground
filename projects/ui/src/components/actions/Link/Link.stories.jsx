import { Link } from './Link'

// Stories never navigate: a real click would change the workshop's hash route.
const stay = (e) => e.preventDefault()

export default {
  title: 'Link',
  category: 'Actions',
  status: 'ready',
  description:
    'Text link with three variants: inline (in running text), subtle (underline on hover) and standalone (call to action with a nudging arrow). `external` opens a new tab and announces it.',
  controls: {
    children: { type: 'text', default: 'Read the changelog' },
    variant: { type: 'radio', options: ['inline', 'subtle', 'standalone'], default: 'standalone' },
    external: { type: 'boolean', default: false },
    icon: { type: 'select', options: ['', 'file', 'download', 'globe', 'mail'], default: '' },
  },
}

export const Variants = () => (
  <div style={{ display: 'grid', gap: 10, justifyItems: 'start' }}>
    <Link href="/docs" onClick={stay}>
      Inline link
    </Link>
    <Link href="/docs" variant="subtle" onClick={stay}>
      Subtle link
    </Link>
    <Link href="/docs" variant="standalone" onClick={stay}>
      Get started
    </Link>
  </div>
)

export const Playground = (args) => <Link href="https://example.com" onClick={stay} {...args} icon={args.icon || undefined} />

export const InText = () => (
  <p style={{ maxWidth: 460, margin: 0 }}>
    We rebuilt the importer from scratch. See the{' '}
    <Link href="/migration" onClick={stay}>
      migration guide
    </Link>{' '}
    for the breaking changes, or read the{' '}
    <Link href="https://example.com" external onClick={stay}>
      full announcement
    </Link>{' '}
    on our blog. Links wrap across lines and keep their underline when they do.
  </p>
)
InText.layout = 'padded'

export const WithIcons = () => (
  <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
    <Link href="/report.pdf" icon="download" onClick={stay}>
      Download report
    </Link>
    <Link href="mailto:hi@example.com" icon="mail" variant="subtle" onClick={stay}>
      Contact us
    </Link>
    <Link href="https://example.com" external variant="standalone" onClick={stay}>
      Status page
    </Link>
  </div>
)
