/*
 * Builder pages.
 *   page  = { id, name, style?, blocks: [block] }
 *   block = { id, kind: 'story', component: 'sections/hero', story: 'Playground', args: {}, layout: {...} }
 *         | { id, kind: 'row', children: [story block], layout: {...}, columns, gap }
 * A story block renders one of the component's stories (with args when it takes them), so every component
 * in the workshop is automatically a block.
 */
import { byId, defaultArgs } from '../registry'

export const uid = () => Math.random().toString(36).slice(2, 9)

export const LAYOUT_OPTIONS = {
  width: ['full', 'wide', 'narrow'],
  pad: ['none', 'sm', 'md', 'lg'],
  align: ['stretch', 'center', 'start'],
  bg: ['none', 'surface', 'accent'],
}

/** Sensible wrapper defaults from the story's own layout hint. */
export function defaultLayout(story) {
  if (story?.layout === 'fullscreen') return { width: 'full', pad: 'none', align: 'stretch', bg: 'none' }
  if (story?.layout === 'padded') return { width: 'wide', pad: 'md', align: 'stretch', bg: 'none' }
  return { width: 'wide', pad: 'md', align: 'center', bg: 'none' }
}

export const findStory = (block) => byId[block.component]?.stories.find((s) => s.key === block.story)

export function storyBlock(componentId, storyKey, args, layout) {
  const c = byId[componentId]
  const story = c?.stories.find((s) => s.key === storyKey) ?? c?.stories.find((s) => s.usesArgs) ?? c?.stories[0]
  return {
    id: uid(),
    kind: 'story',
    component: componentId,
    story: story?.key,
    args: { ...defaultArgs(c?.controls ?? {}), ...args },
    layout: { ...defaultLayout(story), ...layout },
  }
}

export function rowBlock(children, { columns = children.length, gap = 24, layout } = {}) {
  return {
    id: uid(),
    kind: 'row',
    columns,
    gap,
    children: children.map((c) => ({ ...c, layout: { ...c.layout, width: 'full', pad: 'none' } })),
    layout: { width: 'wide', pad: 'md', align: 'stretch', bg: 'none', ...layout },
  }
}

/** Deep copy with fresh ids (templates → user pages, duplicate). */
export function cloneBlock(b) {
  return b.kind === 'row' ? { ...b, id: uid(), children: b.children.map(cloneBlock) } : { ...b, id: uid(), args: { ...b.args } }
}

// ---- Templates: the "draft pages" that show every style in action ----
const s = storyBlock
const row = rowBlock

export const TEMPLATES = [
  {
    id: 'tpl-landing',
    name: 'Landing page',
    description: 'Marketing site: navbar, hero, logos, features, numbers, testimonials, pricing, FAQ, footer.',
    blocks: () => [
      s('navigation/navbar', 'Bar'),
      s('sections/hero', 'Playground'),
      s('motion/marquee', 'LogoWall', {}, { pad: 'sm' }),
      s('sections/feature-grid', 'Bento'),
      s('motion/number-counter', 'Stats', {}, { bg: 'surface' }),
      s('sections/testimonials', 'Playground'),
      s('sections/pricing-table', 'Playground'),
      s('sections/faq', 'Split'),
      s('sections/footer', 'Playground'),
    ],
  },
  {
    id: 'tpl-dashboard',
    name: 'Dashboard',
    description: 'Analytics app: KPI tiles, line + donut charts, bars, gauge, data table, activity.',
    blocks: () => [
      s('navigation/navbar', 'Bar'),
      s('navigation/breadcrumbs', 'Simple', {}, { pad: 'sm', align: 'start' }),
      s('charts/sparkline', 'KpiTiles', {}, { pad: 'sm' }),
      row([s('charts/line-chart', 'Playground'), s('charts/donut-chart', 'Playground')]),
      row([s('charts/bar-chart', 'Stacked'), s('charts/gauge', 'Zones')], { columns: 2 }),
      s('data-display/table', 'Playground'),
      row([s('data-display/timeline', 'Overview'), s('data-display/list', 'People')]),
      s('navigation/pagination', 'Compact', {}, { align: 'center', pad: 'sm' }),
    ],
  },
  {
    id: 'tpl-app',
    name: 'App & forms',
    description: 'Product UI: tabs, forms, toggles, upload, alerts, overlays, media, empty states.',
    blocks: () => [
      s('navigation/navbar', 'Bar'),
      s('navigation/stepper', 'Progress', {}, { pad: 'sm' }),
      s('navigation/tabs', 'Playground'),
      row([s('inputs/text-field', 'Playground'), s('inputs/dropdown', 'Playground'), s('inputs/date-picker', 'Playground')], { columns: 3 }),
      row([s('inputs/switch', 'Settings'), s('inputs/checkbox', 'SelectAll'), s('inputs/radio-group', 'Cards')], { columns: 3 }),
      row([s('inputs/slider', 'PriceRange'), s('inputs/file-upload', 'Playground')]),
      s('feedback/alert', 'Tones'),
      row([s('overlays/modal', 'Preview'), s('overlays/drawer', 'Preview'), s('overlays/toast', 'Preview'), s('overlays/command-palette', 'Preview')], { columns: 4, layout: { align: 'center' } }),
      row([s('data-display/card', 'InteractiveGrid')], { columns: 1 }),
      s('media/carousel', 'Autoplay'),
      row([s('data-display/accordion', 'Overview'), s('feedback/empty-state', 'Compact')]),
    ],
  },
  {
    id: 'tpl-motion',
    name: 'Motion showcase',
    description: 'Every animation component: typewriter, reveals, stagger, counters, parallax, marquee, transitions.',
    blocks: () => [
      s('motion/typewriter', 'Headline', {}, { pad: 'lg' }),
      s('motion/parallax', 'Pointer'),
      s('motion/reveal-on-scroll', 'Effects'),
      s('motion/stagger-list', 'Grid', {}, { bg: 'surface' }),
      s('motion/number-counter', 'Stats'),
      s('motion/marquee', 'Bands', {}, { width: 'full', pad: 'sm' }),
      s('motion/page-transition', 'AutoCycle'),
      s('media/image-gallery', 'Bento'),
    ],
  },
]

