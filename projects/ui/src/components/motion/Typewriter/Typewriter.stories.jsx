import { Typewriter } from './Typewriter'

export default {
  title: 'Typewriter',
  category: 'Motion',
  status: 'ready',
  description:
    'Types, pauses, deletes and cycles through words with a human-ish rhythm, or scrambles each word out of random glyphs. Screen readers get the plain text. Brutalist highlights the typed text and Playful bounces the cursor. In Extra it scrambles in neon with an RGB-split glitch and a sparkle per word.',
  controls: {
    words: { type: 'text', default: 'delightful, fast, accessible, yours' },
    mode: { type: 'radio', options: ['auto', 'type', 'scramble'], default: 'auto' },
    cursor: { type: 'radio', options: ['bar', 'block', 'underscore', 'none'], default: 'bar' },
    typeSpeed: { type: 'range', min: 20, max: 200, step: 5, default: 70, label: 'type speed (ms/char)' },
    pause: { type: 'range', min: 300, max: 4000, step: 100, default: 1500 },
    loop: { type: 'boolean', default: true },
  },
}

const h = { margin: 0, fontSize: 'clamp(1.6em, 6cqi, 2.6em)', textAlign: 'center' }

export const Headline = () => (
  <h2 className="ui-heading" style={h}>
    Build something <Typewriter words={['delightful', 'fast', 'yours']} />
  </h2>
)

export const Playground = ({ words, ...args }) => (
  <h2 className="ui-heading" style={h}>
    Make it <Typewriter key={words + args.mode} words={words.split(',').map((w) => w.trim()).filter(Boolean)} {...args} />
  </h2>
)

export const Scramble = () => (
  <h2 className="ui-heading" style={{ ...h, fontFamily: 'var(--ui-font-mono)' }}>
    <Typewriter mode="scramble" words={['DECRYPTING…', 'ACCESS GRANTED', 'WELCOME BACK']} cursor="block" pause={1200} />
  </h2>
)

export const Terminal = () => (
  <pre
    style={{
      margin: 0,
      width: '100%',
      maxWidth: 520,
      padding: 18,
      border: 'var(--ui-border-width) solid var(--ui-border)',
      borderRadius: 'var(--ui-radius-md)',
      background: 'var(--ui-surface)',
      fontFamily: 'var(--ui-font-mono)',
      fontSize: '0.9em',
      lineHeight: 1.7,
      boxShadow: 'var(--ui-shadow-sm)',
    }}
  >
    <span style={{ color: 'var(--ui-success)' }}>$ </span>
    <Typewriter mode="type" words={['npm run new -- "Carousel" --category Media']} loop={false} cursor="block" typeSpeed={45} />
  </pre>
)
Terminal.storyName = 'Terminal (types once)'
