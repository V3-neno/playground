import { useEffect, useMemo, useRef, useState } from 'react'
import { STYLES } from '../styles'
import { usePersistentState, useHashRoute } from './hooks'
import { Panel } from './Panel'
import { byId, components, defaultArgs, slugify, tree } from './registry'
import { Stage, StoryFrame, WIDTHS } from './Stage'

const DEFAULT_SETTINGS = { style: 'base', theme: 'light', width: 'full', background: 'theme', reducedMotion: false }

export default function App() {
  const route = useHashRoute()
  const [settings, setSettings] = usePersistentState('ui-workshop:settings', DEFAULT_SETTINGS)
  const [argsById, setArgsById] = useState({})
  const component = byId[route]

  // Workshop chrome follows the canvas theme so dark mode isn't a white frame around a dark story.
  useEffect(() => {
    document.documentElement.dataset.wsTheme = settings.theme
  }, [settings.theme])

  const args = component ? (argsById[component.id] ?? defaultArgs(component.controls)) : {}
  const setArgs = (next) => setArgsById((all) => ({ ...all, [component.id]: next }))
  const resetArgs = () => setArgsById(({ [component.id]: _, ...rest }) => rest)

  return (
    <div className="ws-app" data-has-panel={component ? true : undefined}>
      <Sidebar active={route} />
      <main className="ws-main">
        <Toolbar settings={settings} setSettings={setSettings} />
        <div className="ws-content">
          {component ? (
            <ComponentPage component={component} args={args} settings={settings} />
          ) : route ? (
            <Planned route={route} />
          ) : (
            <Overview settings={settings} />
          )}
        </div>
      </main>
      {component && <Panel component={component} args={args} setArgs={setArgs} resetArgs={resetArgs} />}
    </div>
  )
}

