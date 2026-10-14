// A tiny markdown renderer for the generated styleguides: headings, paragraphs, lists, tables, code, quotes.
import { Fragment } from 'react'

function inline(text) {
  const parts = []
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const t = m[0]
    parts.push(t.startsWith('`') ? <code key={m.index}>{t.slice(1, -1)}</code> : <strong key={m.index}>{t.slice(2, -2)}</strong>)
    last = m.index + t.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

const cells = (line) =>
  line
    .replace(/^\||\|$/g, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, '|'))

export function Markdown({ source }) {
  const lines = source.split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const body = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++])
      i++
      out.push(<pre key={i}><code>{body.join('\n')}</code></pre>)
      continue
    }
    const h = line.match(/^(#{1,4})\s+(.*)/)
    if (h) {
      const Tag = `h${h[1].length}`
      const id = h[2].toLowerCase().replace(/[^a-z0-9]+/g, '-')
      out.push(<Tag key={i} id={id}>{inline(h[2])}</Tag>)
      i++
      continue
    }
    if (line.startsWith('|')) {
      const rows = []
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++])
      const [head, , ...body] = rows
      out.push(
        <div key={i} className="md-table">
          <table>
            <thead>
              <tr>{cells(head).map((c, j) => <th key={j}>{inline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((r, k) => (
                <tr key={k}>{cells(r).map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }
    if (/^(\s*[-*]|\d+\.)\s/.test(line)) {
      const ordered = /^\d+\./.test(line)
      const items = []
      while (i < lines.length && /^(\s*[-*]|\d+\.)\s/.test(lines[i])) items.push(lines[i++].replace(/^(\s*[-*]|\d+\.)\s+/, ''))
      const List = ordered ? 'ol' : 'ul'
      out.push(
        <List key={i}>
          {items.map((t, k) => (
            <li key={k}>{t.startsWith('[ ] ') ? <><input type="checkbox" disabled /> {inline(t.slice(4))}</> : inline(t)}</li>
          ))}
        </List>,
      )
      continue
    }
    if (line.startsWith('>')) {
      const body = []
      while (i < lines.length && lines[i].startsWith('>')) body.push(lines[i++].replace(/^>\s?/, ''))
      out.push(<blockquote key={i}>{inline(body.join(' '))}</blockquote>)
      continue
    }
    if (!line.trim()) {
      i++
      continue
    }
    const para = []
    while (i < lines.length && lines[i].trim() && !/^(#|```|\||>|\s*[-*]\s|\d+\.\s)/.test(lines[i])) para.push(lines[i++])
    out.push(<p key={i}>{para.map((t, k) => <Fragment key={k}>{k > 0 && ' '}{inline(t)}</Fragment>)}</p>)
  }
  return <div className="md">{out}</div>
}
