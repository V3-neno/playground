import { PEOPLE } from '../../../lib/placeholder'
import { Avatar } from '../Avatar/Avatar'
import { Badge } from '../Badge/Badge'
import { Table } from './Table'

const STATUS_TONE = { Active: 'success', Invited: 'warning', Suspended: 'danger' }
const MEMBERS = PEOPLE.map((p, i) => ({
  id: p.email,
  name: p.name,
  avatar: p.avatar,
  email: p.email,
  role: p.role,
  status: ['Active', 'Active', 'Invited', 'Active', 'Suspended', 'Active'][i],
  seats: [12, 3, 1, 8, 0, 5][i],
  spend: [1840.5, 320, 0, 990.25, 120, 610][i],
}))

const money = (n) => n.toLocaleString('en', { style: 'currency', currency: 'USD' })

const COLUMNS = [
  {
    key: 'name',
    label: 'Member',
    sortable: true,
    render: (r) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <Avatar src={r.avatar} name={r.name} size="sm" />
        <span>
          {r.name}
          <span style={{ display: 'block', fontSize: '0.85em', color: 'var(--ui-text-muted)', fontWeight: 400 }}>{r.email}</span>
        </span>
      </span>
    ),
  },
  { key: 'role', label: 'Role', sortable: true },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (r) => (
      <Badge tone={STATUS_TONE[r.status]} dot>
        {r.status}
      </Badge>
    ),
  },
  { key: 'seats', label: 'Seats', sortable: true, align: 'right' },
  { key: 'spend', label: 'Spend', sortable: true, align: 'right', render: (r) => money(r.spend) },
]

const ORDERS = Array.from({ length: 30 }, (_, i) => ({
  id: `#${4800 + i}`,
  customer: PEOPLE[i % PEOPLE.length].name,
  date: `2026-10-${String(1 + (i % 14)).padStart(2, '0')}`,
  items: 1 + ((i * 7) % 5),
  total: Math.round(((i * 37) % 400) + 19.99 * (1 + (i % 3))) + 0.5,
}))

export default {
  title: 'Table',
  category: 'Data display',
  status: 'ready',
  description:
    'Sortable columns (click a header to cycle asc → desc → off, with aria-sort), row selection with an indeterminate select-all, sticky header, striped/dense modes, and a stacked card layout below 560px container width. In Extra, rows cascade in on every sort and selection glows.',
  controls: {
    selectable: { type: 'boolean', default: true },
    striped: { type: 'boolean', default: false },
    dense: { type: 'boolean', default: false },
    stackOnMobile: { type: 'boolean', default: true, label: 'stack on narrow widths' },
  },
}

export const Overview = () => (
  <div style={{ width: 200 }}>
    <Table
      dense
      stackOnMobile={false}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'seats', label: 'Seats', align: 'right' },
      ]}
      rows={MEMBERS.slice(0, 3)}
      style={{ fontSize: 12 }}
    />
  </div>
)

export const Playground = (args) => <Table {...args} columns={COLUMNS} rows={MEMBERS} defaultSelected={[MEMBERS[1].id]} defaultSort={{ key: 'spend', dir: 'desc' }} />
Playground.layout = 'padded'

export const StickyHeader = () => (
  <Table
    stickyHeader
    striped
    dense
    maxHeight={300}
    caption="Recent orders"
    columns={[
      { key: 'id', label: 'Order', sortable: true },
      { key: 'customer', label: 'Customer', sortable: true },
      { key: 'date', label: 'Date', sortable: true },
      { key: 'items', label: 'Items', sortable: true, align: 'right' },
      { key: 'total', label: 'Total', sortable: true, align: 'right', render: (r) => money(r.total) },
    ]}
    rows={ORDERS}
  />
)
StickyHeader.layout = 'padded'
StickyHeader.storyName = 'Sticky header + scroll'

export const Narrow = () => (
  // The wrapper is a size container, so the table stacks here even on a wide canvas.
  <div style={{ width: 360, containerType: 'inline-size' }}>
    <Table selectable columns={COLUMNS.slice(0, 4)} rows={MEMBERS.slice(0, 3)} />
  </div>
)
Narrow.storyName = 'Stacked (narrow)'

export const Empty = () => <Table columns={COLUMNS} rows={[]} emptyText="No members yet — invite someone." />
Empty.layout = 'padded'
