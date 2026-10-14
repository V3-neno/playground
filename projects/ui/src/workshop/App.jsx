import { useEffect, useMemo, useRef, useState } from 'react'
import { Builder } from './Builder'
import { usePersistentState, useHashRoute } from './hooks'
import { Panel } from './Panel'
import { byId, components, defaultArgs, slugify, tree } from './registry'
import { StoryFrame } from './Stage'
import { Styleguide } from './Styleguide'
import { ThemeStudio } from './ThemeStudio'
import { ThemesContext, useThemeStore } from './themes'
import { Thumb } from './Thumb'
import { Toolbar } from './Toolbar'

const MODES = [
  ['components', 'Components', '#/'],
  ['themes', 'Themes', '#/themes'],
  ['pages', 'Page builder', '#/pages'],
  ['styleguide', 'Styleguides', '#/styleguide'],
]

const DEFAULT_SETTINGS = { style: 'base', theme: 'light', width: 'full', background: 'theme', reducedMotion: false, compare: false }

export default function App() {
  const route = useHashRoute()
  const [settings, setSettings] = usePersistentState('ui-workshop:settings', DEFAULT_SETTINGS)
  const themeStore = useThemeStore()
  const [head, ...rest] = route.split('/')
  const mode = ['pages', 'themes', 'styleguide'].includes(head) ? head : 'components'
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
    <ThemesContext.Provider value={themeStore}>
      <div className="ws-shell">
        <header className="ws-topbar">
          <a href="#/" className="ws-brand">
            <span className="ws-logo" aria-hidden>◐</span> UI Workshop
          </a>
          <nav className="ws-modes">
            {MODES.map(([id, label, href]) => (
              <a key={id} href={href} className="ws-mode" aria-current={mode === id ? 'page' : undefined}>
                {label}
              </a>
            ))}
          </nav>
        </header>
        {mode === 'pages' ? (
          <Builder pageId={rest.join('/')} settings={settings} setSettings={setSettings} />
        ) : mode === 'themes' ? (
          <ThemeStudio settings={settings} setSettings={setSettings} />
        ) : mode === 'styleguide' ? (
          <Styleguide styleId={rest[0] || settings.style} />
        ) : (
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
            {component && <Panel component={component} args={args} setArgs={setArgs} resetArgs={resetArgs} styleId={settings.style} />}
          </div>
        )}
      </div>
    </ThemesContext.Provider>
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
        <StoryFrame key={`${component.id}/${s.key}`} anchor={`story-${s.key}`} story={s} args={args} settings={settings} />
      ))}
    </article>
  )
}

function Overview({ settings }) {
  const thumbSettings = useMemo(() => ({ ...settings, width: 'full', compare: false }), [settings])
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
                // Not an <a>: previews contain their own links, and links can't nest.
                <div key={id} className="ws-card" data-planned={!item.component || undefined} onClick={() => (location.hash = `#/${id}`)}>
                  <div className="ws-card-preview">
                    {first ? (
                      <Thumb story={first} args={defaultArgs(item.component.controls)} settings={thumbSettings} crop={g.category === 'Sections'} />
                    ) : (
                      <span className="ws-muted">planned</span>
                    )}
                  </div>
                  <a href={`#/${id}`} className="ws-card-title">
                    {item.title}
                  </a>
                </div>
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
