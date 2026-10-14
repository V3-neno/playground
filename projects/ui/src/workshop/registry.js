// Finds every components/**/<Name>.stories.jsx and turns it into the data the workshop renders.
import { CATALOG } from '../catalog'

const modules = import.meta.glob('../components/**/*.stories.jsx', { eager: true })
// Module namespaces list exports alphabetically, so read the source to keep stories in file order.
const storySources = import.meta.glob('../components/**/*.stories.jsx', { eager: true, query: '?raw', import: 'default' })
// Every file next to a story, loaded on demand for the Code tab.
const otherSources = import.meta.glob(['../components/**/*.{jsx,js,css}', '!**/*.stories.jsx'], { query: '?raw', import: 'default' })
const fileSources = {
  ...otherSources,
  ...Object.fromEntries(Object.entries(storySources).map(([p, src]) => [p, () => Promise.resolve(src)])),
}

export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const startCase = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())

function exportOrder(source) {
  return [...source.matchAll(/^export\s+(?:const|function)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1])
}

export const components = Object.entries(modules).map(([path, mod]) => {
  const meta = mod.default ?? {}
  const dir = path.slice(0, path.lastIndexOf('/'))
  const title = meta.title ?? dir.split('/').pop()
  const category = meta.category ?? 'Uncategorized'
  const order = exportOrder(storySources[path] ?? '')
  const stories = Object.entries(mod)
    .filter(([key, fn]) => key !== 'default' && typeof fn === 'function')
    .sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
    .map(([key, fn]) => ({
      key,
      name: fn.storyName ?? startCase(key),
      render: fn,
      usesArgs: fn.length > 0, // `(args) => ...` opts the story into the Controls panel
      layout: fn.layout ?? meta.layout ?? 'centered', // centered | padded | fullscreen
    }))
  const files = Object.keys(fileSources)
    .filter((p) => p.startsWith(dir + '/'))
    .sort((a, b) => fileRank(a) - fileRank(b) || a.localeCompare(b))
  return {
    id: `${slugify(category)}/${slugify(title)}`,
    title,
    category,
    status: meta.status ?? 'draft',
    description: meta.description ?? '',
    controls: meta.controls ?? {},
    stories,
    files,
  }
})

function fileRank(p) {
  if (p.endsWith('.stories.jsx')) return 2
  if (p.endsWith('.css')) return 1
  return 0
}

export const byId = Object.fromEntries(components.map((c) => [c.id, c]))

export const loadFile = (path) => fileSources[path]()

export const defaultArgs = (controls) =>
  Object.fromEntries(Object.entries(controls).map(([k, c]) => [k, c.default ?? defaultFor(c)]))

function defaultFor(c) {
  if (c.type === 'boolean') return false
  if (c.type === 'number' || c.type === 'range') return c.min ?? 0
  if (c.type === 'select' || c.type === 'radio') return c.options?.[0]
  if (c.type === 'color') return '#4f46e5'
  return ''
}

/** Catalog categories merged with what's actually built: [{ category, items: [{ title, component? }] }] */
export const tree = (() => {
  const built = new Map(components.map((c) => [`${slugify(c.category)}/${slugify(c.title)}`, c]))
  const used = new Set()
  const groups = CATALOG.map(({ category, planned }) => {
    const items = planned.map((title) => {
      const id = `${slugify(category)}/${slugify(title)}`
      used.add(id)
      return { title, component: built.get(id) }
    })
    return { category, items }
  })
  // Built components that aren't in the catalog still show up, at the end of their category.
  for (const c of components) {
    if (used.has(c.id)) continue
    let group = groups.find((g) => g.category === c.category)
    if (!group) groups.push((group = { category: c.category, items: [] }))
    group.items.push({ title: c.title, component: c })
  }
  return groups
})()
