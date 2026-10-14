import { Hero } from './Hero'

export default {
  title: 'Hero',
  category: 'Sections',
  status: 'ready',
  layout: 'fullscreen',
  description:
    'Top-of-page hero in three layouts: centered with product shot, split with a floating stat, and centered with a stats band. Extra: floating blobs, a tilting holographic screenshot, sparkly badge and marquee logos.',
  controls: {
    variant: { type: 'radio', options: ['centered', 'split', 'stats'], default: 'centered' },
    eyebrow: { type: 'text', default: 'New · Version 2.0 is here' },
    title: { type: 'text', default: 'Build pages people actually remember' },
    highlight: { type: 'text', default: 'remember' },
    subtitle: {
      type: 'textarea',
      default: 'A kit of components in eight wildly different styles. Swap the look of an entire site without touching a single component.',
    },
    primary: { type: 'text', default: 'Get started free' },
    secondary: { type: 'text', default: 'See how it works' },
    image: { type: 'boolean', default: true },
  },
}

export const Playground = (args) => <Hero {...args} />

export const Split = () => <Hero variant="split" title="Ship your landing page before lunch" highlight="before lunch" />

export const WithStats = () => (
  <Hero
    variant="stats"
    eyebrow="Trusted worldwide"
    title="The platform 12,000 teams run on"
    highlight="12,000 teams"
    secondary="Talk to sales"
  />
)

export const Minimal = () => <Hero eyebrow="" image={false} logos={[]} secondary="" title="Less, but better." highlight="better." />
