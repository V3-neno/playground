import { useMemo, useState } from 'react'
import { STYLES } from '../styles'
import { downloadText } from './exporter'
import { PageView } from './page/PageView'
import { TEMPLATES, templatePage } from './page/model'
import { WIDTHS } from './Stage'
import { Seg, Toolbar } from './Toolbar'
import { EASES, FONTS, TOKEN_GROUPS, isModeToken, newThemeId, readTokens, resolveStyle, styleName, themeCss, toHex, useThemes } from './themes'

/**
 * #/themes: pick a style, customise its tokens live on a real page, save as a custom theme.
 * Custom themes show up in every style picker, the builder, compare mode and the styleguides.
 */
export function ThemeStudio({ settings, setSettings }) {
  const { themes, setThemes } = useThemes()
  const [preview, setPreview] = useState(TEMPLATES[0].id)
  const [open, setOpen] = useState('Colours')
  const custom = themes.find((t) => t.id === settings.style)
  const { base, vars } = resolveStyle(settings.style, settings.theme, themes)
  const varsKey = JSON.stringify(vars ?? {})
  const values = useMemo(() => readTokens(base, settings.theme, vars), [base, settings.theme, varsKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const page = useMemo(() => templatePage(TEMPLATES.find((t) => t.id === preview)), [preview])
  const width = WIDTHS.find((w) => w.id === settings.width)?.px

  const setStyle = (id) => setSettings((s) => ({ ...s, style: id }))
  const update = (patch) => setThemes((all) => all.map((t) => (t.id === custom.id ? { ...t, ...patch } : t)))

  const createFrom = (baseId, from) => {
    const t = {
      id: newThemeId(),
      name: from ? `${from.name} copy` : `My ${styleName(baseId).replace(/\s*✨/, '')}`,
      base: baseId,
      shared: { ...from?.shared },
      light: { ...from?.light },
      dark: { ...from?.dark },
    }
    setThemes((all) => [...all, t])
    setStyle(t.id)
  }

  const setToken = (name, type, value) => {
    if (!custom) return
    const bucket = isModeToken(type) ? settings.theme : 'shared'
    const next = { ...custom[bucket] }
    if (value == null || value === '') delete next[name]
    else next[name] = value
    update({ [bucket]: next })
  }
  const overridden = (name, type) => custom?.[isModeToken(type) ? settings.theme : 'shared']?.[name] != null

  return (
    <div className="ws-studio">
      <aside className="ws-studio-side">
        <div className="ws-side-title">Style</div>
        <select className="ws-input" value={settings.style} onChange={(e) => setStyle(e.target.value)}>
          {STYLES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
          {themes.length > 0 && (
            <optgroup label="Custom themes">
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        {!custom ? (
          <div className="ws-studio-cta">
            <p className="ws-muted">
              <strong>{styleName(settings.style)}</strong> is a built-in style. Customise it to create your own theme: it starts identical, and every token is editable.
            </p>
            <button className="ws-btn ws-btn-primary" onClick={() => createFrom(base)}>
              Customise {styleName(base)}
            </button>
          </div>
        ) : (
          <>
            <label className="ws-field">
              <span>Name</span>
              <input className="ws-input" value={custom.name} onChange={(e) => update({ name: e.target.value })} />
            </label>
            <div className="ws-muted ws-small">
              Based on {styleName(custom.base)} · editing <strong>{settings.theme}</strong> colours (switch Theme in the toolbar for {settings.theme === 'light' ? 'dark' : 'light'})
            </div>
            <div className="ws-row-btns">
              <button className="ws-btn" onClick={() => createFrom(custom.base, custom)}>
                Duplicate
              </button>
              <button className="ws-btn" onClick={() => update({ shared: {}, light: {}, dark: {} })}>
                Reset all
              </button>
              <button
                className="ws-btn ws-btn-danger"
                onClick={() => {
                  setThemes((all) => all.filter((t) => t.id !== custom.id))
                  setStyle(custom.base)
                }}
              >
                Delete
              </button>
            </div>
          </>
        )}

        <div className="ws-tokens" data-locked={!custom || undefined}>
          {TOKEN_GROUPS.map((g) => (
            <section key={g.group} className="ws-token-group">
              <button className="ws-token-head" aria-expanded={open === g.group} onClick={() => setOpen(open === g.group ? null : g.group)}>
                {g.group}
                <span className="ws-muted">{g.tokens.filter(([n, , t]) => overridden(n, t)).length || ''}</span>
              </button>
              {open === g.group &&
                g.tokens.map(([name, label, type, opts]) => (
                  <TokenRow
                    key={name}
                    name={name}
                    label={label}
                    type={type}
                    opts={opts}
                    value={values[name]}
                    changed={overridden(name, type)}
                    disabled={!custom}
                    onChange={(v) => setToken(name, type, v)}
                  />
                ))}
            </section>
          ))}
        </div>

        <div className="ws-row-btns ws-studio-actions">
          <a className="ws-btn" href={`#/styleguide/${settings.style}`}>
            Styleguide
          </a>
          {custom && (
            <button className="ws-btn" onClick={() => downloadText('theme.css', themeCss(custom), 'text/css')}>
              Export theme.css
            </button>
          )}
          <a className="ws-btn" href="#/pages">
            Build a page
          </a>
        </div>
      </aside>

      <main className="ws-main">
        <Toolbar settings={settings} setSettings={setSettings} mode="studio">
          <Seg label="Preview" value={preview} onChange={setPreview} options={TEMPLATES.map((t) => [t.id, t.name])} />
        </Toolbar>
        <div className="ws-content ws-canvas">
          <PageView key={preview} page={page} settings={settings} width={width} />
        </div>
      </main>
    </div>
  )
}

const px = (v) => parseFloat(v) || 0

function TokenRow({ name, label, type, opts = {}, value, changed, disabled, onChange }) {
  let input
  if (type === 'color') {
    const hex = toHex(value)
    input = (
      <span className="ws-token-color">
        <input type="color" value={hex ?? '#000000'} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
        <input className="ws-input" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} spellCheck={false} />
      </span>
    )
  } else if (type === 'length' || type === 'ms' || type === 'number') {
    const unit = type === 'length' ? 'px' : type === 'ms' ? 'ms' : ''
    const num = type === 'ms' ? (value.endsWith('ms') ? px(value) : px(value) * 1000) : px(value)
    input = (
      <span className="ws-range">
        <input
          type="range"
          min={opts.min ?? 0}
          max={opts.max ?? 100}
          step={opts.step ?? (type === 'number' ? 0.01 : 1)}
          value={num}
          disabled={disabled}
          onChange={(e) => onChange(`${e.target.value}${unit}`)}
        />
        <output>{`${Math.round(num * 100) / 100}${unit}`}</output>
      </span>
    )
  } else if (type === 'font' || type === 'ease') {
    const list = type === 'font' ? FONTS : EASES
    const known = list.find(([, v]) => norm(v) === norm(value))
    input = (
      <select className="ws-input" value={known ? known[1] : '__custom'} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        {!known && <option value="__custom">{value || '(inherit)'}</option>}
        {list.map(([n, v]) => (
          <option key={n} value={v}>
            {n}
          </option>
        ))}
      </select>
    )
  } else if (type === 'select') {
    input = (
      <select className="ws-input" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        {!opts.options.includes(value) && <option>{value}</option>}
        {opts.options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    )
  } else {
    input = <textarea className="ws-input" rows={2} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} spellCheck={false} />
  }
  return (
    <div className="ws-token" data-type={type}>
      <div className="ws-token-label">
        <span title={name}>{label}</span>
        {changed && (
          <button className="ws-link" onClick={() => onChange(null)} title="Back to the base style's value">
            reset
          </button>
        )}
      </div>
      {input}
    </div>
  )
}

const norm = (v) => String(v).replace(/\s+/g, '').replace(/"/g, "'").toLowerCase()
