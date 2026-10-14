import { useState } from 'react'
import { Pagination } from './Pagination'

export default {
  title: 'Pagination',
  category: 'Navigation',
  status: 'ready',
  description:
    'Numbered pagination with ellipsis gaps and a sliding active marker. ←/→/Home/End work anywhere inside it. Squeezed below ~420px it switches to "Page 3 of 12". In Extra the marker is a squishy neon orb and the last page earns confetti.',
  controls: {
    count: { type: 'range', min: 1, max: 40, default: 12 },
    siblings: { type: 'range', min: 0, max: 3, default: 1 },
    variant: { type: 'radio', options: ['default', 'outline', 'simple'], default: 'default' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    labels: { type: 'boolean', default: false },
  },
}

export const Compact = () => <Pagination count={5} defaultPage={2} size="sm" />

export const Playground = (args) => <Pagination key={args.count} {...args} defaultPage={Math.min(4, args.count)} />

export const Variants = () => (
  <div style={{ display: 'grid', gap: 22, width: '100%' }}>
    <Pagination count={20} defaultPage={7} />
    <Pagination count={20} defaultPage={7} variant="outline" labels />
    <Pagination count={20} defaultPage={7} variant="simple" />
  </div>
)

export const Controlled = () => {
  const [page, setPage] = useState(1)
  return (
    <div style={{ display: 'grid', gap: 14, justifyItems: 'center', width: '100%' }}>
      <div style={{ color: 'var(--ui-text-muted)' }}>
        Showing results {(page - 1) * 10 + 1}–{page * 10} of 80
      </div>
      <Pagination count={8} page={page} onChange={setPage} labels />
    </div>
  )
}

export const Narrow = () => (
  <div style={{ width: 300, border: '1px dashed var(--ui-border)', padding: 12 }}>
    <Pagination count={30} defaultPage={12} />
  </div>
)
