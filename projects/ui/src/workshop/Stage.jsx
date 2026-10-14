import { Component, useState } from 'react'
import { UIContext } from '../lib/ui-context'
import { allStyles, resolveStyle, useThemes } from './themes'

export const WIDTHS = [
  { id: 'full', label: 'Full', px: null },
  { id: 'desktop', label: '1280', px: 1280 },
  { id: 'tablet', label: '768', px: 768 },
  { id: 'mobile', label: '390', px: 390 },
]

/**
 * Renders one story inside a .ui-root carrying the chosen style, theme and width.
 * Everything inside is the component's world; everything outside is workshop chrome.
 */
export function Stage({ story, args, settings, replayKey = 0, thumbnail = false, style }) {
  const width = WIDTHS.find((w) => w.id === settings.width)?.px
  const { themes } = useThemes()
  const { base, vars } = resolveStyle(settings.style, settings.theme, themes)
  // Components see the base style id, so custom themes keep that style's behaviour (e.g. Extra's fx).
  const ctx = { style: base, theme: settings.theme, reducedMotion: settings.reducedMotion }
  return (
    <div className="ws-stage" data-bg={settings.background} data-layout={story.layout} data-thumb={thumbnail || undefined}>
      <div
        className="ui-root ws-viewport"
        data-style={base}
        data-theme={settings.theme}
        data-motion={settings.reducedMotion ? 'reduce' : undefined}
        style={{ ...vars, ...(thumbnail ? null : { maxWidth: width ?? undefined, minHeight: story.height }), ...style }}
      >
        <UIContext.Provider value={ctx}>
          <StoryBoundary key={replayKey}>
            <StoryRender render={story.render} args={story.usesArgs ? args : undefined} />
          </StoryBoundary>
        </UIContext.Provider>
      </div>
    </div>
  )
}

// A real component, so stories can use hooks.
export function StoryRender({ render, args }) {
  return render(args)
}

export class StoryBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <pre className="ws-story-error">
        {String(this.state.error?.stack ?? this.state.error)}
      </pre>
    )
  }
}

/** A titled story section with a replay button (remounts the story, restarting its animations). */
export function StoryFrame({ story, args, settings, anchor }) {
  const [replay, setReplay] = useState(0)
  const { themes } = useThemes()
  return (
    <section className="ws-story" id={anchor}>
      <header className="ws-story-head">
        <span className="ws-story-name">{story.name}</span>
        {story.usesArgs && <span className="ws-chip">controls</span>}
        <button className="ws-icon-btn" title="Replay (remount)" onClick={() => setReplay((n) => n + 1)}>
          ↻
        </button>
      </header>
      {settings.compare ? (
        // Same story once per style, to compare them side by side.
        <div className="ws-compare">
          {allStyles(themes).map((s) => (
            <div key={s.id} className="ws-compare-cell">
              <div className="ws-compare-label">{s.name}</div>
              <Stage story={story} args={args} settings={{ ...settings, style: s.id, width: 'full' }} replayKey={replay} />
            </div>
          ))}
        </div>
      ) : (
        <Stage story={story} args={args} settings={settings} replayKey={replay} />
      )}
    </section>
  )
}
