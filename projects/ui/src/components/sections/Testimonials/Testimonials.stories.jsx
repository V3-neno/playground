import { Testimonials } from './Testimonials'

export default {
  title: 'Testimonials',
  category: 'Sections',
  status: 'ready',
  layout: 'fullscreen',
  description:
    'Social proof as a masonry grid, a two-row marquee that pauses on hover, or a single spotlight quote with arrows, dots and autoplay. Extra: glowing gradient cards, a wobbling neon quote mark and sparkly stars.',
  controls: {
    variant: { type: 'radio', options: ['grid', 'marquee', 'spotlight'], default: 'grid' },
    title: { type: 'text', default: 'Loved by teams who ship' },
    highlight: { type: 'text', default: 'Loved' },
    lead: { type: 'text', default: 'Don’t take our word for it. Take theirs.' },
    autoplay: { type: 'boolean', default: true },
    speed: { type: 'range', min: 10, max: 90, step: 5, default: 40 },
  },
}

export const Playground = (args) => <Testimonials {...args} />

export const Marquee = () => <Testimonials variant="marquee" eyebrow="Wall of love" title="12,000 teams can’t be wrong" highlight="can’t be wrong" />

export const Spotlight = () => <Testimonials variant="spotlight" eyebrow="" title="" lead="" />
