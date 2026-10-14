import { FeatureGrid } from './FeatureGrid'

export default {
  title: 'Feature grid',
  category: 'Sections',
  status: 'ready',
  layout: 'fullscreen',
  description:
    'Feature section as cards, a two-column list, or a bento grid with one hero tile. Extra: holographic tilt cards with a cursor-following sheen and sparkling icons.',
  controls: {
    variant: { type: 'radio', options: ['cards', 'list', 'bento'], default: 'cards' },
    columns: { type: 'radio', options: [2, 3], default: 3 },
    eyebrow: { type: 'text', default: 'Features' },
    title: { type: 'text', default: 'Everything you need, nothing you don’t' },
    highlight: { type: 'text', default: 'nothing' },
    lead: { type: 'textarea', default: 'Six reasons teams switch, and the reason they stay: it just keeps getting out of the way.' },
  },
}

export const Playground = (args) => <FeatureGrid {...args} columns={Number(args.columns)} />

export const Bento = () => <FeatureGrid variant="bento" title="One platform, every piece" highlight="every piece" />

export const List = () => <FeatureGrid variant="list" eyebrow="Why us" title="Built for the long haul" highlight="long haul" />

export const TwoColumns = () => <FeatureGrid columns={2} />
