import { PEOPLE } from '../../../lib/placeholder'
import { Avatar, AvatarGroup } from './Avatar'

const row = { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }

export default {
  title: 'Avatar',
  category: 'Data display',
  status: 'ready',
  description:
    'Picture or initials with presence status, plus AvatarGroup for overlapping stacks. In Extra, rings become a spinning gradient halo and hovering throws sparkles.',
  controls: {
    name: { type: 'text', default: 'Maya Chen' },
    image: { type: 'boolean', default: true },
    size: { type: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'xl' },
    shape: { type: 'radio', options: ['circle', 'rounded', 'square'], default: 'circle' },
    status: { type: 'select', options: ['', 'online', 'away', 'busy', 'offline'], default: 'online' },
    ring: { type: 'boolean', default: true },
  },
}

export const Overview = () => (
  <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
    <Avatar name="Maya Chen" src={PEOPLE[2].avatar} size="lg" status="online" ring />
    <AvatarGroup people={PEOPLE} max={4} size="sm" />
  </div>
)

export const Playground = ({ image, status, ...args }) => (
  <Avatar {...args} status={status || undefined} src={image ? PEOPLE.find((p) => p.name === args.name)?.avatar ?? PEOPLE[2].avatar : undefined} />
)

export const Sizes = () => (
  <div style={row}>
    {['xs', 'sm', 'md', 'lg', 'xl'].map((s) => (
      <Avatar key={s} size={s} name="Ada Lovelace" />
    ))}
  </div>
)

export const Status = () => (
  <div style={row}>
    {['online', 'away', 'busy', 'offline'].map((s, i) => (
      <Avatar key={s} size="lg" name={PEOPLE[i].name} src={PEOPLE[i].avatar} status={s} />
    ))}
  </div>
)

export const Shapes = () => (
  <div style={row}>
    <Avatar size="lg" name="Omar Haddad" shape="circle" ring />
    <Avatar size="lg" name="Omar Haddad" shape="rounded" ring />
    <Avatar size="lg" name="Omar Haddad" shape="square" ring status="busy" />
  </div>
)

export const Group = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <AvatarGroup people={PEOPLE} max={3} size="sm" />
    <AvatarGroup people={PEOPLE} max={5} size="md" />
    <AvatarGroup people={PEOPLE} max={6} size="lg" />
  </div>
)

export const BrokenImage = () => (
  <div style={row}>
    <Avatar size="lg" name="Linus Berg" src="/does-not-exist.png" />
    <Avatar size="lg" />
  </div>
)
BrokenImage.storyName = 'Fallbacks'
