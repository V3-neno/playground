import { useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx, useTilt } from '../../../lib/fx'
import { PHOTOS } from '../../../lib/placeholder'
import { Lightbox } from '../Lightbox/Lightbox'
import './ImageGallery.css'

/**
 * layout: 'grid' (uniform tiles) | 'masonry' (CSS columns, natural heights) | 'bento' (feature tiles).
 * captions: 'hover' | 'below' | 'none'. Clicking a tile opens the Lightbox unless lightbox = false.
 */
export function ImageGallery({
  images = PHOTOS,
  layout = 'grid',
  columns = 3,
  gap = 12,
  captions = 'hover',
  lightbox = true,
  aspect = '4 / 3',
  className,
}) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  return (
    <>
      <ul
        className={cx('ui-gallery', `ui-gallery--${layout}`, `ui-gallery--captions-${captions}`, className)}
        style={{ '--_cols': columns, '--_gap': `${gap}px`, '--_aspect': aspect }}
      >
        {images.map((im, k) => (
          <Tile
            key={im.src + k}
            image={im}
            index={k}
            clickable={lightbox}
            onOpen={() => {
              setIndex(k)
              setOpen(true)
            }}
          />
        ))}
      </ul>
      {lightbox && <Lightbox images={images} open={open} onOpenChange={setOpen} index={index} onIndexChange={setIndex} />}
    </>
  )
}

function Tile({ image, index, clickable, onOpen }) {
  const fx = useFx()
  const tilt = useTilt(fx, { max: 12, scale: 1.04 })
  const Inner = clickable ? 'button' : 'div'
  return (
    <li className="ui-gallery__item" style={{ '--_i': index }}>
      <Inner
        ref={tilt}
        type={clickable ? 'button' : undefined}
        className="ui-gallery__tile"
        aria-label={clickable ? `Open ${image.title ?? `image ${index + 1}`}` : undefined}
        onClick={
          clickable
            ? (e) => {
                if (fx) sparkle(e)
                onOpen()
              }
            : undefined
        }
      >
        <img src={image.src} alt={image.alt ?? image.title ?? ''} loading="lazy" draggable={false} />
        <span className="ui-gallery__sheen" aria-hidden />
        {image.title && <span className="ui-gallery__caption">{image.title}</span>}
      </Inner>
    </li>
  )
}
