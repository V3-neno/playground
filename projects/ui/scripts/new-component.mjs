// Scaffold a component:  npm run new -- "Date picker" --category Inputs
// Creates src/components/<category>/<Name>/{<Name>.jsx, <Name>.css, <Name>.stories.jsx}
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? undefined : args.splice(i, 2)[1]
}
const category = flag('category') ?? 'Uncategorized'
const title = args.join(' ').trim()

if (!title) {
  console.error('Usage: npm run new -- "<Title>" --category <Category>\n  e.g. npm run new -- "Date picker" --category Inputs')
  process.exit(1)
}

const pascal = title.replace(/(^|[^a-zA-Z0-9]+)([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase())
const kebab = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'src', 'components', catSlug, pascal)

if (existsSync(dir)) {
  console.error(`Already exists: ${relative(root, dir)}`)
  process.exit(1)
}
mkdirSync(dir, { recursive: true })

const cls = `ui-${kebab}`
const files = {
  [`${pascal}.jsx`]: `import { cx } from '../../../lib/cx'
import './${pascal}.css'

export function ${pascal}({ variant = 'default', className, children, ...props }) {
  return (
    <div className={cx('${cls}', \`${cls}--\${variant}\`, className)} {...props}>
      {children}
    </div>
  )
}
`,
  [`${pascal}.css`]: `/* Style only through --ui-* tokens (src/styles/tokens.css) so every workshop style applies. */
.${cls} {
  padding: 16px 20px;
  border: var(--ui-border-width) solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  color: var(--ui-text);
}
`,
  [`${pascal}.stories.jsx`]: `import { ${pascal} } from './${pascal}'

export default {
  title: '${title.replace(/'/g, "\\'")}',
  category: '${category.replace(/'/g, "\\'")}',
  status: 'draft',
  description: '',
  controls: {
    children: { type: 'text', default: '${title.replace(/'/g, "\\'")}' },
    variant: { type: 'select', options: ['default'], default: 'default' },
  },
}

export const Playground = (args) => <${pascal} {...args} />
`,
}

for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content)
console.log(`Created ${relative(root, dir).replaceAll('\\', '/')}/`)
for (const name of Object.keys(files)) console.log(`  ${name}`)
console.log(`\nOpen http://127.0.0.1:5180/#/${catSlug}/${kebab}`)
