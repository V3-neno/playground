import { useState } from 'react'
import { PHOTOS } from '../../../lib/placeholder'
import { Carousel } from './Carousel'

const SLIDES = PHOTOS.map((p, i) => ({ ...p, caption: ['Golden hour', 'Above it all', 'Still water', 'Wind-shaped', 'Clear blue', 'After dark', 'Soft morning', 'Deep green'][i] }))

export default {
  title: 'Carousel',
  category: 'Media',
  status: 'ready',
  description:
    'Drag or swipe, arrows, dots, keyboard (←/→/Home/End) and autoplay that pauses on hover or focus. Effects: slide, fade and a 3D coverflow, which the Extra style uses by default with reflections and a sheen sweep.',
  layout: 'padded',
  controls: {
    effect: { type: 'radio', options: ['auto', 'slide', 'fade', 'coverflow'], default: 'auto' },
    autoplay: { type: 'boolean', default: true },
    interval: { type: 'range', min: 1500, max: 8000, step: 500, default: 4000 },
    loop: { type: 'boolean', default: true },
    arrows: { type: 'boolean', default: true },
    dots: { type: 'boolean', default: true },
    captions: { type: 'boolean', default: true },
    aspect: { type: 'select', options: ['16 / 9', '4 / 3', '21 / 9', '1 / 1'], default: '16 / 9' },
  },
}

export const Autoplay = () => <Carousel slides={SLIDES} autoplay interval={3000} />

export const Playground = (args) => <Carousel slides={SLIDES} {...args} />

export const Fade = () => <Carousel slides={SLIDES} effect="fade" aspect="21 / 9" />

export const Coverflow = () => <Carousel slides={SLIDES} effect="coverflow" defaultIndex={2} captions={false} />
Coverflow.height = 420

export const NoLoop = () => <Carousel slides={SLIDES.slice(0, 4)} loop={false} aspect="4 / 3" />
NoLoop.storyName = 'No loop (rubber-band ends)'

export const Controlled = () => {
  const [i, setI] = useState(0)
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Carousel slides={SLIDES} index={i} onIndexChange={setI} dots={false} captions={false} aspect="21 / 9" />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {SLIDES.map((s, k) => (
          <button
            key={k}
            type="button"
            onClick={() => setI(k)}
            aria-label={`Show ${s.title}`}
            style={{
              width: 72,
              aspectRatio: '16 / 10',
              padding: 0,
              border: k === i ? '2px solid var(--ui-accent)' : '2px solid transparent',
              borderRadius: 'var(--ui-radius-sm)',
              background: `url("${s.src}") center / cover`,
              cursor: 'pointer',
              opacity: k === i ? 1 : 0.6,
            }}
          />
        ))}
      </div>
    </div>
  )
}
Controlled.storyName = 'Controlled with thumbnails'
