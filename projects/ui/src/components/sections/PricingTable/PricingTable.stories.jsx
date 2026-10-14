import { PricingTable } from './PricingTable'

export default {
  title: 'Pricing table',
  category: 'Sections',
  status: 'ready',
  layout: 'fullscreen',
  description:
    'Three plans with a monthly/yearly radiogroup (arrow keys work), animated prices, a highlighted plan and an optional comparison table. Extra: holographic foil cards that tilt toward the cursor, and confetti when you pick a plan.',
  controls: {
    featured: { type: 'select', options: ['Starter', 'Pro', 'Enterprise', 'none'], default: 'Pro' },
    discount: { type: 'range', min: 0, max: 50, step: 5, default: 20 },
    currency: { type: 'select', options: ['$', '€', '£', 'kr'], default: '$' },
    defaultBilling: { type: 'radio', options: ['monthly', 'yearly'], default: 'monthly' },
    comparison: { type: 'boolean', default: false },
    title: { type: 'text', default: 'Simple pricing, no surprises' },
    highlight: { type: 'text', default: 'no surprises' },
  },
}

export const Playground = (args) => <PricingTable key={args.defaultBilling} {...args} />

export const WithComparison = () => <PricingTable comparison />

export const Yearly = () => <PricingTable defaultBilling="yearly" eyebrow="Save with yearly" discount={30} />
