import { useState } from 'react'
import { ICON_NAMES } from '../../../lib/icons'
import { Toggle } from './Toggle'

export default {
  title: 'Toggle',
  category: 'Actions',
  status: 'ready',
  description:
    'A two-state button (aria-pressed) for things like bold, like or pin. Group them in a `ui-toggle-bar` toolbar. In Extra, switching on throws confetti (or the `celebrate` emoji).',
  controls: {
    children: { type: 'text', default: 'Pin' },
    icon: { type: 'select', options: ['', ...ICON_NAMES], default: 'star' },
    variant: { type: 'radio', options: ['outline', 'ghost'], default: 'outline' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    disabled: { type: 'boolean', default: false },
  },
}

export const Formatting = () => {
  const [marks, setMarks] = useState({ bold: true, italic: false, underline: false })
  const set = (k) => (v) => setMarks((m) => ({ ...m, [k]: v }))
  return (
    <div role="toolbar" aria-label="Formatting" className="ui-toggle-bar">
      <Toggle icon="bold" aria-label="Bold" pressed={marks.bold} onPressedChange={set('bold')} />
      <Toggle icon="italic" aria-label="Italic" pressed={marks.italic} onPressedChange={set('italic')} />
      <Toggle icon="underline" aria-label="Underline" pressed={marks.underline} onPressedChange={set('underline')} />
      <span className="ui-toggle-bar__sep" aria-hidden />
      <Toggle icon="link" aria-label="Link" />
    </div>
  )
}

export const Playground = (args) => <Toggle {...args} icon={args.icon || undefined} />

export const LikeButton = () => {
  const [liked, setLiked] = useState(false)
  return (
    <Toggle icon="heart" pressed={liked} onPressedChange={setLiked} celebrate="💖">
      {liked ? 'Liked' : 'Like'} · {liked ? 129 : 128}
    </Toggle>
  )
}

export const States = () => (
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
    <Toggle icon="bell">Off</Toggle>
    <Toggle icon="bell" defaultPressed>
      On
    </Toggle>
    <Toggle icon="mute" variant="ghost" aria-label="Mute" />
    <Toggle icon="mute" variant="ghost" defaultPressed aria-label="Mute" />
    <Toggle icon="lock" disabled>
      Disabled
    </Toggle>
  </div>
)

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
    <Toggle size="sm" icon="star" defaultPressed>
      Small
    </Toggle>
    <Toggle size="md" icon="star" defaultPressed>
      Medium
    </Toggle>
    <Toggle size="lg" icon="star" defaultPressed>
      Large
    </Toggle>
  </div>
)
