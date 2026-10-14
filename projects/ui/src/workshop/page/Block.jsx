import './block.css'

/** Page section wrapper: width (full | wide | narrow), padding (none | sm | md | lg), align, background. */
export function Block({ width = 'wide', pad = 'md', align = 'stretch', bg = 'none', children }) {
  return (
    <section className="page-block" data-width={width} data-pad={pad} data-align={align} data-bg={bg}>
      <div className="page-block__inner">{children}</div>
    </section>
  )
}

/** Side-by-side blocks that wrap on narrow screens. */
export function Row({ columns = 2, gap = 24, children }) {
  return (
    <div className="page-row" style={{ '--cols': columns, '--gap': gap + 'px' }}>
      {children}
    </div>
  )
}
