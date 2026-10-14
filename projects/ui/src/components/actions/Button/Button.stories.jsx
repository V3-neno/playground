import { Button } from './Button'

// The default export describes the component; every named export is a story (shown in file order).
export default {
  title: 'Button',
  category: 'Actions',
  status: 'ready', // draft | ready
  description: 'Reference component: tokens for everything, small per-style overrides at the bottom of the CSS, and confetti + a magnetic hover in the Extra style.',
  controls: {
    children: { type: 'text', default: 'Get started' },
    variant: { type: 'select', options: ['solid', 'outline', 'ghost', 'danger'], default: 'solid' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    icon: { type: 'select', options: ['', 'plus', 'arrow-right', 'download', 'sparkles', 'heart'], default: '' },
    loading: { type: 'boolean', default: false },
    disabled: { type: 'boolean', default: false },
  },
}

// A story that takes `args` gets the Controls panel.
export const Playground = (args) => <Button {...args} />

export const Variants = () => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
    <Button>Solid</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="danger">Delete</Button>
  </div>
)

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </div>
)

export const WithIcons = () => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
    <Button icon="plus">New project</Button>
    <Button variant="outline" iconRight="arrow-right">Continue</Button>
    <Button variant="ghost" icon="download">Export</Button>
  </div>
)

export const States = () => (
  <div style={{ display: 'flex', gap: 12 }}>
    <Button loading>Saving</Button>
    <Button disabled>Disabled</Button>
  </div>
)
