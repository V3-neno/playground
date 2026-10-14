import { useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { avatar as initialsAvatar } from '../../../lib/placeholder'
import './Avatar.css'

const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 }
const STATUS_LABEL = { online: 'Online', away: 'Away', busy: 'Busy', offline: 'Offline' }

/** Picture or initials, with an optional presence dot and ring. Falls back to initials if the image fails. */
export function Avatar({ src, name = '', size = 'md', shape = 'circle', status, ring = false, className, style, ...props }) {
  const fx = useFx()
  const [broken, setBroken] = useState(false)
  const px = typeof size === 'number' ? size : SIZES[size] ?? SIZES.md
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
  const image = src && !broken ? src : null
  return (
    <span
      className={cx('ui-avatar', `ui-avatar--${shape}`, ring && 'ui-avatar--ring', className)}
      style={{ '--_size': `${px}px`, ...style }}
      role="img"
      aria-label={[name, status && STATUS_LABEL[status]].filter(Boolean).join(', ') || 'Avatar'}
      onPointerEnter={fx ? (e) => sparkle(e.currentTarget) : undefined}
      {...props}
    >
      <span className="ui-avatar__inner">
        {image ? (
          <img src={image} alt="" onError={() => setBroken(true)} draggable={false} />
        ) : initials ? (
          <span className="ui-avatar__initials" aria-hidden>
            {initials}
          </span>
        ) : (
          <img src={initialsAvatar('?')} alt="" />
        )}
      </span>
      {status && <span className={cx('ui-avatar__status', `is-${status}`)} aria-hidden />}
    </span>
  )
}

/** Overlapping stack of avatars with a "+N" overflow chip. */
export function AvatarGroup({ people = [], max = 4, size = 'md', className, ...props }) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  const px = typeof size === 'number' ? size : SIZES[size] ?? SIZES.md
  return (
    <div className={cx('ui-avatar-group', className)} style={{ '--_size': `${px}px` }} {...props}>
      {shown.map((p) => (
        <Avatar key={p.name} name={p.name} src={p.avatar} size={size} title={p.name} />
      ))}
      {rest > 0 && (
        <span className="ui-avatar ui-avatar--circle ui-avatar--more" style={{ '--_size': `${px}px` }} aria-label={`${rest} more`}>
          <span className="ui-avatar__inner">+{rest}</span>
        </span>
      )}
    </div>
  )
}
