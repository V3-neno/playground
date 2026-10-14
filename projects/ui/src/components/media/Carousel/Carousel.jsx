import { useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useControllable, useInterval } from '../../../lib/hooks'
import { Icon } from '../../../lib/icons'
import { PHOTOS } from '../../../lib/placeholder'
import { useReducedMotion } from '../../../lib/ui-context'
import './Carousel.css'

/**
 * Slides: [{ src, title, caption? }]. Drag/swipe, arrows, dots, keyboard (←/→/Home/End), autoplay that
 * pauses on hover/focus. effect: 'auto' (slide; coverflow in the Extra style) | 'slide' | 'fade' | 'coverflow'.
 */
export function Carousel({
  slides = PHOTOS,
  index,
  defaultIndex = 0,
  onIndexChange,
  effect = 'auto',
  autoplay = false,
  interval = 4500,
  loop = true,
  arrows = true,
  dots = true,
  captions = true,
  aspect = '16 / 9',
  label = 'Photo carousel',
  className,
}) {
  const fx = useFx()
  const reduced = useReducedMotion()
  const n = slides.length
  const [i, setI] = useControllable(index, defaultIndex, onIndexChange)
  const [playing, setPlaying] = useState(autoplay && !reduced)
  const [paused, setPaused] = useState(false) // hover / focus inside
  const [dx, setDx] = useState(0)
  const drag = useRef(null)
  const dotsRef = useRef(null)
  const mode = effect === 'auto' ? (fx ? 'coverflow' : 'slide') : effect

  const go = (to) => {
    const next = loop ? (to + n) % n : Math.max(0, Math.min(n - 1, to))
    if (next === i) return
    setI(next)
    if (fx) requestAnimationFrame(() => sparkle(dotsRef.current?.querySelector('.is-active') ?? dotsRef.current))
  }
  const next = () => go(i + 1)
  const prev = () => go(i - 1)

  // With motion allowed, the dot's progress animation advances slides (so pausing freezes it mid-way).
  // With reduced motion there is no animation to listen to, so fall back to a plain timer.
  useInterval(next, playing && !paused && (reduced || !dots) ? interval : null)

  const onPointerDown = (e) => {
    if (e.button !== 0 || e.target.closest('button')) return
    drag.current = { x: e.clientX, w: e.currentTarget.offsetWidth, captured: false }
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    let d = e.clientX - drag.current.x
    if (!drag.current.captured) {
      if (Math.abs(d) < 5) return // still a click, not a drag
      drag.current.captured = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    if (!loop && ((i === 0 && d > 0) || (i === n - 1 && d < 0))) d /= 3 // rubber band at the ends
    setDx(d)
  }
  const onPointerUp = () => {
    if (!drag.current) return
    const { w } = drag.current
    drag.current = null
    if (dx < -w * 0.15) next()
    else if (dx > w * 0.15) prev()
    setDx(0)
  }
  const onKeyDown = (e) => {
    const map = { ArrowRight: next, ArrowLeft: prev, Home: () => go(0), End: () => go(n - 1) }
    if (map[e.key]) {
      e.preventDefault()
      map[e.key]()
    }
  }

  const width = drag.current?.w || 1
  const offsetOf = (k) => {
    let d = k - i
    if (loop && Math.abs(d) > n / 2) d -= Math.sign(d) * n // shortest way round
    return d + (mode === 'coverflow' ? dx / (width * 0.5) : 0)
  }

  return (
    <section
      className={cx('ui-carousel', `ui-carousel--${mode}`, dx !== 0 && 'is-dragging', className)}
      aria-roledescription="carousel"
      aria-label={label}
      style={{ '--_aspect': aspect, '--_interval': `${interval}ms` }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPaused(false)}
    >
      <div
        className="ui-carousel__viewport"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="ui-carousel__track"
          style={mode === 'slide' ? { transform: `translateX(calc(${-i * 100}% + ${dx}px))` } : undefined}
        >
          {slides.map((s, k) => {
            const d = offsetOf(k)
            const style =
              mode === 'coverflow'
                ? {
                    transform: `translateX(${d * 58}%) translateZ(${-Math.abs(d) * 180}px) rotateY(${-Math.max(-1.4, Math.min(1.4, d)) * 38}deg)`,
                    opacity: Math.abs(d) > 2.2 ? 0 : 1,
                    zIndex: 100 - Math.round(Math.abs(d) * 10),
                  }
                : mode === 'fade'
                  ? { transform: dx ? `translateX(${dx / 6}px)` : undefined }
                  : undefined
            return (
              <div
                key={s.src + k}
                className={cx('ui-carousel__slide', k === i && 'is-active')}
                role="group"
                aria-roledescription="slide"
                aria-label={`${k + 1} of ${n}${s.title ? `: ${s.title}` : ''}`}
                aria-hidden={k !== i}
                style={style}
                onClick={() => mode === 'coverflow' && k !== i && go(k)}
              >
                <img src={s.src} alt={s.alt ?? s.title ?? ''} draggable={false} />
                {captions && (s.title || s.caption) && (
                  <div className="ui-carousel__caption">
                    {s.title && <strong>{s.title}</strong>}
                    {s.caption && <span>{s.caption}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {arrows && n > 1 && (
          <>
            <button
              type="button"
              className="ui-carousel__arrow ui-carousel__arrow--prev"
              aria-label="Previous slide"
              disabled={!loop && i === 0}
              onClick={prev}
            >
              <Icon name="chevron-left" size={20} />
            </button>
            <button
              type="button"
              className="ui-carousel__arrow ui-carousel__arrow--next"
              aria-label="Next slide"
              disabled={!loop && i === n - 1}
              onClick={next}
            >
              <Icon name="chevron-right" size={20} />
            </button>
          </>
        )}
      </div>

      {(dots || autoplay) && n > 1 && (
        <div className="ui-carousel__bar">
          {autoplay && (
            <button
              type="button"
              className="ui-carousel__play"
              aria-label={playing ? 'Pause autoplay' : 'Start autoplay'}
              onClick={() => setPlaying((p) => !p)}
            >
              <Icon name={playing ? 'pause' : 'play'} size={14} />
            </button>
          )}
          {dots && (
            <div className="ui-carousel__dots" ref={dotsRef}>
              {slides.map((s, k) => (
                <button
                  key={k}
                  type="button"
                  className={cx('ui-carousel__dot', k === i && 'is-active')}
                  aria-label={`Go to slide ${k + 1}`}
                  aria-current={k === i || undefined}
                  onClick={() => go(k)}
                >
                  {k === i && playing && !reduced && (
                    <span
                      key={i}
                      className={cx('ui-carousel__progress', paused && 'is-paused')}
                      onAnimationEnd={next}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="ui-sr-only" aria-live={playing && !paused ? 'off' : 'polite'} aria-atomic="true">
        Slide {i + 1} of {n}
        {slides[i]?.title ? `: ${slides[i].title}` : ''}
      </div>
    </section>
  )
}
