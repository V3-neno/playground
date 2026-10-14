import { useState } from 'react'
import { PHOTOS } from '../../../lib/placeholder'
import { Lightbox } from './Lightbox'

const IMAGES = PHOTOS.map((p) => ({ ...p, caption: `${p.title}, generated offline as an SVG scene` }))

export default {
  title: 'Lightbox',
  category: 'Media',
  status: 'ready',
  description:
    'Full-screen viewer with zoom (click the image, or +/−/0), arrow-key navigation, a thumbnail strip, focus trap and Escape. In Extra the image warps in through a hue shift and wears a living rainbow frame.',
  controls: {
    thumbnails: { type: 'boolean', default: true },
    loop: { type: 'boolean', default: true },
    startAt: { type: 'range', min: 0, max: IMAGES.length - 1, default: 0, label: 'start at' },
  },
}

function Thumbs({ images, onOpen, size = 96 }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
      {images.map((im, k) => (
        <button
          key={k}
          type="button"
          onClick={() => onOpen(k)}
          aria-label={`Open ${im.title}`}
          style={{
            width: size,
            aspectRatio: '4 / 3',
            padding: 0,
            border: 'var(--ui-border-width) solid var(--ui-border)',
            borderRadius: 'var(--ui-radius-md)',
            background: `url("${im.src}") center / cover`,
            boxShadow: 'var(--ui-shadow-sm)',
            cursor: 'zoom-in',
          }}
        />
      ))}
    </div>
  )
}

export const ClickToOpen = () => {
  const [open, setOpen] = useState(false)
  const [i, setI] = useState(0)
  return (
    <>
      <Thumbs
        images={IMAGES.slice(0, 3)}
        size={88}
        onOpen={(k) => {
          setI(k)
          setOpen(true)
        }}
      />
      <Lightbox images={IMAGES} open={open} onOpenChange={setOpen} index={i} onIndexChange={setI} />
    </>
  )
}
ClickToOpen.storyName = 'Click a thumbnail'
ClickToOpen.height = 520

export const Playground = (args) => {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={{ font: 'inherit', padding: '8px 14px', cursor: 'pointer' }}>
        Open lightbox
      </button>
      <Lightbox key={args.startAt} images={IMAGES} open={open} onOpenChange={setOpen} defaultIndex={args.startAt} thumbnails={args.thumbnails} loop={args.loop} />
    </>
  )
}
Playground.height = 560

export const SingleImage = () => {
  const [open, setOpen] = useState(true)
  return (
    <>
      <Thumbs images={IMAGES.slice(5, 6)} size={180} onOpen={() => setOpen(true)} />
      <Lightbox images={IMAGES.slice(5, 6)} open={open} onOpenChange={setOpen} />
    </>
  )
}
SingleImage.height = 460
