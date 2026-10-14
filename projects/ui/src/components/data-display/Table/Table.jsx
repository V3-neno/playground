import { useEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useControllable } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import './Table.css'

function Checkbox({ checked, indeterminate = false, onChange, label }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <label className="ui-table__check">
      <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label} />
      <span className="ui-table__box" aria-hidden>
        <Icon name={indeterminate ? 'minus' : 'check'} size={12} strokeWidth={3} />
      </span>
    </label>
  )
}

const compare = (a, b) => {
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

/**
 * Data table with sortable columns, optional row selection, sticky header and a stacked layout on
 * narrow containers (each row becomes a card, cells get their column label).
 *
 * columns: [{ key, label, sortable?, align?: 'left'|'right'|'center', width?, render?(row), sortValue?(row) }]
 * rows: [{ id, ...data }]
 */
export function Table({
  columns = [],
  rows = [],
  rowKey = 'id',
  selectable = false,
  selected,
  defaultSelected = [],
  onSelectedChange,
  defaultSort,
  striped = false,
  dense = false,
  stickyHeader = false,
  maxHeight,
  stackOnMobile = true,
  caption,
  emptyText = 'No rows',
  className,
  ...props
}) {
  const fx = useFx()
  const [sel, setSel] = useControllable(selected, defaultSelected, onSelectedChange)
  const [sort, setSort] = useState(defaultSort ?? null) // { key, dir: 'asc' | 'desc' }

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    const get = col?.sortValue ?? ((r) => r[sort.key])
    const out = [...rows].sort((a, b) => compare(get(a), get(b)))
    return sort.dir === 'desc' ? out.reverse() : out
  }, [rows, columns, sort])

  const ids = rows.map((r) => r[rowKey])
  const allSelected = ids.length > 0 && ids.every((id) => sel.includes(id))
  const someSelected = !allSelected && ids.some((id) => sel.includes(id))

  const toggleSort = (key, e) => {
    setSort((s) => (s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null))
    if (fx) sparkle(e.currentTarget, { count: 5 })
  }
  const toggleRow = (id) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id])
  const toggleAll = () => setSel(allSelected ? [] : ids)

  return (
    <div
      className={cx(
        'ui-table-wrap',
        stickyHeader && 'ui-table-wrap--sticky',
        stackOnMobile && 'ui-table-wrap--stack',
        dense && 'ui-table-wrap--dense',
        striped && 'ui-table-wrap--striped',
        className,
      )}
      style={maxHeight ? { maxHeight } : undefined}
      tabIndex={maxHeight ? 0 : undefined}
      role={maxHeight ? 'region' : undefined}
      aria-label={maxHeight ? (typeof caption === 'string' ? caption : 'Table') : undefined}
      {...props}
    >
      <table className="ui-table">
        {caption && <caption className="ui-table__caption">{caption}</caption>}
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className="ui-table__select">
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} label="Select all rows" />
              </th>
            )}
            {columns.map((c) => {
              const dir = sort?.key === c.key ? sort.dir : null
              return (
                <th
                  key={c.key}
                  scope="col"
                  style={{ width: c.width, textAlign: c.align }}
                  aria-sort={c.sortable ? (dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none') : undefined}
                  className={cx(c.sortable && 'is-sortable', dir && 'is-sorted')}
                >
                  {c.sortable ? (
                    <button type="button" className="ui-table__sort" onClick={(e) => toggleSort(c.key, e)}>
                      <span>{c.label}</span>
                      <span className={cx('ui-table__sort-icon', dir && `is-${dir}`)} aria-hidden>
                        <Icon name={dir === 'desc' ? 'arrow-down' : 'arrow-up'} size={13} strokeWidth={2.4} />
                      </span>
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        {/* keyed by sort so rows remount (and the Extra cascade replays) on every sort */}
        <tbody key={sort ? `${sort.key}-${sort.dir}` : 'unsorted'}>
          {sorted.length === 0 && (
            <tr className="ui-table__empty">
              <td colSpan={columns.length + (selectable ? 1 : 0)}>{emptyText}</td>
            </tr>
          )}
          {sorted.map((row, i) => {
            const id = row[rowKey]
            const isSel = sel.includes(id)
            return (
              <tr key={id} className={cx(isSel && 'is-selected')} style={{ '--_i': i }}>
                {selectable && (
                  <td className="ui-table__select">
                    <Checkbox checked={isSel} onChange={() => toggleRow(id)} label={`Select row ${i + 1}`} />
                  </td>
                )}
                {columns.map((c, ci) => (
                  <td key={c.key} data-label={c.label} style={{ textAlign: c.align }} className={cx(ci === 0 && 'is-primary')}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
