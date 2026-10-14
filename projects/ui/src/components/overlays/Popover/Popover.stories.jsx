import { useState } from 'react'
import { avatar } from '../../../lib/placeholder'
import { Button } from '../../actions/Button/Button'
import { Popover } from './Popover'

export default {
  title: 'Popover',
  category: 'Overlays',
  status: 'ready',
  description:
    'Click-triggered panel anchored to any element. Four placements, three alignments, optional arrow and close button; children can be a function receiving { close }. Extra pops it on a hard spring, adds a glow, a cursor-following sheen, 3D tilt and sparkles.',
  height: 360,
  controls: {
    placement: { type: 'radio', options: ['top', 'right', 'bottom', 'left'], default: 'bottom' },
    align: { type: 'radio', options: ['start', 'center', 'end'], default: 'center' },
    title: { type: 'text', default: 'Share link' },
    arrow: { type: 'boolean', default: true },
    showClose: { type: 'boolean', default: false },
  },
}

export const Preview = () => (
  <div style={{ paddingBottom: 70 }}>
    <Popover defaultOpen trigger={<Button size="sm" variant="outline">Details</Button>} title="Popover">
      Anchored, with an arrow.
    </Popover>
  </div>
)
Preview.height = 200

export const Playground = (args) => (
  <Popover {...args} trigger={<Button variant="outline" icon="link">Share</Button>}>
    {({ close }) => (
      <div style={{ display: 'grid', gap: 10, width: 240 }}>
        <span style={{ color: 'var(--ui-text-muted)' }}>Anyone with the link can view.</span>
        <Button size="sm" icon="copy" onClick={() => close()}>Copy link</Button>
      </div>
    )}
  </Popover>
)

export const Placements = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '90px 140px', padding: '60px 90px' }}>
    {['top', 'right', 'bottom', 'left'].map((p) => (
      <Popover key={p} defaultOpen placement={p} trigger={<Button size="sm" variant="outline">{p}</Button>}>
        {p}
      </Popover>
    ))}
  </div>
)
Placements.height = 380

export const ProfileCard = () => {
  const [following, setFollowing] = useState(false)
  return (
    <Popover
      placement="bottom"
      align="start"
      width={280}
      trigger={
        <button
          type="button"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: 4, border: 0, background: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer' }}
        >
          <img src={avatar('Maya Chen')} alt="" width={32} height={32} style={{ borderRadius: 'var(--ui-radius-full)' }} />
          <strong>@maya</strong>
        </button>
      }
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
        <img src={avatar('Maya Chen')} alt="" width={48} height={48} style={{ borderRadius: 'var(--ui-radius-full)' }} />
        <div>
          <div className="ui-heading">Maya Chen</div>
          <div style={{ color: 'var(--ui-text-muted)', fontSize: '0.9em' }}>Product designer · Oslo</div>
        </div>
      </div>
      <p style={{ margin: '0 0 12px' }}>Designing calm interfaces for loud problems.</p>
      <Button size="sm" variant={following ? 'outline' : 'solid'} onClick={() => setFollowing((f) => !f)}>
        {following ? 'Following' : 'Follow'}
      </Button>
    </Popover>
  )
}
ProfileCard.height = 320
