import { useEffect, useState } from 'react'
import { avatar } from '../../../lib/placeholder'
import { Button } from '../../actions/Button/Button'
import { Skeleton } from './Skeleton'

export default {
  title: 'Skeleton',
  category: 'Feedback',
  status: 'ready',
  description:
    'Loading placeholders: lines of text, circles and blocks. They are aria-hidden; mark the loading region with aria-busy. Each style has its own idea of "loading": shimmer, breathing, marching hatches, blinking blocks, holographic foil.',
  controls: {
    lines: { type: 'range', min: 1, max: 8, default: 3 },
    circle: { type: 'boolean', default: true },
    animate: { type: 'boolean', default: true },
  },
}

const card = {
  width: 'min(300px, 100%)',
  padding: 16,
  border: 'var(--ui-border-width) solid var(--ui-raised-border)',
  borderRadius: 'var(--ui-radius-lg)',
  background: 'var(--ui-raised)',
  boxShadow: 'var(--ui-shadow-sm)',
}

export const Card = () => (
  <div style={{ ...card, width: 'min(240px, 100%)', display: 'flex', gap: 12, alignItems: 'center' }} aria-busy="true">
    <Skeleton circle width={40} />
    <Skeleton lines={2} />
  </div>
)

export const Playground = (args) => (
  <div style={{ ...card, display: 'flex', gap: 14 }} aria-busy="true">
    {args.circle && <Skeleton circle width={44} animate={args.animate} />}
    <Skeleton lines={args.lines} animate={args.animate} />
  </div>
)

export const MediaCard = () => (
  <div style={{ ...card, padding: 0, overflow: 'hidden' }} aria-busy="true">
    <Skeleton height={150} radius={0} />
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <Skeleton width="70%" height={20} />
      <Skeleton lines={3} />
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Skeleton width={84} height={32} radius="var(--ui-radius-md)" />
        <Skeleton width={84} height={32} radius="var(--ui-radius-md)" />
      </div>
    </div>
  </div>
)

export const List = () => (
  <div style={{ ...card, width: 'min(380px, 100%)', display: 'grid', gap: 16 }} aria-busy="true">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Skeleton circle width={36} />
        <div style={{ flex: 1, display: 'grid', gap: 6 }}>
          <Skeleton width={`${50 + ((i * 17) % 35)}%`} height={12} />
          <Skeleton width="35%" height={10} />
        </div>
        <Skeleton width={48} height={22} radius="var(--ui-radius-full)" />
      </div>
    ))}
  </div>
)

export const LoadingToContent = () => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (loaded) return
    const t = setTimeout(() => setLoaded(true), 1800)
    return () => clearTimeout(t)
  }, [loaded])
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <div style={{ ...card, display: 'flex', gap: 12, alignItems: 'center', minHeight: 82 }} aria-busy={!loaded}>
        {loaded ? (
          <>
            <img src={avatar('Maya Chen')} alt="" width={44} height={44} style={{ borderRadius: '50%' }} />
            <div>
              <strong>Maya Chen</strong>
              <div style={{ color: 'var(--ui-text-muted)', fontSize: '0.9em' }}>Designed the new onboarding flow</div>
            </div>
          </>
        ) : (
          <>
            <Skeleton circle width={44} />
            <Skeleton lines={2} />
          </>
        )}
      </div>
      <Button size="sm" variant="outline" icon="refresh" onClick={() => setLoaded(false)}>
        Reload
      </Button>
    </div>
  )
}
