import { useEffect, useMemo, useState } from 'react'
import { CATALOG } from '../catalog'
import { downloadText, downloadZip, pageProject } from './exporter'
import { Controls } from './Panel'
import { PageView } from './page/PageView'
import { LAYOUT_OPTIONS, TEMPLATES, cloneBlock, findStory, liveBlocks, pageSource, rowBlock, storyBlock, templatePage, uid } from './page/model'
import { byId, components, defaultArgs } from './registry'
import { WIDTHS } from './Stage'
import { styleguideMarkdown } from './styleguideMarkdown'
import { resolveStyle, useThemes } from './themes'
import { Seg, Toolbar } from './Toolbar'

const KEY = 'ui-workshop:pages'

function usePages() {
  const [pages, setPages] = useState(() => {
    try {
      return (JSON.parse(localStorage.getItem(KEY)) ?? []).map((p) => ({ ...p, blocks: liveBlocks(p.blocks) }))
    } catch {
      return []
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(pages))
    } catch {}
  }, [pages])
  return [pages, setPages]
}

/** #/pages and #/pages/<id>: a block-based page builder on top of every component's stories. */
export function Builder({ pageId, settings, setSettings }) {
  const [pages, setPages] = usePages()
  const { themes } = useThemes()
  const templates = useMemo(() => TEMPLATES.map(templatePage), [])
  const page = pages.find((p) => p.id === pageId) ?? templates.find((t) => t.id === pageId) ?? templates[0]
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(false)
  const [busy, setBusy] = useState(false)
  const width = WIDTHS.find((w) => w.id === settings.width)?.px

  useEffect(() => setSelected(null), [page.id])

  // Templates are read-only: the first edit saves a copy and switches to it.
  const edit = (fn) => {
    if (page.template) {
      const copy = { id: `page-${uid()}`, name: `${page.name} (copy)`, style: settings.style, blocks: fn(page.blocks.map((b) => b)) }
      setPages((all) => [...all, copy])
      location.hash = `#/pages/${copy.id}`
      return
    }
    setPages((all) => all.map((p) => (p.id === page.id ? { ...p, blocks: fn(p.blocks) } : p)))
  }
  const renamePage = (name) => setPages((all) => all.map((p) => (p.id === page.id ? { ...p, name } : p)))

  const findBlock = (id) => {
    for (const b of page.blocks) {
      if (b.id === id) return { block: b, parent: null }
      if (b.kind === 'row') {
        const c = b.children.find((x) => x.id === id)
        if (c) return { block: c, parent: b }
      }
    }
    return {}
  }
  const { block: sel, parent: selParent } = findBlock(selected)

  const mapBlocks = (blocks, id, fn) =>
    blocks.flatMap((b) => {
      if (b.id === id) return fn(b)
      if (b.kind === 'row') {
        const children = mapBlocks(b.children, id, fn)
        return children.length ? [{ ...b, children }] : []
      }
      return [b]
    })
  const updateBlock = (id, patch) => edit((blocks) => mapBlocks(blocks, id, (b) => [{ ...b, ...patch }]))
  const removeBlock = (id) => {
    edit((blocks) => mapBlocks(blocks, id, () => []))
    setSelected(null)
  }
  const duplicateBlock = (id) => edit((blocks) => mapBlocks(blocks, id, (b) => [b, cloneBlock(b)]))
  const move = (id, dir) =>
    edit((blocks) => {
      const shift = (list) => {
        const i = list.findIndex((b) => b.id === id)
        if (i === -1) return list.map((b) => (b.kind === 'row' ? { ...b, children: shift(b.children) } : b))
        const j = i + dir
        if (j < 0 || j >= list.length) return list
        const next = [...list]
        ;[next[i], next[j]] = [next[j], next[i]]
        return next
      }
      return shift(blocks)
    })

  const insert = (componentId, storyKey) => {
    const b = storyBlock(componentId, storyKey)
    if (sel?.kind === 'row' || selParent) {
      const row = sel?.kind === 'row' ? sel : selParent
      updateBlock(row.id, { children: [...row.children, { ...b, layout: { ...b.layout, width: 'full', pad: 'none' } }], columns: Math.min(4, row.children.length + 1) })
    } else {
      edit((blocks) => {
        const i = blocks.findIndex((x) => x.id === selected)
        const next = [...blocks]
        next.splice(i === -1 ? next.length : i + 1, 0, b)
        return next
      })
    }
    setSelected(b.id)
  }
  const wrapInRow = (id) => edit((blocks) => mapBlocks(blocks, id, (b) => [rowBlock([b], { columns: 2 })]))

  const newPage = () => {
    const p = { id: `page-${uid()}`, name: 'Untitled page', style: settings.style, blocks: [] }
    setPages((all) => [...all, p])
    location.hash = `#/pages/${p.id}`
  }
  const duplicatePage = () => {
    const p = { id: `page-${uid()}`, name: `${page.name} (copy)`, style: settings.style, blocks: page.blocks.map(cloneBlock) }
    setPages((all) => [...all, p])
    location.hash = `#/pages/${p.id}`
  }
  const deletePage = () => {
    setPages((all) => all.filter((p) => p.id !== page.id))
    location.hash = '#/pages'
  }

  const exportProject = async () => {
    setBusy(true)
    try {
      const { base } = resolveStyle(settings.style, settings.theme, themes)
      const customTheme = themes.find((t) => t.id === settings.style)
      const { source, storyFiles } = pageSource(page, { style: base, theme: settings.theme })
      const files = await pageProject({ page, storyFiles, style: base, customTheme, styleguide: styleguideMarkdown(settings.style, themes), pageSource: source })
      downloadZip(page.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'page', files)
    } finally {
      setBusy(false)
    }
  }
  const copySource = async () => {
    const { base } = resolveStyle(settings.style, settings.theme, themes)
    await navigator.clipboard.writeText(pageSource(page, { style: base, theme: settings.theme }).source)
  }

  return (
    <div className="ws-builder" data-preview={preview || undefined}>
      <aside className="ws-builder-left">
        <div className="ws-side-title">Page</div>
        <select className="ws-input" value={page.id} onChange={(e) => (location.hash = `#/pages/${e.target.value}`)}>
          <optgroup label="Templates">
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </optgroup>
          {pages.length > 0 && (
            <optgroup label="My pages">
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        {page.template ? (
          <p className="ws-muted ws-small">Template: edits save a copy automatically.</p>
        ) : (
          <input className="ws-input" value={page.name} onChange={(e) => renamePage(e.target.value)} aria-label="Page name" />
        )}
        <div className="ws-row-btns">
          <button className="ws-btn" onClick={newPage}>
            New
          </button>
          <button className="ws-btn" onClick={duplicatePage}>
            Duplicate
          </button>
          {!page.template && (
            <button className="ws-btn ws-btn-danger" onClick={deletePage}>
              Delete
            </button>
          )}
        </div>

        <div className="ws-side-title">Blocks</div>
        <Outline blocks={page.blocks} selected={selected} onSelect={setSelected} onMove={move} />

        <div className="ws-side-title">Add block {sel?.kind === 'row' || selParent ? <span className="ws-chip">into row</span> : selected ? <span className="ws-chip">after selected</span> : null}</div>
        <Library onInsert={insert} />
      </aside>

      <main className="ws-main">
        <Toolbar settings={settings} setSettings={setSettings} mode="builder">
          <label className="ws-tool ws-check">
            <input type="checkbox" checked={preview} onChange={(e) => setPreview(e.target.checked)} />
            <span>Preview</span>
          </label>
        </Toolbar>
        <div className="ws-content ws-canvas" onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}>
          <PageView page={page} settings={settings} width={width} editable={!preview} selected={selected} onSelect={setSelected} />
        </div>
      </main>

      <aside className="ws-panel ws-builder-right">
        {sel ? (
          <Inspector
            key={sel.id}
            block={sel}
            inRow={!!selParent}
            onChange={(patch) => updateBlock(sel.id, patch)}
            onRemove={() => removeBlock(sel.id)}
            onDuplicate={() => duplicateBlock(sel.id)}
            onMove={(d) => move(sel.id, d)}
            onWrap={() => wrapInRow(sel.id)}
            onClose={() => setSelected(null)}
          />
        ) : (
          <div className="ws-panel-body">
            <h3 className="ws-panel-h">Export</h3>
            <p className="ws-muted ws-small">
              Downloads a runnable Vite + React project: <code>Page.jsx</code>, only the components this page uses, their shared lib files, the tokens + <strong>current style</strong> (incl. custom theme) and a matching <code>STYLEGUIDE.md</code>.
            </p>
            <button className="ws-btn ws-btn-primary ws-wide" disabled={busy} onClick={exportProject}>
              {busy ? 'Packing…' : 'Export project (.zip)'}
            </button>
            <button className="ws-btn ws-wide" onClick={copySource}>
              Copy Page.jsx
            </button>
            <button className="ws-btn ws-wide" onClick={() => downloadText('STYLEGUIDE.md', styleguideMarkdown(settings.style, themes))}>
              Download STYLEGUIDE.md
            </button>
            <h3 className="ws-panel-h">Tips</h3>
            <ul className="ws-muted ws-small ws-tips">
              <li>Click any block on the canvas to edit its props, layout and story.</li>
              <li>Switch Style / Theme in the toolbar: the whole page restyles. Make your own in Themes.</li>
              <li>Select a row (or a block in it) to add blocks side by side.</li>
              <li>Pages are saved in this browser automatically.</li>
            </ul>
          </div>
        )}
      </aside>
    </div>
  )
}

function Outline({ blocks, selected, onSelect, onMove }) {
  if (!blocks.length) return <p className="ws-muted ws-small">No blocks yet.</p>
  const item = (b, depth) => (
    <div key={b.id}>
      <div className="ws-outline-item" data-depth={depth} aria-current={selected === b.id || undefined} onClick={() => onSelect(b.id)}>
        <span className="ws-outline-name">{b.kind === 'row' ? `Row (${b.children.length})` : byId[b.component]?.title ?? b.component}</span>
        <span className="ws-muted ws-small">{b.kind === 'row' ? '' : findStory(b)?.name}</span>
        <span className="ws-outline-btns">
          <button className="ws-icon-btn" title="Move up" onClick={(e) => (e.stopPropagation(), onMove(b.id, -1))}>
            ↑
          </button>
          <button className="ws-icon-btn" title="Move down" onClick={(e) => (e.stopPropagation(), onMove(b.id, 1))}>
            ↓
          </button>
        </span>
      </div>
      {b.kind === 'row' && b.children.map((c) => item(c, 1))}
    </div>
  )
  return <div className="ws-outline">{blocks.map((b) => item(b, 0))}</div>
}

function Library({ onInsert }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const query = q.trim().toLowerCase()
  const order = CATALOG.map((c) => c.category)
  const groups = order
    .map((cat) => ({ cat, items: components.filter((c) => c.category === cat && (!query || c.title.toLowerCase().includes(query) || cat.toLowerCase().includes(query))) }))
    .filter((g) => g.items.length)
  return (
    <div className="ws-library">
      <input className="ws-input" placeholder="Search components…" value={q} onChange={(e) => setQ(e.target.value)} />
      {groups.map((g) => (
        <div key={g.cat}>
          <div className="ws-nav-heading">{g.cat}</div>
          {g.items.map((c) => (
            <div key={c.id}>
              <button className="ws-lib-item" aria-expanded={open === c.id} onClick={() => setOpen(open === c.id ? null : c.id)}>
                {c.title} <span className="ws-muted">{c.stories.length}</span>
              </button>
              {open === c.id && (
                <div className="ws-lib-stories">
                  {c.stories.map((s) => (
                    <button key={s.key} className="ws-chip" onClick={() => onInsert(c.id, s.key)} title="Add this example as a block">
                      + {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function Inspector({ block, inRow, onChange, onRemove, onDuplicate, onMove, onWrap, onClose }) {
  const component = block.kind === 'story' ? byId[block.component] : null
  const story = block.kind === 'story' ? findStory(block) : null
  const setLayout = (k) => (v) => onChange({ layout: { ...block.layout, [k]: v } })
  return (
    <div className="ws-panel-body">
      <div className="ws-inspector-head">
        <h3 className="ws-panel-h">{block.kind === 'row' ? 'Row' : component?.title}</h3>
        <button className="ws-icon-btn" onClick={onClose} title="Deselect">
          ✕
        </button>
      </div>
      <div className="ws-row-btns">
        <button className="ws-btn" onClick={() => onMove(-1)}>
          ↑ Up
        </button>
        <button className="ws-btn" onClick={() => onMove(1)}>
          ↓ Down
        </button>
        <button className="ws-btn" onClick={onDuplicate}>
          Duplicate
        </button>
        {!inRow && block.kind === 'story' && (
          <button className="ws-btn" onClick={onWrap} title="Put this block in a row so you can add blocks beside it">
            Make row
          </button>
        )}
        <button className="ws-btn ws-btn-danger" onClick={onRemove}>
          Remove
        </button>
      </div>

      {component && (
        <>
          <label className="ws-field">
            <span>Example</span>
            <select
              className="ws-input"
              value={block.story}
              onChange={(e) => {
                const next = component.stories.find((s) => s.key === e.target.value)
                onChange({ story: next.key })
              }}
            >
              {component.stories.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.name}
                  {s.usesArgs ? ' (editable)' : ''}
                </option>
              ))}
            </select>
          </label>
          <h4 className="ws-panel-sub">Props</h4>
          {story?.usesArgs ? (
            <Controls component={component} args={block.args} setArgs={(args) => onChange({ args })} resetArgs={() => onChange({ args: defaultArgs(component.controls) })} />
          ) : (
            <p className="ws-muted ws-small">This example is fixed. Pick an "(editable)" example to change props.</p>
          )}
        </>
      )}

      {block.kind === 'row' && (
        <>
          <Seg label="Columns" value={String(block.columns)} onChange={(v) => onChange({ columns: Number(v) })} options={['1', '2', '3', '4'].map((n) => [n, n])} />
          <Seg label="Gap" value={String(block.gap)} onChange={(v) => onChange({ gap: Number(v) })} options={['12', '24', '40'].map((n) => [n, n])} />
        </>
      )}

      {!inRow && (
        <>
          <h4 className="ws-panel-sub">Section layout</h4>
          <div className="ws-layout-opts">
            {Object.entries(LAYOUT_OPTIONS).map(([k, opts]) => (
              <Seg key={k} label={k === 'pad' ? 'padding' : k === 'bg' ? 'background' : k} value={block.layout[k]} onChange={setLayout(k)} options={opts.map((o) => [o, o])} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
