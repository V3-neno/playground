/*
 * Source export: follows relative imports from a set of entry files, so a download contains exactly the
 * components, shared lib files and styles they need, and nothing else. Zips with fflate.
 */
import { strToU8, zipSync } from 'fflate'
import { STYLES } from '../styles'
import { themeCss } from './themes'
// The block wrapper is shared by the builder canvas and exported pages, so they look identical.
import BLOCK_SOURCE from './page/Block.jsx?raw'
import BLOCK_CSS from './page/block.css?raw'

// Every source file a component can depend on, as lazy raw text. Keys look like '../components/x/Y.jsx'.
const SOURCES = import.meta.glob(['../components/**/*.{jsx,js,css}', '../lib/**/*.{jsx,js,css}', '../styles/*.{css,js}'], {
  query: '?raw',
  import: 'default',
})

const EXTS = ['', '.jsx', '.js', '.css', '/index.js', '/index.jsx']

function resolve(from, spec) {
  if (!spec.startsWith('.')) return null // npm package (react, fflate…)
  const parts = from.split('/').slice(0, -1)
  for (const seg of spec.split('/')) {
    if (seg === '..') parts.pop()
    else if (seg !== '.') parts.push(seg)
  }
  const base = parts.join('/')
  return EXTS.map((e) => base + e).find((p) => p in SOURCES) ?? null
}

const IMPORT_RE = /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

/** All files reachable from the entries: Map(path -> text). */
export async function collect(entries) {
  const files = new Map()
  const queue = [...entries]
  while (queue.length) {
    const path = queue.shift()
    if (files.has(path) || !(path in SOURCES)) continue
    const text = await SOURCES[path]()
    files.set(path, text)
    for (const m of text.matchAll(IMPORT_RE)) {
      const dep = resolve(path, m[1] ?? m[2])
      if (dep && !files.has(dep)) queue.push(dep)
    }
  }
  return files
}

/** '../components/actions/Button' -> every file in that folder. */
export const filesIn = (dir) => Object.keys(SOURCES).filter((p) => p.startsWith(dir + '/'))

/** Style css files needed for a style id (tokens + the style), as source paths. */
export function styleFiles(baseId) {
  return ['../styles/tokens.css', `../styles/${baseId}.css`]
}

const toProjectPath = (p) => p.replace(/^\.\.\//, 'src/')

export const FONT_LINK =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;700&family=Syne:wght@600;700;800&display=swap" />'

/** Build a zip: files is { 'path/in/zip': string }. Triggers a browser download. */
export function downloadZip(name, files) {
  const data = Object.fromEntries(Object.entries(files).map(([k, v]) => [k, strToU8(v)]))
  const blob = new Blob([zipSync(data, { level: 6 })], { type: 'application/zip' })
  downloadBlob(`${name}.zip`, blob)
}

export function downloadText(filename, text, type = 'text/markdown') {
  downloadBlob(filename, new Blob([text], { type }))
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Files of a single component plus its dependencies and every style, laid out as src/... */
export async function componentBundle(component, { styleguide } = {}) {
  const dir = component.files[0].slice(0, component.files[0].lastIndexOf('/'))
  const deps = await collect([...filesIn(dir), '../styles/index.js'])
  const out = {}
  for (const [p, text] of deps) out[toProjectPath(p)] = text
  out['README.md'] = componentReadme(component, dir)
  if (styleguide) out['STYLEGUIDE.md'] = styleguide
  return out
}

function componentReadme(component, dir) {
  const name = dir.split('/').pop()
  return `# ${component.title}

${component.description || ''}

Copied from the UI workshop. Drop \`src/\` into a React project (React 18+).

\`\`\`jsx
import './styles' // tokens + every style (or import only styles/tokens.css + the one style you use)
import { ${name} } from './${toProjectPath(dir).replace(/^src\//, '')}/${name}'

export default function App() {
  return (
    <div className="ui-root" data-style="base" data-theme="light">
      <${name} />
    </div>
  )
}
\`\`\`

- Everything must sit inside an element with \`className="ui-root"\` and a \`data-style\` (${STYLES.map((s) => s.id).join(', ')}) and \`data-theme\` (light / dark).
- \`${name}.stories.jsx\` has working examples with demo data.
- Fonts used by the styles (optional): ${FONT_LINK}
`
}

/** A runnable Vite + React project for a builder page. */
export async function pageProject({ page, storyFiles, style, customTheme, styleguide, pageSource }) {
  const deps = await collect([...storyFiles, ...styleFiles(style)])
  const out = {}
  for (const [p, text] of deps) out[toProjectPath(p)] = text
  if (customTheme) out['src/styles/theme.css'] = themeCss(customTheme)
  const slug = page.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page'
  out['package.json'] = JSON.stringify(
    {
      name: slug,
      private: true,
      type: 'module',
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
      devDependencies: { '@vitejs/plugin-react': '^5.0.0', vite: '^7.0.0' },
    },
    null,
    2,
  )
  out['vite.config.js'] = `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({ plugins: [react()] })\n`
  out['index.html'] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${page.name}</title>
    ${FONT_LINK}
    <style>html, body { margin: 0; }</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`
  out['src/main.jsx'] = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/${style}.css'
${customTheme ? "import './styles/theme.css'\n" : ''}import Page from './Page'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
`
  out['src/Page.jsx'] = pageSource
  out['src/Block.jsx'] = BLOCK_SOURCE
  out['src/block.css'] = BLOCK_CSS
  out['STYLEGUIDE.md'] = styleguide
  out['README.md'] = `# ${page.name}

Generated by the UI workshop page builder, using the **${customTheme ? `${customTheme.name} (based on ${style})` : style}** style.

\`\`\`bash
npm install
npm run dev
\`\`\`

- \`src/Page.jsx\` is the page: a list of blocks. Each block renders a component example from its \`*.stories.jsx\` file, with the props you set in the builder. Replace the demo data in those story files (or call the components directly) to make it yours.
- \`src/components/\` holds only the components this page uses, \`src/lib/\` their shared helpers, and \`src/styles/\` the tokens plus the chosen style.
- \`STYLEGUIDE.md\` describes the style for designers and AI assistants. Point your AI at it when generating new pages.
`
  return out
}