function Sidebar({ active }) {
  const [query, setQuery] = useState('')
  const search = useRef(null)
  const q = query.trim().toLowerCase()
  const built = components.length
  const planned = tree.reduce((n, g) => n + g.items.length, 0)

  // "/" jumps to search, like most docs sites.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) {
        e.preventDefault()
        search.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <nav className="ws-sidebar">
      <a href="#/" className="ws-brand">
        <span className="ws-logo" aria-hidden>◐</span> UI Workshop
      </a>
      <input
        ref={search}
        className="ws-search"
        placeholder="Search  /"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <a href="#/" className="ws-nav-item ws-overview-link" aria-current={!active ? 'page' : undefined}>
        Overview <span className="ws-muted">{built}/{planned}</span>
      </a>
      {tree.map((g) => {
        const items = g.items.filter((i) => !q || i.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q))
        if (!items.length) return null
        const done = g.items.filter((i) => i.component).length
        return (
          <div key={g.category} className="ws-nav-group">
            <div className="ws-nav-heading">
              {g.category} <span className="ws-muted">{done}/{g.items.length}</span>
            </div>
            {items.map((item) => {
              const id = item.component?.id ?? `${slugify(g.category)}/${slugify(item.title)}`
              return (
                <a
                  key={id}
                  href={`#/${id}`}
                  className="ws-nav-item"
                  data-planned={!item.component || undefined}
                  aria-current={active === id ? 'page' : undefined}
                >
                  {item.title}
                  {item.component && <span className="ws-dot" data-status={item.component.status} title={item.component.status} />}
                </a>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}

function Toolbar({ settings, setSettings }) {
  const set = (k) => (v) => setSettings((s) => ({ ...s, [k]: v }))
  return (
    <header className="ws-toolbar">
      <label className="ws-tool">
        <span>Style</span>
        <select value={settings.style} onChange={(e) => set('style')(e.target.value)}>
          {STYLES.map((s) => (
            <option key={s.id} value={s.id} title={s.description}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <Seg label="Theme" value={settings.theme} onChange={set('theme')} options={[['light', '☀ Light'], ['dark', '☾ Dark']]} />
      <Seg label="Width" value={settings.width} onChange={set('width')} options={WIDTHS.map((w) => [w.id, w.label])} />
      <Seg label="Canvas" value={settings.background} onChange={set('background')} options={[['theme', 'Theme'], ['checker', 'Checker']]} />
      <label className="ws-tool ws-check">
        <input type="checkbox" checked={settings.reducedMotion} onChange={(e) => set('reducedMotion')(e.target.checked)} />
        <span>Reduce motion</span>
      </label>
    </header>
  )
}

function Seg({ label, value, onChange, options }) {
  return (
    <div className="ws-tool">
      <span>{label}</span>
      <div className="ws-seg">
        {options.map(([id, text]) => (
          <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

function ComponentPage({ component, args, settings }) {
  return (
    <article className="ws-page">
      <header className="ws-page-head">
        <div className="ws-crumb">{component.category}</div>
        <h1>
          {component.title}
          <span className="ws-status" data-status={component.status}>
            {component.status}
          </span>
        </h1>
        {component.description && <p className="ws-muted">{component.description}</p>}
        {component.stories.length > 1 && (
          <div className="ws-jump">
            {component.stories.map((s) => (
              <button key={s.key} className="ws-chip" onClick={() => document.getElementById(`story-${s.key}`)?.scrollIntoView({ behavior: 'smooth' })}>
                {s.name}
              </button>
            ))}
          </div>
        )}
      </header>
      {component.stories.map((s) => (
        <StoryFrame key={s.key} anchor={`story-${s.key}`} story={s} args={args} settings={settings} />
      ))}
    </article>
  )
}

function Overview({ settings }) {
  const thumbSettings = useMemo(() => ({ ...settings, width: 'full' }), [settings])
  return (
    <article className="ws-page">
      <header className="ws-page-head">
        <h1>Overview</h1>
        <p className="ws-muted">
          Every planned component, grouped by category. Built ones show a live preview in the current style.
        </p>
      </header>
      {tree.map((g) => (
        <section key={g.category} className="ws-ov-group">
          <h2>{g.category}</h2>
          <div className="ws-ov-grid">
            {g.items.map((item) => {
              const id = item.component?.id ?? `${slugify(g.category)}/${slugify(item.title)}`
              const first = item.component?.stories[0]
              return (
                <a key={id} href={`#/${id}`} className="ws-card" data-planned={!item.component || undefined}>
                  <div className="ws-card-preview">
                    {first ? (
                      <Stage story={first} args={defaultArgs(item.component.controls)} settings={thumbSettings} thumbnail />
                    ) : (
                      <span className="ws-muted">planned</span>
                    )}
                  </div>
                  <div className="ws-card-title">{item.title}</div>
                </a>
              )
            })}
          </div>
        </section>
      ))}
    </article>
  )
}

function Planned({ route }) {
  const item = tree.flatMap((g) => g.items.map((i) => ({ ...i, category: g.category }))).find((i) => `${slugify(i.category)}/${slugify(i.title)}` === route)
  if (!item) {
    return (
      <article className="ws-page">
        <h1>Not found</h1>
        <p className="ws-muted">
          Nothing at <code>#/{route}</code>. <a href="#/">Back to overview</a>
        </p>
      </article>
    )
  }
  return (
    <article className="ws-page">
      <header className="ws-page-head">
        <div className="ws-crumb">{item.category}</div>
        <h1>
          {item.title}
          <span className="ws-status" data-status="planned">
            planned
          </span>
        </h1>
      </header>
      <div className="ws-empty">
        <p>Not built yet. Create it with:</p>
        <pre>
          <code>npm run new -- "{item.title}" --category "{item.category}"</code>
        </pre>
        <p className="ws-muted">That scaffolds the component, its CSS and a stories file. The page appears here immediately.</p>
      </div>
    </article>
  )
}
