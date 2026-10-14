import { Footer } from './Footer'

export default {
  title: 'Footer',
  category: 'Sections',
  status: 'ready',
  layout: 'fullscreen',
  description:
    'Site footer: multi-column links with a validated newsletter form and a status pill, a one-row simple version, and a mega version with a giant wordmark. Extra: the wordmark does a rainbow stadium wave and subscribing sends a burst of love letters.',
  controls: {
    variant: { type: 'radio', options: ['columns', 'simple', 'mega'], default: 'columns' },
    brand: { type: 'text', default: 'Lumen' },
    tagline: { type: 'text', default: 'Components in eight styles, from boardroom to completely unnecessary.' },
    newsletter: { type: 'boolean', default: true },
  },
}

export const Playground = (args) => <Footer {...args} />

export const Mega = () => <Footer variant="mega" />

export const Simple = () => <Footer variant="simple" />
