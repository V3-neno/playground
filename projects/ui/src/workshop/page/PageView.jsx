import { UIContext } from '../../lib/ui-context'
import { StoryBoundary, StoryRender } from '../Stage'
import { resolveStyle, useThemes } from '../themes'
import { Block, Row } from './Block'
import { findStory } from './model'

/**
 * Renders a builder page inside one .ui-root, exactly like an exported page.
 * With `editable`, blocks get selection outlines and a label; clicking a block selects it.
 */
export function PageView({ page, settings, selected, onSelect, editable = false, width }) {
  const { themes } = useThemes()
  const { base, vars } = resolveStyle(settings.style, settings.theme, themes)
  const ctx = { style: base, theme: settings.theme, reducedMotion: settings.reducedMotion }
  return (
    <div
      className="ui-root ws-page-root"
      data-style={base}
      data-theme={settings.theme}
      data-motion={settings.reducedMotion ? 'reduce' : undefined}
      style={{ ...vars, maxWidth: width ?? undefined }}
    >
      <UIContext.Provider value={ctx}>
        {page.blocks.map((b) => (
          <Selectable key={b.id} block={b} selected={selected} onSelect={onSelect} editable={editable}>
            {b.kind === 'row' ? (
              <Block {...b.layout}>
                <Row columns={b.columns} gap={b.gap}>
                  {b.children.map((c) => (
                    <Selectable key={c.id} block={c} selected={selected} onSelect={onSelect} editable={editable} child>
                      <StoryBlock block={c} />
                    </Selectable>
                  ))}
                </Row>
              </Block>
            ) : (
              <Block {...b.layout}>
                <StoryBlock block={b} />
              </Block>
            )}
          </Selectable>
        ))}
        {!page.blocks.length && <div className="ws-page-empty">Empty page. Add blocks from the left panel.</div>}
      </UIContext.Provider>
    </div>
  )
}

function StoryBlock({ block }) {
  const story = findStory(block)
  if (!story) return <div className="ws-story-error">Missing story {block.component} / {block.story}</div>
  return (
    <StoryBoundary key={block.story}>
      <StoryRender render={story.render} args={story.usesArgs ? block.args : undefined} />
    </StoryBoundary>
  )
}

function Selectable({ block, selected, onSelect, editable, child, children }) {
  if (!editable) return children
  const label = block.kind === 'row' ? `Row · ${block.children.length} columns` : `${block.component.split('/')[1]} · ${block.story}`
  return (
    <div
      className="ws-sel"
      data-selected={selected === block.id || undefined}
      data-child={child || undefined}
      onPointerDown={(e) => {
        // Select without blocking the component's own interaction. Bubbling reaches the innermost block first.
        if (e.nativeEvent.__wsSelected) return
        e.nativeEvent.__wsSelected = true
        onSelect(block.id)
      }}
    >
      <span className="ws-sel-label">{label}</span>
      {children}
    </div>
  )
}
