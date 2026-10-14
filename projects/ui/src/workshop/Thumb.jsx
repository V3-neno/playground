import { useLayoutEffect, useRef, useState } from 'react'
import { Stage } from './Stage'
import { resolveStyle, useThemes } from './themes'

const MAX_WIDTH = 760 // widest a story may lay out before being scaled down
const MIN_WIDTH = 300 // so fluid stories (fields, charts) still get a sensible width

/**
 * A live story shrunk to fit its card. The story lays out at its own natural width (between MIN and MAX;
 * page sections use MAX), then the whole thing is scaled down, never up, so nothing gets cropped.
 */
export function Thumb({ story, args, settings }) {
  const box = useRef(null)
  const inner = useRef(null)
  const [scale, setScale] = useState(0)
  const { themes } = useThemes()
  const { base, vars } = resolveStyle(settings.style, settings.theme, themes)
  const fluid = story.layout === 'fullscreen'

  useLayoutEffect(() => {
    const measure = () => {
      const b = box.current?.getBoundingClientRect()
      const el = inner.current
      if (!b?.width || !el) return
      // offsetWidth/Height are layout sizes, unaffected by the scale transform.
      const next = Math.min(1, b.width / el.offsetWidth, b.height / el.offsetHeight)
      setScale((s) => (Math.abs(s - next) < 0.005 ? s : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box.current)
    ro.observe(inner.current)
    return () => ro.disconnect()
  }, [story])

  return (
    // The card itself is a .ui-root too, so the style's background fills it around the scaled story.
    <div className="ws-thumb ui-root" data-style={base} data-theme={settings.theme} style={vars} ref={box} inert>
      <div
        className="ws-thumb-inner"
        ref={inner}
        style={{
          width: fluid ? MAX_WIDTH : 'max-content',
          minWidth: MIN_WIDTH,
          maxWidth: MAX_WIDTH,
          transform: `translate(-50%, -50%) scale(${scale})`,
          visibility: scale ? undefined : 'hidden',
        }}
      >
        <Stage story={story} args={args} settings={settings} thumbnail />
      </div>
    </div>
  )
}
