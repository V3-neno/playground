import { Button } from './Button'

// The default export describes the component; every named export is a story (shown in file order).
export default {
  title: 'Button',
  category: 'Actions',
  status: 'draft', // draft | ready
  description: 'Reference component for the workshop. Styled only through --ui-* tokens, so it follows the style switcher.',
  controls: {
    children: { type: 'text', default: 'Get started' },
    variant: { type: 'select', options: ['solid', 'outline', 'ghost', 'danger'], default: 'solid' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
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

export const States = () => (
  <div style={{ display: 'flex', gap: 12 }}>
    <Button loading>Saving</Button>
    <Button disabled>Disabled</Button>
  </div>
)
