/*
 * STYLEGUIDE.md generator. One document per style (built-in or custom) that a designer or an AI assistant
 * can follow to build new pages that fit the style, using the workshop's components.
 */
import { STYLES } from '../styles'
import { TEMPLATES, findStory } from './page/model'
import { components } from './registry'
import { readTokens, resolveStyle, styleName } from './themes'
import { CATALOG } from '../catalog'

const TOKEN_USE = {
  '--ui-bg': 'Page background',
  '--ui-surface': 'Subtle fills: table headers, hovered rows, wells',
  '--ui-surface-2': 'Stronger fills: tracks, pressed states',
  '--ui-raised': 'Cards, menus, popovers, modals',
  '--ui-raised-border': 'Border of raised surfaces',
  '--ui-text': 'Body and heading text',
  '--ui-text-muted': 'Secondary text, hints, captions',
  '--ui-border': 'Dividers and control borders',
  '--ui-accent': 'Primary actions, links, selection, focus',
  '--ui-accent-hover': 'Hover state of accent fills',
  '--ui-accent-text': 'Text and icons on accent fills',
  '--ui-accent-soft': 'Tinted backgrounds for selected / highlighted items',
  '--ui-danger': 'Errors, destructive actions',
  '--ui-success': 'Success, positive deltas',
  '--ui-warning': 'Warnings, pending states',
  '--ui-focus': 'Focus ring (box-shadow: 0 0 0 3px var(--ui-focus))',
  '--ui-overlay': 'Backdrop behind modals and drawers',
  '--ui-field-bg': 'Input background',
  '--ui-field-border': 'Input border',
  '--ui-radius-sm': 'Chips, small controls, inner corners',
  '--ui-radius-md': 'Buttons, inputs, menus',
  '--ui-radius-lg': 'Cards, modals, sections',
  '--ui-radius-full': 'Pills and avatars',
  '--ui-border-width': 'Every border',
  '--ui-shadow-sm': 'Resting buttons, small raised items',
  '--ui-shadow-md': 'Cards, menus, hover elevation',
  '--ui-shadow-lg': 'Modals, drawers, floating panels',
  '--ui-shadow-inset': 'Sunken / pressed (inputs, pressed toggles)',
  '--ui-blur': 'backdrop-filter: blur() on raised surfaces',
  '--ui-gradient': 'Primary fills, gradient text, decorative borders',
  '--ui-glow': 'Extra shadow on accent elements on hover / focus',
  '--ui-hover-lift': 'translateY on hover for clickable surfaces',
  '--ui-press-scale': 'scale on :active',
  '--ui-font': 'Body font',
  '--ui-font-display': 'Headings (.ui-heading)',
  '--ui-font-mono': 'Code, numbers in tables if desired',
  '--ui-font-size': 'Base font size',
  '--ui-weight-strong': 'Buttons, labels, emphasis',
  '--ui-heading-weight': 'Headings',
  '--ui-heading-transform': 'Heading case',
  '--ui-heading-tracking': 'Heading letter-spacing',
  '--ui-duration-fast': 'Hover / press feedback',
  '--ui-duration': 'Most transitions (open/close, state changes)',
  '--ui-duration-slow': 'Entrances, large movements',
  '--ui-ease': 'Default easing',
  '--ui-ease-spring': 'Playful overshoot (entrances, toggles)',
}

