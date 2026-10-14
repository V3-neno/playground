import { Accordion } from './Accordion'

const FAQ = [
  { id: 'what', title: 'What is the UI workshop?', content: <p>A place to build components in isolation and view them in eight visual styles.</p> },
  { id: 'styles', title: 'How do styles work?', content: <p>Every component reads --ui-* tokens. A style is just a different set of values, plus a few overrides.</p> },
  { id: 'extra', title: 'Why does Extra exist?', content: <p>Because sometimes a component should be completely unnecessary and fun.</p> },
  { id: 'off', title: 'Can items be disabled?', content: <p>Yes.</p>, disabled: true },
]

const SETTINGS = [
  { id: 'profile', icon: 'user', title: 'Profile', content: <p>Name, avatar and public bio.</p> },
  { id: 'security', icon: 'lock', title: 'Security', content: <p>Password, passkeys and two-factor authentication.</p> },
  { id: 'notify', icon: 'bell', title: 'Notifications', content: <p>Email digests, mentions and product updates.</p> },
]

export default {
  title: 'Accordion',
  category: 'Data display',
  status: 'ready',
  description:
    'Expandable sections with animated height (no measuring), aria-expanded/aria-controls and arrow-key navigation between headers. In Extra, open items light up with a gradient rail and the chevron springs through a spin.',
  controls: {
    variant: { type: 'radio', options: ['separated', 'joined', 'flush'], default: 'separated' },
    multiple: { type: 'boolean', default: false },
  },
}

export const Overview = () => (
  <div style={{ width: 200 }}>
    <Accordion
      variant="joined"
      defaultValue={['a']}
      items={[
        { id: 'a', title: 'Open', content: 'Hello there.' },
        { id: 'b', title: 'Closed', content: '…' },
      ]}
    />
  </div>
)

export const Playground = (args) => (
  <div style={{ width: 520, maxWidth: '100%' }}>
    <Accordion key={`${args.multiple}`} {...args} items={FAQ} defaultValue={['what']} />
  </div>
)

export const Joined = () => (
  <div style={{ width: 480, maxWidth: '100%' }}>
    <Accordion variant="joined" multiple items={SETTINGS} defaultValue={['security']} />
  </div>
)

export const Flush = () => (
  <div style={{ width: 480, maxWidth: '100%' }}>
    <Accordion variant="flush" items={FAQ.slice(0, 3)} />
  </div>
)
