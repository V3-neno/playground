import { useEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { useControllable, useKey } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { useFocusTrap, usePresence, useStableId } from '../_shared/overlay'
import '../_shared/surface.css'
import './CommandPalette.css'

/**
 * ⌘K-style launcher: a combobox input filtering a grouped listbox.
 * items: [{ id, label, group?, icon?, shortcut?, keywords?, onSelect? }]
 * `hotkey="k"` toggles it with Ctrl/⌘+K. `inline` renders it statically open (previews, embedded search).
 */
export function CommandPalette({
  items = [],
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  placeholder = 'Type a command or search…',
  emptyText = 'No results',
  hotkey,
  inline = false,
  className,
}) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const { mounted, state } = usePresence(inline || open, 200)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const panel = useRef(null)
  const input = useRef(null)
  const list = useRef(null)
  const id = useStableId('ui-cmdk')
  const fx = useFx()

  const results = useMemo(() => rank(items, query), [items, query])
  const groups = useMemo(() => {
    const out = []
    results.forEach((r, i) => {
      const g = r.item.group ?? ''
      let bucket = out.find((b) => b.name === g)
      if (!bucket) out.push((bucket = { name: g, rows: [] }))
      bucket.rows.push({ ...r, index: i })
    })
    return out
  }, [results])
  // Render order (grouped) can differ from rank order, so navigate by rendered position.
  const order = groups.flatMap((g) => g.rows.map((r) => r.index))
  const activeIndex = order[Math.min(active, order.length - 1)]

  useEffect(() => setActive(0), [query])
  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    if (!hotkey || inline) return
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === hotkey) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [hotkey, inline, setOpen])

  useKey('Escape', () => setOpen(false), open && !inline)
  useFocusTrap(panel, open && mounted && !inline, input)

  // Keep the active option visible by scrolling the list only (scrollIntoView would also scroll the page).
  useEffect(() => {
    const box = list.current
    const el = box?.querySelector('[aria-selected="true"]')
    if (!el) return
    const top = el.offsetTop // the list is position: relative, so this is relative to it
    if (top < box.scrollTop) box.scrollTop = top - 28
    else if (top + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = top + el.offsetHeight - box.clientHeight + 4
  }, [active, query])

  const choose = (r, el) => {
    if (!r) return
    if (fx && el) burst(el, { count: 22, spread: 110 })
    r.item.onSelect?.(r.item)
    onSelect?.(r.item)
    if (!inline) setTimeout(() => setOpen(false), fx ? 220 : 0)
  }

  const onKeyDown = (e) => {
    const n = order.length
    if (!n) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % n)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a - 1 + n) % n)
    } else if (e.key === 'Home' && e.ctrlKey) {
      setActive(0)
    } else if (e.key === 'End' && e.ctrlKey) {
      setActive(n - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(results[activeIndex], list.current?.querySelector('[aria-selected="true"]'))
    }
  }

  if (!mounted) return null

  const box = (
    <div
      ref={panel}
      role={inline ? undefined : 'dialog'}
      aria-modal={inline ? undefined : true}
      aria-label={inline ? undefined : 'Command palette'}
      className={cx('ui-cmdk__panel', 'ui-ov-surface', className)}
    >
      <div className="ui-cmdk__search">
        <Icon name="search" size={18} />
        <input
          ref={input}
          className="ui-cmdk__input"
          role="combobox"
          aria-expanded="true"
          aria-controls={`${id}-list`}
          aria-activedescendant={results.length ? `${id}-opt-${activeIndex}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {!inline && <kbd className="ui-cmdk__kbd">Esc</kbd>}
      </div>
      <div ref={list} id={`${id}-list`} role="listbox" aria-label="Results" className="ui-cmdk__list">
        {!results.length && (
          <div className="ui-cmdk__empty">
            <span className="ui-cmdk__empty-icon" aria-hidden>
              <Icon name="search" size={22} />
            </span>
            {query ? `${emptyText} for “${query}”` : emptyText}
          </div>
        )}
        {groups.map((g) => (
          <div key={g.name} role="group" aria-label={g.name || undefined} className="ui-cmdk__group">
            {g.name && <div className="ui-cmdk__group-label" aria-hidden>{g.name}</div>}
            {g.rows.map((r) => {
              const selected = r.index === activeIndex
              return (
                <div
                  key={r.item.id ?? r.item.label}
                  id={`${id}-opt-${r.index}`}
                  role="option"
                  aria-selected={selected}
                  className="ui-cmdk__option"
                  onPointerMove={() => !selected && setActive(order.indexOf(r.index))}
                  onClick={(e) => choose(r, e.currentTarget)}
                >
                  {r.item.icon && (
                    <span className="ui-cmdk__icon">
                      <Icon name={r.item.icon} size={16} />
                    </span>
                  )}
                  <span className="ui-cmdk__label">
                    <Highlight text={r.item.label} hits={r.hits} />
                  </span>
                  {r.item.shortcut && (
                    <span className="ui-cmdk__shortcut">
                      {r.item.shortcut.split(' ').map((k) => (
                        <kbd key={k} className="ui-cmdk__kbd">{k}</kbd>
                      ))}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="ui-cmdk__foot" aria-hidden>
        <span><kbd className="ui-cmdk__kbd">↑</kbd><kbd className="ui-cmdk__kbd">↓</kbd> navigate</span>
        <span><kbd className="ui-cmdk__kbd">↵</kbd> select</span>
      </div>
    </div>
  )

  if (inline) return <div className="ui-cmdk ui-cmdk--inline" data-state="open">{box}</div>

  return (
    <div className="ui-cmdk" data-state={state}>
      <div className="ui-ov-backdrop" aria-hidden onClick={() => setOpen(false)} />
      {box}
    </div>
  )
}

function Highlight({ text, hits }) {
  if (!hits?.length) return text
  const set = new Set(hits)
  const parts = []
  let buf = ''
  let on = false
  ;[...text].forEach((ch, i) => {
    const hit = set.has(i)
    if (hit !== on && buf) {
      parts.push(on ? <mark key={i}>{buf}</mark> : buf)
      buf = ''
    }
    on = hit
    buf += ch
  })
  if (buf) parts.push(on ? <mark key="end">{buf}</mark> : buf)
  return parts
}

/** Subsequence match with a bonus for word starts and runs; keyword hits count but don't highlight. */
function rank(items, query) {
  const q = query.trim().toLowerCase()
  if (!q) return items.map((item) => ({ item, hits: [], score: 0 }))
  const out = []
  for (const item of items) {
    const label = item.label.toLowerCase()
    let score = 0
    const hits = []
    let from = 0
    for (const ch of q) {
      if (ch === ' ') continue
      const at = label.indexOf(ch, from)
      if (at === -1) {
        hits.length = 0
        break
      }
      score += at === 0 || label[at - 1] === ' ' ? 3 : hits.length && hits[hits.length - 1] === at - 1 ? 2 : 1
      hits.push(at)
      from = at + 1
    }
    if (hits.length) {
      if (label.startsWith(q)) score += 5
      out.push({ item, hits, score })
    } else if (item.keywords?.some((k) => k.toLowerCase().includes(q))) {
      out.push({ item, hits: [], score: 0.5 })
    }
  }
  return out.sort((a, b) => b.score - a.score)
}
