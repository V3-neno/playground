import { FAQ } from './FAQ'

export default {
  title: 'FAQ',
  category: 'Sections',
  status: 'ready',
  layout: 'fullscreen',
  description:
    'Accordion FAQ (aria-expanded buttons, arrow keys move between questions, smooth height animation) in a centered or split layout with a contact card. Extra: the open question gets a rainbow border and sparkles.',
  controls: {
    variant: { type: 'radio', options: ['centered', 'split'], default: 'centered' },
    multiple: { type: 'boolean', default: false },
    contact: { type: 'boolean', default: true },
    title: { type: 'text', default: 'Questions, answered' },
    highlight: { type: 'text', default: 'answered' },
  },
}

export const Playground = (args) => <FAQ key={String(args.multiple)} {...args} />

export const Split = () => <FAQ variant="split" eyebrow="Support" title="Frequently asked questions" highlight="asked" multiple />
