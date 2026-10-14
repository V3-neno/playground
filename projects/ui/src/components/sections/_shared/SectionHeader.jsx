import { useUI } from '../../../lib/ui-context'
import './section.css'

/** Wraps `highlight` (a substring of text) in a gradient/marker span. */
export function Highlight({ text, highlight }) {
  if (!highlight || !text?.includes(highlight)) return text
  const i = text.indexOf(highlight)
  return (
    <>
      {text.slice(0, i)}
      <span className="ui-sec__hl ui-gradient-text">{highlight}</span>
      {text.slice(i + highlight.length)}
    </>
  )
}

export function SectionHeader({ eyebrow, title, highlight, lead, align = 'center', as: H = 'h2', id }) {
  if (!eyebrow && !title && !lead) return null
  return (
    <header className="ui-sec__head" data-align={align}>
      {eyebrow && <div className="ui-sec__eyebrow">{eyebrow}</div>}
      {title && (
        <H className="ui-sec__title ui-heading" id={id}>
          <Highlight text={title} highlight={highlight} />
        </H>
      )}
      {lead && <p className="ui-sec__lead">{lead}</p>}
    </header>
  )
}

/** Floating gradient blobs behind a section — only rendered in the Extra style. */
export function Blobs() {
  const { style } = useUI()
  if (style !== 'extra') return null
  return (
    <div className="ui-sec-blobs" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  )
}
