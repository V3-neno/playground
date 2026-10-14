import { useRef, useState } from 'react'
import { Button } from '../../actions/Button/Button'
import { Modal } from './Modal'

export default {
  title: 'Modal',
  category: 'Overlays',
  status: 'ready',
  description:
    'Centered dialog with backdrop, focus trap, focus return, Escape and backdrop-click to close. Becomes a bottom sheet in narrow containers. In Extra it springs in with a rotating rainbow rim, floats, and pops confetti.',
  height: 440,
  controls: {
    title: { type: 'text', default: 'Publish changes?' },
    description: { type: 'text', default: 'Your edits will go live for everyone on the team.' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    closeOnBackdrop: { type: 'boolean', default: true },
    hideClose: { type: 'boolean', default: false },
  },
}

export const Preview = () => (
  <Modal
    inline
    size="sm"
    title="Delete file?"
    description="This can’t be undone."
    footer={
      <>
        <Button size="sm" variant="outline">Cancel</Button>
        <Button size="sm" variant="danger">Delete</Button>
      </>
    }
  />
)
Preview.layout = 'centered'
Preview.height = 220

export const Playground = (args) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        {...args}
        open={open}
        onOpenChange={setOpen}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Publish</Button>
          </>
        }
      >
        <p>3 pages and 12 components changed since the last publish.</p>
      </Modal>
    </>
  )
}
Playground.height = 440

export const Form = () => {
  const [open, setOpen] = useState(false)
  const name = useRef(null)
  const field = {
    display: 'block',
    width: '100%',
    marginTop: 6,
    padding: '9px 11px',
    font: 'inherit',
    color: 'var(--ui-text)',
    background: 'var(--ui-field-bg)',
    border: 'var(--ui-border-width) solid var(--ui-field-border)',
    borderRadius: 'var(--ui-radius-sm)',
    boxShadow: 'var(--ui-shadow-inset)',
  }
  return (
    <>
      <Button variant="outline" icon="plus" onClick={() => setOpen(true)}>New project</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        initialFocus={name}
        title="New project"
        description="Focus starts in the name field. Tab cycles inside the dialog."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <label>
            Name
            <input ref={name} style={field} placeholder="Moonshot" />
          </label>
          <label>
            Description
            <textarea rows={3} style={field} placeholder="What is it about?" />
          </label>
        </div>
      </Modal>
    </>
  )
}
Form.height = 480

export const Sizes = () => {
  const [size, setSize] = useState(null)
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {['sm', 'md', 'lg'].map((s) => (
        <Button key={s} variant="outline" onClick={() => setSize(s)}>
          {s.toUpperCase()}
        </Button>
      ))}
      <Modal open={!!size} onOpenChange={() => setSize(null)} size={size ?? 'md'} title={`Size: ${size ?? ''}`}>
        <p>Max widths are 380, 520 and 760 px; the panel never exceeds its container.</p>
      </Modal>
    </div>
  )
}
Sizes.height = 420

export const Static = () => (
  <Modal inline title="Inline preview" description="`inline` renders the panel in the flow: no backdrop, trap or keys.">
    <p>Useful for docs and thumbnails.</p>
  </Modal>
)
Static.height = 240
