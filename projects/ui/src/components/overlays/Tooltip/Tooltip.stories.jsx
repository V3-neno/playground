import { Icon } from '../../../lib/icons'
import { Button } from '../../actions/Button/Button'
import { Tooltip } from './Tooltip'

export default {
  title: 'Tooltip',
  category: 'Overlays',
  status: 'ready',
  description:
    'Short hint on hover (with a delay) and instantly on keyboard focus, linked via aria-describedby; Escape hides it. Wrap one focusable element. Extra turns it into a gradient pill that wobbles out with a spinning star and a twinkle.',
  height: 220,
  controls: {
    content: { type: 'text', default: 'Copy to clipboard' },
    placement: { type: 'radio', options: ['top', 'right', 'bottom', 'left'], default: 'top' },
    delay: { type: 'range', min: 0, max: 1000, step: 50, default: 300 },
  },
}

export const Preview = () => (
  <div style={{ paddingTop: 40 }}>
    <Tooltip open content="Hello there">
      <Button size="sm" variant="outline">Hover me</Button>
    </Tooltip>
  </div>
)
Preview.height = 160

export const Playground = (args) => (
  <Tooltip {...args}>
    <Button variant="outline" icon="copy">Copy</Button>
  </Tooltip>
)

export const Placements = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '56px 120px', padding: '40px 70px' }}>
    {['top', 'right', 'bottom', 'left'].map((p) => (
      <Tooltip key={p} open placement={p} content={p}>
        <Button size="sm" variant="outline">{p}</Button>
      </Tooltip>
    ))}
  </div>
)
Placements.height = 240

export const Toolbar = () => {
  const btn = {
    display: 'inline-grid',
    placeItems: 'center',
    width: 36,
    height: 36,
    border: 0,
    borderRadius: 'var(--ui-radius-sm)',
    background: 'transparent',
    color: 'var(--ui-text)',
    cursor: 'pointer',
  }
  const tools = [
    ['bold', 'Bold  ⌘B'],
    ['italic', 'Italic  ⌘I'],
    ['underline', 'Underline  ⌘U'],
    ['link', 'Insert link  ⌘K'],
    ['image', 'Add image'],
  ]
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 'var(--ui-radius-md)',
        background: 'var(--ui-raised)',
        border: 'var(--ui-border-width) solid var(--ui-raised-border)',
        boxShadow: 'var(--ui-shadow-sm)',
      }}
    >
      {tools.map(([icon, label]) => (
        <Tooltip key={icon} content={label} delay={150}>
          <button type="button" style={btn} aria-label={label.split('  ')[0]}>
            <Icon name={icon} size={18} />
          </button>
        </Tooltip>
      ))}
    </div>
  )
}
Toolbar.storyName = 'Toolbar (tab through it)'

export const LongText = () => (
  <Tooltip open placement="bottom" content="Tooltips wrap at 240px, so longer explanations stay readable instead of running off the screen.">
    <span tabIndex={0} style={{ textDecoration: 'underline dotted', cursor: 'help' }}>
      What is this?
    </span>
  </Tooltip>
)
LongText.height = 200