/** Drop blocks whose component/story no longer exists (e.g. a component was renamed). */
export function liveBlocks(blocks) {
  return blocks
    .map((b) => (b.kind === 'row' ? { ...b, children: b.children.filter((c) => findStory(c)) } : b))
    .filter((b) => (b.kind === 'row' ? b.children.length : findStory(b)))
}

export function templatePage(tpl) {
  return { id: tpl.id, name: tpl.name, template: true, blocks: liveBlocks(tpl.blocks()) }
}

/** Flatten story blocks (rows expanded). */
export const storyBlocks = (blocks) => blocks.flatMap((b) => (b.kind === 'row' ? b.children : [b]))

// ---- Code generation for exports ----
const pascal = (s) => s.replace(/(^|[^a-zA-Z0-9]+)([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase())

function propsSource(args, story) {
  if (!story?.usesArgs) return ''
  const parts = Object.entries(args ?? {}).map(([k, v]) =>
    typeof v === 'string' ? `${k}=${JSON.stringify(v)}` : v === true ? k : `${k}={${JSON.stringify(v)}}`,
  )
  return parts.length ? ' ' + parts.join(' ') : ''
}

const layoutProps = (l, defaults = {}) =>
  Object.entries(l ?? {})
    .filter(([k, v]) => v !== (defaults[k] ?? { width: 'wide', pad: 'md', align: 'stretch', bg: 'none' }[k]))
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('')

/** Page.jsx source for an exported project + the story files it imports. */
export function pageSource(page, { style, theme }) {
  const imports = new Map() // storyFile -> Set of 'Story as Alias'
  const aliasOf = new Map()
  const storyFiles = []
  const alias = (b) => {
    const c = byId[b.component]
    const file = c.files.find((f) => f.endsWith('.stories.jsx'))
    const key = `${file}#${b.story}`
    if (!aliasOf.has(key)) {
      const name = pascal(c.title) + (b.story === 'Playground' ? '' : pascal(b.story))
      let unique = name
      for (let i = 2; [...aliasOf.values()].includes(unique); i++) unique = name + i
      aliasOf.set(key, unique)
      if (!imports.has(file)) imports.set(file, new Set())
      imports.get(file).add(b.story === unique ? unique : `${b.story} as ${unique}`)
      storyFiles.push(file)
    }
    return aliasOf.get(key)
  }
  const el = (b, indent) => `${indent}<${alias(b)}${propsSource(b.args, findStory(b))} />`
  const body = page.blocks
    .map((b) => {
      if (b.kind === 'row') {
        const kids = b.children.map((c) => el(c, '          ')).join('\n')
        return `      <Block${layoutProps(b.layout)}>\n        <Row columns={${b.columns}} gap={${b.gap}}>\n${kids}\n        </Row>\n      </Block>`
      }
      return `      <Block${layoutProps(b.layout)}>\n${el(b, '        ')}\n      </Block>`
    })
    .join('\n')
  const importLines = [...imports]
    .map(([file, names]) => `import { ${[...names].join(', ')} } from '${file.replace(/^\.\.\//, './')}'`)
    .join('\n')
  const source = `// ${page.name}: generated by the UI workshop page builder.
// Each block renders a component example from its stories file; swap in your own data as you go.
import { Block, Row } from './Block'
import { UIContext } from './lib/ui-context'
${importLines}

// Change data-style / data-theme to restyle the whole page.
const UI = { style: '${style}', theme: '${theme}', reducedMotion: false }

export default function Page() {
  return (
    <UIContext.Provider value={UI}>
      <div className="ui-root" data-style={UI.style} data-theme={UI.theme} style={{ minHeight: '100vh' }}>
${body}
      </div>
    </UIContext.Provider>
  )
}
`
  return { source, storyFiles: [...new Set([...storyFiles, '../lib/ui-context.js'])] }
}
