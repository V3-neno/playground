import { useEffect, useState } from 'react'
import { loadFile } from './registry'

const TABS = ['Controls', 'Code', 'Notes']

export function Panel({ component, args, setArgs, resetArgs }) {
  const [tab, setTab] = useState('Controls')
  return (
    <aside className="ws-panel">
      <div className="ws-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className="ws-tab" onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="ws-panel-body">
        {tab === 'Controls' && <Controls component={component} args={args} setArgs={setArgs} resetArgs={resetArgs} />}
        {tab === 'Code' && <Code key={component.id} component={component} />}
        {tab === 'Notes' && <Notes component={component} />}
      </div>
    </aside>
  )
}

function Controls({ component, args, setArgs, resetArgs }) {
  const entries = Object.entries(component.controls)
  if (!entries.length) return <p className="ws-muted">No controls. Add a <code>controls</code> object to the story file's default export.</p>
  const set = (k, v) => setArgs({ ...args, [k]: v })
  return (
    <div className="ws-controls">
      {entries.map(([key, c]) => (
        <label key={key} className="ws-control" data-type={c.type}>
          <span className="ws-control-label">{c.label ?? key}</span>
          <ControlInput control={c} value={args[key]} onChange={(v) => set(key, v)} />
        </label>
      ))}
      <button className="ws-btn" onClick={resetArgs}>
        Reset
      </button>
    </div>
  )
}

function ControlInput({ control: c, value, onChange }) {
  switch (c.type) {
    case 'boolean':
      return <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
    case 'number':
      return <input type="number" value={value} min={c.min} max={c.max} step={c.step} onChange={(e) => onChange(Number(e.target.value))} />
    case 'range':
      return (
        <span className="ws-range">
          <input type="range" value={value} min={c.min ?? 0} max={c.max ?? 100} step={c.step ?? 1} onChange={(e) => onChange(Number(e.target.value))} />
          <output>{value}</output>
        </span>
      )
    case 'select':
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {c.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      )
    case 'radio':
      return (
        <span className="ws-seg">
          {c.options.map((o) => (
            <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)}>
              {o}
            </button>
          ))}
        </span>
      )
    case 'color':
      return <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
    case 'textarea':
      return <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
    default:
      return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
  }
}

function Code({ component }) {
  const [file, setFile] = useState(component.files[0])
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    let live = true
    if (file) loadFile(file).then((t) => live && setText(t))
    return () => {
      live = false
    }
  }, [file])
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <div className="ws-code">
      <div className="ws-code-files">
        {component.files.map((f) => (
          <button key={f} className="ws-file" aria-pressed={f === file} onClick={() => setFile(f)}>
            {f.split('/').pop()}
          </button>
        ))}
        <button className="ws-btn ws-copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{text}</code>
      </pre>
    </div>
  )
}

function Notes({ component }) {
  return (
    <div className="ws-notes">
      <p>{component.description || <span className="ws-muted">No description yet.</span>}</p>
      <dl>
        <dt>Status</dt>
        <dd>
          <span className="ws-status" data-status={component.status}>
            {component.status}
          </span>
        </dd>
        <dt>Category</dt>
        <dd>{component.category}</dd>
        <dt>Stories</dt>
        <dd>{component.stories.length}</dd>
        <dt>Folder</dt>
        <dd>
          <code>{component.files[0]?.replace(/^\.\.\//, 'src/').replace(/\/[^/]+$/, '/')}</code>
        </dd>
      </dl>
    </div>
  )
}
