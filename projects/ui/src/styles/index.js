// Registered styles. To add one: create styles/<id>.css (see tokens.css for the contract) and list it here.
// `guide` feeds the generated STYLEGUIDE.md, so write it as instructions a designer (or an AI) can follow.
import './tokens.css'
import './base.css'
import './corporate.css'
import './glass.css'
import './soft.css'
import './brutalist.css'
import './mono.css'
import './playful.css'
import './extra.css'

export const STYLES = [
  {
    id: 'base',
    name: 'Base',
    description: 'Neutral reference style',
    guide: {
      personality: 'Neutral, modern and unopinionated. A clean default that gets out of the way of the content.',
      fonts: ['System UI stack'],
      do: [
        'Use generous whitespace and a clear type hierarchy instead of decoration.',
        'Use the accent colour sparingly: primary actions, links, focus, the current selection.',
        'Use subtle shadows (--ui-shadow-sm/md) for raised surfaces like menus and cards.',
      ],
      dont: ['Add gradients, glows or heavy borders.', 'Use more than one accent colour on a screen.'],
    },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Calm, dense, crisp lines, one confident blue',
    guide: {
      personality: 'Trustworthy, efficient and information-dense, like a serious B2B SaaS product. Calm surfaces, crisp 1px lines and one confident blue.',
      fonts: ['Inter'],
      do: [
        'Favour density and alignment: tables, grids and consistent 8px spacing.',
        'Keep radii small (4–10px) and shadows soft and low.',
        'Use the blue accent for primary actions and data highlights only. Use neutral greys for everything else.',
        'Write labels in sentence case, short and literal.',
      ],
      dont: ['Use playful motion or bounce.', 'Use uppercase headings or decorative fonts.', 'Use colour for decoration rather than meaning.'],
    },
  },
  {
    id: 'glass',
    name: 'Glass',
    description: 'Frosted translucent panels over an aurora',
    guide: {
      personality: 'Airy and premium. Frosted translucent panels float over a soft colourful aurora, so depth comes from blur and light rather than solid colour.',
      fonts: ['Inter'],
      do: [
        'Put raised surfaces on --ui-raised with backdrop-filter: blur(var(--ui-blur)) and a light --ui-raised-border.',
        'Always keep something colourful behind glass. The page background is the aurora.',
        'Use --ui-gradient for primary buttons and key highlights.',
        'Use large radii (14–22px) and big, soft, coloured shadows.',
      ],
      dont: ['Stack glass on glass more than two levels deep.', 'Put small low-contrast text directly on busy backgrounds.', 'Use hard black borders.'],
    },
  },
  {
    id: 'soft',
    name: 'Soft',
    description: 'Neumorphic: extruded and pressed into one material',
    guide: {
      personality: 'Tactile and calm. Every element is extruded from, or pressed into, one soft material, with light coming from the top-left.',
      fonts: ['Nunito'],
      do: [
        'Show raised elements (cards, buttons) with --ui-shadow-sm/md/lg and sunken ones (inputs, pressed states) with --ui-shadow-inset.',
        'Keep surfaces the same colour as the background. Shape comes from shadow, not fills or borders.',
        'Use the accent only for state: on, selected, primary.',
        'Use rounded radii (12–26px).',
      ],
      dont: ['Use borders to separate things.', 'Put neumorphic shadows on coloured surfaces.', 'Rely on shadow alone for important state. Add colour or an icon too.'],
    },
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    description: 'Thick black lines, offset shadows, shouting yellow',
    guide: {
      personality: 'Loud, raw and confident. Thick black lines, hard offset shadows, a shouting yellow and big uppercase type. Nothing is subtle and everything is on purpose.',
      fonts: ['Space Grotesk'],
      do: [
        'Use 3px solid borders (--ui-border-width) and hard offset shadows (--ui-shadow-sm/md/lg) on interactive and raised things.',
        'Press interactions into the page: on :active, translate by the shadow offset and remove the shadow.',
        'Set headings huge, uppercase and tight (.ui-heading).',
        'Use zero radius everywhere.',
        'Keep motion instant and linear.',
      ],
      dont: ['Use soft shadows, blur, gradients or rounded corners.', 'Use more than yellow plus one extra colour on a screen.'],
    },
  },
  {
    id: 'mono',
    name: 'Mono',
    description: 'Hard edges, monospace, paper tones',
    guide: {
      personality: 'Editorial and technical, like a printed spec sheet. Monospace type, paper tones, hard edges and small offset shadows.',
      fonts: ['Monospace stack (Cascadia Code / Consolas)'],
      do: [
        'Use monospace for everything and uppercase for headings and labels.',
        'Use 2px ink borders and small offset shadows.',
        'Use patterns, numbering and rules instead of colour to organise content.',
      ],
      dont: ['Use more than black plus one accent (orange) in charts.', 'Use round shapes or soft shadows.'],
    },
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Candy colours, chunky outlines, bouncy springs',
    guide: {
      personality: 'Friendly, bouncy and a bit cheeky. Candy colours, chunky 2px outlines with offset shadows, pill shapes and spring motion.',
      fonts: ['Fredoka (display)', 'Nunito (body)'],
      do: [
        'Lift clickable things on hover (--ui-hover-lift) and squish them on press (--ui-press-scale).',
        'Use the spring easings (--ui-ease, --ui-ease-spring) for entrances and state changes.',
        'Use pill shapes for buttons and chips, large radii for cards, and slight rotations on stickers and badges.',
        'Mix the candy chart palette freely in illustrations and accents.',
      ],
      dont: ['Use thin 1px hairlines or long dense paragraphs.', 'Let motion block the user. Keep it under ~500ms.'],
    },
  },
  {
    id: 'extra',
    name: 'Extra ✨',
    description: 'Totally unnecessary: animated neon gradients, glows, confetti',
    guide: {
      personality: 'Maximalist and gleefully unnecessary. A neon gradient that rotates through everything, glows, springy motion, holographic tilt, and confetti for the smallest wins.',
      fonts: ['Syne (display)', 'Space Grotesk (body)'],
      do: [
        'Use var(--ui-gradient) for primary fills, gradient text (.ui-gradient-text) and borders. It rotates on its own.',
        'Add --ui-glow to accent elements on hover and focus.',
        'Use the lib/fx helpers when useFx() is true: burst() confetti on success and selection, sparkle() on hover, useTilt() for cards (with an --fx-x/--fx-y sheen), useMagnet() for primary buttons.',
        'Give every component at least one extra-only delight, and still honour reduced motion (useFx() is false then).',
      ],
      dont: ['Hurt readability. Keep body text solid --ui-text.', 'Animate layout in ways that move content the user is reading.'],
    },
  },
]
