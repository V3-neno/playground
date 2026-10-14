import { useLayoutEffect, useRef, useState } from 'react'
import { Stage } from './Stage'
import { resolveStyle, useThemes } from './themes'

// Layout width per story layout: centred stories size to their content; padded ones get a column;
// full-width sections get a desktop-ish width and are cropped from the top rather than shrunk to fit.
const WIDTH = { centered: 'max-content', padded: 560, fullscreen: 720 }
const SECTION_WIDTH = 960
const MAX_WIDTH = 760
const MIN_WIDTH = 300

/**
 * A live story shrunk to fit its card: laid out at a width suited to its layout, then scaled down (never up)
 * so the whole thing is visible. Page sections fill the card's width instead and show their top part.
 */
export function Thumb({ story, args, settings, crop = false }) {
  const box = useRef(null)
  const inner = useRef(null)
  const [scale, setScale] = useState(0)
  const { themes } = useThemes()
  const { base, vars } = resolveStyle(settings.style, settings.theme, themes)
  const section = crop && story.layout === 'fullscreen'

  useLayoutEffect(() => {
    const measure = () => {
      const b = box.current?.getBoundingClientRect()
      const el = inner.current
      if (!b?.width || !el) return
      // offsetWidth/Height are layout sizes, unaffected by the scale transform.
      const next = section ? b.width / el.offsetWidth : Math.min(1, b.width / el.offsetWidth, b.height / el.offsetHeight)
      setScale((s) => (Math.abs(s - next) < 0.005 ? s : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box.current)
    ro.observe(inner.current)
    return () => ro.disconnect()
  }, [story, section])

  return (
    // The card itself is a .ui-root too, so the style's background fills it around the scaled story.
    <div className="ws-thumb ui-root" data-style={base} data-theme={settings.theme} style={vars} ref={box} inert>
      <div
        className="ws-thumb-inner"
        ref={inner}
        style={{
          width: section ? SECTION_WIDTH : WIDTH[story.layout] ?? 'max-content',
          minWidth: MIN_WIDTH,
          maxWidth: section ? undefined : MAX_WIDTH,
          // Sections hang from the top edge; everything else is centred.
          top: section ? 0 : undefined,
          transformOrigin: section ? 'top center' : undefined,
          transform: section ? `translateX(-50%) scale(${scale})` : `translate(-50%, -50%) scale(${scale})`,
          visibility: scale ? undefined : 'hidden',
        }}
      >
        <Stage story={story} args={args} settings={settings} thumbnail />
      </div>
    </div>
  )
}
