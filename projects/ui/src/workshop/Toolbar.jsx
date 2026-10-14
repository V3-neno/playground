import { WIDTHS } from './Stage'
import { allStyles, useThemes } from './themes'

/** Canvas settings shared by every view. `mode` hides what doesn't apply (compare / canvas outside Components). */
export function Toolbar({ settings, setSettings, mode = 'components', children }) {
  const { themes } = useThemes()
  const set = (k) => (v) => setSettings((s) => ({ ...s, [k]: v }))
  const styles = allStyles(themes)
  const builtIn = styles.filter((s) => !s.custom)
  const custom = styles.filter((s) => s.custom)
  const comparing = mode === 'components' && settings.compare
  return (
    <header className="ws-toolbar">
      <label className="ws-tool">
        <span>Style</span>
        <select value={settings.style} disabled={comparing} onChange={(e) => set('style')(e.target.value)}>
          {builtIn.map((s) => (
            <option key={s.id} value={s.id} title={s.description}>
              {s.name}
            </option>
          ))}
          {custom.length > 0 && (
            <optgroup label="Custom themes">
              {custom.map((s) => (
                <option key={s.id} value={s.id} title={s.description}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </label>
      <Seg label="Theme" value={settings.theme} onChange={set('theme')} options={[['light', '☀ Light'], ['dark', '☾ Dark']]} />
      <Seg label="Width" value={settings.width} onChange={set('width')} options={WIDTHS.map((w) => [w.id, w.label])} />
      {mode === 'components' && (
        <>
          <Seg label="Canvas" value={settings.background} onChange={set('background')} options={[['theme', 'Theme'], ['checker', 'Checker']]} />
          <label className="ws-tool ws-check" title="Render every story once per style">
            <input type="checkbox" checked={settings.compare} onChange={(e) => set('compare')(e.target.checked)} />
            <span>Compare styles</span>
          </label>
        </>
      )}
      <label className="ws-tool ws-check">
        <input type="checkbox" checked={settings.reducedMotion} onChange={(e) => set('reducedMotion')(e.target.checked)} />
        <span>Reduce motion</span>
      </label>
      {children}
    </header>
  )
}

export function Seg({ label, value, onChange, options }) {
  return (
    <div className="ws-tool">
      {label && <span>{label}</span>}
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