const SECTIONS = [
  ['Colour', ['--ui-bg', '--ui-surface', '--ui-surface-2', '--ui-raised', '--ui-raised-border', '--ui-text', '--ui-text-muted', '--ui-border', '--ui-accent', '--ui-accent-hover', '--ui-accent-text', '--ui-accent-soft', '--ui-danger', '--ui-success', '--ui-warning', '--ui-focus', '--ui-overlay', '--ui-field-bg', '--ui-field-border']],
  ['Charts', [1, 2, 3, 4, 5, 6].map((i) => `--ui-chart-${i}`)],
  ['Shape', ['--ui-radius-sm', '--ui-radius-md', '--ui-radius-lg', '--ui-radius-full', '--ui-border-width']],
  ['Elevation & effects', ['--ui-shadow-sm', '--ui-shadow-md', '--ui-shadow-lg', '--ui-shadow-inset', '--ui-blur', '--ui-gradient', '--ui-glow', '--ui-hover-lift', '--ui-press-scale']],
  ['Typography', ['--ui-font', '--ui-font-display', '--ui-font-mono', '--ui-font-size', '--ui-weight-strong', '--ui-heading-weight', '--ui-heading-transform', '--ui-heading-tracking']],
  ['Motion', ['--ui-duration-fast', '--ui-duration', '--ui-duration-slow', '--ui-ease', '--ui-ease-spring']],
]

const esc = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
const code = (v) => (v ? `\`${esc(v)}\`` : '–')

function controlDoc(c) {
  if (c.type === 'select' || c.type === 'radio') return c.options.filter((o) => o !== '').map((o) => `\`${o}\``).join(' / ')
  if (c.type === 'range' || c.type === 'number') return `number${c.min != null ? ` ${c.min}–${c.max}` : ''}`
  if (c.type === 'boolean') return 'boolean'
  return c.type === 'textarea' ? 'string (multiline)' : c.type === 'color' ? 'CSS colour' : 'string'
}

