import { useState } from 'react'
import { Button } from '../../actions/Button/Button'
import { Stepper } from './Stepper'

const CHECKOUT = [
  { label: 'Cart', description: '3 items' },
  { label: 'Shipping', description: 'Address & speed' },
  { label: 'Payment', description: 'Card or invoice' },
  { label: 'Review', description: 'Confirm order' },
]

const ONBOARDING = [
  { label: 'Create account', description: 'Email and password', icon: 'user' },
  { label: 'Invite your team', description: 'Bring a few teammates along', icon: 'users' },
  { label: 'Connect data', description: 'Hook up your first source', icon: 'link' },
  { label: 'Launch', description: 'Ship your first dashboard', icon: 'rocket' },
]

function Flow({ steps, ...props }) {
  const [step, setStep] = useState(1)
  const done = step >= steps.length
  return (
    <div style={{ display: 'grid', gap: 24, width: '100%' }}>
      <Stepper steps={steps} current={step} onChange={setStep} {...props} />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
        <Button variant="outline" icon="arrow-left" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          Back
        </Button>
        {done ? (
          <Button variant="ghost" icon="refresh" onClick={() => setStep(0)}>
            Start over
          </Button>
        ) : (
          <Button iconRight={step === steps.length - 1 ? 'check' : 'arrow-right'} onClick={() => setStep((s) => s + 1)}>
            {step === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default {
  title: 'Stepper',
  category: 'Navigation',
  status: 'ready',
  description:
    'Steps with complete / current / upcoming states and animated connectors; horizontal or vertical, optionally clickable. Squeezed horizontally it drops the descriptions. Extra: the current step gets a spinning rainbow halo, the fill shimmers, each completed step throws confetti and finishing throws a party.',
  layout: 'padded',
  controls: {
    orientation: { type: 'radio', options: ['horizontal', 'vertical'], default: 'horizontal' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    clickable: { type: 'boolean', default: false },
  },
}

export const Progress = () => <Stepper size="sm" steps={CHECKOUT.map(({ label }) => ({ label }))} defaultCurrent={2} />
Progress.layout = 'centered'

export const Playground = (args) => <Flow steps={CHECKOUT} {...args} />

export const Vertical = () => (
  <div style={{ maxWidth: 420 }}>
    <Flow steps={ONBOARDING} orientation="vertical" />
  </div>
)

export const Clickable = () => <Stepper steps={ONBOARDING} defaultCurrent={2} clickable />

export const AllDone = () => <Stepper steps={CHECKOUT} defaultCurrent={CHECKOUT.length} />
