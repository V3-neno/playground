import { useMemo, useState } from 'react'
import { Markdown } from './Markdown'
import { downloadText } from './exporter'
import { styleguideMarkdown } from './styleguideMarkdown'
import { allStyles, themeCss, useThemes } from './themes'

/** #/styleguide/<styleId>: the generated STYLEGUIDE.md for a style, rendered, with copy / download. */
export function Styleguide({ styleId, setStyle }) {
  const { themes } = useThemes()
  const styles = allStyles(themes)
  const current = styles.find((s) => s.id === styleId) ?? styles[0]
  const md = useMemo(() => styleguideMarkdown(current.id, themes), [current.id, themes])
  const [view, setView] = useState('rendered')
  const [copied, setCopied] = useState(false)
  const custom = themes.find((t) => t.id === current.id)
  const file = `STYLEGUIDE-${current.name.replace(/[^a-z0-9]+/gi, '-').replace(/-$/, '').toLowerCase()}.md`

  return (
    <div className="ws-guide">
      <aside className="ws-guide-side">
        <div className="ws-side-title">Styles</div>
        {styles.map((s) => (
          <a key={s.id} href={`#/styleguide/${s.id}`} className="ws-nav-item" aria-current={s.id === current.id ? 'page' : undefined} onClick={() => setStyle?.(s.id)}>
            {s.name}
            {s.custom && <span className="ws-chip">custom</span>}
          </a>
        ))}
        <p className="ws-muted ws-side-note">
          Hand this file to an AI assistant (or a teammate) together with the components. It describes the style's personality, rules, exact token values, every component's import + props, and page recipes.
        </p>
      </aside>
      <article className="ws-guide-main">
        <header className="ws-guide-bar">
          <div className="ws-seg">
            {['rendered', 'markdown'].map((v) => (
              <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>
                {v === 'rendered' ? 'Preview' : 'Markdown'}
              </button>
            ))}
          </div>
          <span className="ws-muted">{md.length.toLocaleString()} characters</span>
          <span className="ws-grow" />
          <button
            className="ws-btn"
            onClick={async () => {
              await navigator.clipboard.writeText(md)
              setCopied(true)
              setTimeout(() => setCopied(false), 1200)
            }}
          >
            {copied ? 'Copied' : 'Copy markdown'}
          </button>
          <button className="ws-btn ws-btn-primary" onClick={() => downloadText(file, md)}>
            Download {file}
          </button>
          {custom && (
            <button className="ws-btn" onClick={() => downloadText('theme.css', themeCss(custom), 'text/css')}>
              theme.css
            </button>
          )}
        </header>
        {view === 'rendered' ? <Markdown source={md} /> : <pre className="ws-guide-raw">{md}</pre>}
      </article>
    </div>
  )
}