/** Markdown for one style id (built-in or custom). Runs in the browser (reads computed token values). */
export function styleguideMarkdown(styleId, themes = []) {
  const custom = themes.find((t) => t.id === styleId)
  const baseId = custom?.base ?? styleId
  const meta = STYLES.find((s) => s.id === baseId) ?? STYLES[0]
  const g = meta.guide ?? {}
  const name = custom ? custom.name : meta.name.replace(/\s*✨/, '')
  const light = readTokens(baseId, 'light', resolveStyle(styleId, 'light', themes).vars)
  const dark = readTokens(baseId, 'dark', resolveStyle(styleId, 'dark', themes).vars)

  const L = []
  const p = (...lines) => L.push(...lines, '')

  p(`# ${name}: UI styleguide`)
  p(
    `> Instructions for designers and AI assistants. Follow this document when building or editing any page in the **${name}** style.`,
    `> It's generated from the UI workshop, so token values and the component list are exact.${custom ? ` This is a custom theme based on **${styleName(baseId)}**.` : ''}`,
  )

  p('## 1. Personality', g.personality ?? meta.description)
  if (g.fonts?.length) p(`**Fonts:** ${g.fonts.join(', ')}.`)

  p(
    '## 2. Setup',
    'Every component must render inside a style root. The root sets the tokens, background, text colour and font:',
    '```jsx',
    `import './styles/tokens.css'`,
    `import './styles/${baseId}.css'${custom ? `\nimport './styles/theme.css' // ${name} overrides` : ''}`,
    `import { UIContext } from './lib/ui-context'`,
    '',
    `<UIContext.Provider value={{ style: '${baseId}', theme: 'light', reducedMotion: false }}>`,
    `  <div className="ui-root" data-style="${baseId}" data-theme="light">{/* page */}</div>`,
    `</UIContext.Provider>`,
    '```',
    '- Set `data-theme="dark"` for dark mode. Every token has a dark value (see below).',
    '- `.ui-root` is a size container, so components respond to **their container\'s** width (`@container`), not the viewport.',
    '- Overlays (modal, drawer, toast, popover) render inline, without portals, so they stay inside the root and keep its tokens.',
  )

  p('## 3. Rules')
  if (g.do?.length) p('**Do**', ...g.do.map((d) => `- ${d}`))
  if (g.dont?.length) p("**Don't**", ...g.dont.map((d) => `- ${d}`))
  p(
    '**Always**',
    '- Style only with `var(--ui-*)` tokens. Never hard-code colours, radii, shadows, fonts or durations.',
    '- Use existing components (section 6) before writing new markup. New components follow the same pattern: tokens first, then a small "style overrides" block.',
    '- Headings use the `.ui-heading` class (display font, weight, tracking and case come from tokens). Use `.ui-gradient-text` for highlighted words.',
    '- Show focus with `box-shadow: 0 0 0 3px var(--ui-focus)` on `:focus-visible`.',
    '- Honour reduced motion: OS `prefers-reduced-motion` and `useReducedMotion()` from `lib/ui-context`.',
    '- Use semantic HTML and correct ARIA roles. Everything must be keyboard reachable.',
  )

  p('## 4. Design tokens', 'Values resolved for this style. Use the variable, not the value.')
  for (const [title, names] of SECTIONS) {
    p(
      `### ${title}`,
      '| Token | Light | Dark | Use |',
      '| --- | --- | --- | --- |',
      ...names.map((n) => `| \`${n}\` | ${code(light[n])} | ${light[n] === dark[n] ? 'same' : code(dark[n])} | ${TOKEN_USE[n] ?? (n.startsWith('--ui-chart') ? 'Data series, in order' : '')} |`),
    )
  }

  p(
    '## 5. Layout',
    '- Page sections: full-width bands with content constrained to ~1200px (wide) or ~760px (narrow), 24px side gutters, vertical padding of 24 / 48 / 96px.',
    '- Grids: `repeat(auto-fit, minmax(…, 1fr))` or container queries. Collapse to one column below ~760px of container width.',
    '- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px.',
    '- Test every page at 390, 768 and 1280px wide, light and dark.',
  )

  p('## 6. Components', 'All components live in `src/components/<category>/<Name>/` (`<Name>.jsx`, `<Name>.css`, `<Name>.stories.jsx` with working examples). Import the component, pass props, and put it inside the style root.')
  const order = CATALOG.map((c) => c.category)
  const cats = [...new Set(components.map((c) => c.category))].sort((a, b) => order.indexOf(a) - order.indexOf(b))
  for (const cat of cats) {
    p(`### ${cat}`)
    for (const c of components.filter((x) => x.category === cat)) {
      const file = c.files.find((f) => !f.endsWith('.css') && !f.endsWith('.stories.jsx')) ?? c.files[0]
      const exportName = file.split('/').pop().replace(/\.jsx?$/, '')
      const path = file.replace(/^\.\.\//, 'src/').replace(/\.jsx?$/, '')
      L.push(`#### ${c.title}`)
      if (c.description) L.push(c.description)
      L.push(`\`import { ${exportName} } from '${path}'\`  ·  examples: ${c.stories.map((s) => s.name).join(', ')}`)
      const props = Object.entries(c.controls)
      if (props.length) {
        L.push('', '| Prop | Type | Default |', '| --- | --- | --- |', ...props.map(([k, ctl]) => `| \`${k}\` | ${controlDoc(ctl)} | ${code(JSON.stringify(ctl.default ?? ''))} |`))
      }
      L.push('')
    }
  }

  p('## 7. Page recipes', 'Proven block orders. The workshop\'s page builder has these as templates.')
  for (const t of TEMPLATES) {
    const steps = t
      .blocks()
      .map((b) => (b.kind === 'row' ? `row of [${b.children.map(label).join(', ')}]` : label(b)))
      .filter(Boolean)
    p(`**${t.name}:** ${t.description}`, steps.map((s, i) => `${i + 1}. ${s}`).join('\n'))
  }

  p(
    '## 8. Checklist before you ship a page',
    '- [ ] Only `--ui-*` tokens, no raw colours or pixel radii',
    '- [ ] Built from existing components where one exists',
    '- [ ] Works at 390 / 768 / 1280px and in light + dark',
    '- [ ] Keyboard and screen-reader friendly, visible focus',
    '- [ ] Motion respects reduced-motion',
    `- [ ] Feels like the personality above: ${g.personality?.split('.')[0] ?? name}`,
  )
  return L.join('\n')
}

function label(b) {
  const story = findStory(b)
  const c = b.component.split('/')[1].replace(/-/g, ' ')
  return story ? `${c} (${story.name})` : null
}
