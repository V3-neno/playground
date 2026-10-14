/*
 * Custom themes: a base style plus token overrides.
 *   { id: 'custom-k3x9', name: 'Acme', base: 'glass', shared: { '--ui-radius-md': '4px' }, light: { '--ui-accent': '#f06' }, dark: {} }
 * Colours and shadows differ per mode (light / dark); shape, type and motion are shared.
 *
 * The canvas keeps data-style="<base>" (so the base style's per-component overrides still apply) and puts the
 * overrides inline on .ui-root, where they beat the stylesheet. Saved in localStorage.
 */
import { createContext, useContext, useEffect, useState } from 'react'
import { STYLES } from '../styles'

const KEY = 'ui-workshop:themes'

export const ThemesContext = createContext({ themes: [], setThemes: () => {} })
export const useThemes = () => useContext(ThemesContext)

export function useThemeStore() {
  const [themes, setThemes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) ?? []
    } catch {
      return []
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(themes))
    } catch {}
  }, [themes])
  return { themes, setThemes }
}

export const newThemeId = () => `custom-${Math.random().toString(36).slice(2, 7)}`

/** Every selectable style: the built-in ones, then custom themes. */
export function allStyles(themes) {
  return [
    ...STYLES.map((s) => ({ ...s, base: s.id, custom: false })),
    ...themes.map((t) => ({ id: t.id, name: t.name, description: `Custom, based on ${styleName(t.base)}`, base: t.base, custom: true })),
  ]
}

export const styleName = (id) => STYLES.find((s) => s.id === id)?.name ?? id

/** What to put on a .ui-root for a style id: { base, vars } where vars are inline custom properties. */
export function resolveStyle(id, theme, themes) {
  const custom = themes.find((t) => t.id === id)
  if (!custom) return { base: STYLES.some((s) => s.id === id) ? id : 'base', vars: undefined }
  return { base: custom.base, vars: { ...custom.shared, ...(theme === 'dark' ? custom.dark : custom.light) } }
}

/*
 * The editable tokens, grouped for the theme studio. `type` picks the input:
 * color | length (px, with min/max) | ms | number | font | ease | shadow | text | select
 */
export const TOKEN_GROUPS = [
  {
    group: 'Colours',
    tokens: [
      ['--ui-bg', 'Background', 'color'],
      ['--ui-surface', 'Surface', 'color'],
      ['--ui-surface-2', 'Surface 2', 'color'],
      ['--ui-raised', 'Raised (cards, menus)', 'color'],
      ['--ui-text', 'Text', 'color'],
      ['--ui-text-muted', 'Muted text', 'color'],
      ['--ui-border', 'Border', 'color'],
      ['--ui-accent', 'Accent', 'color'],
      ['--ui-accent-hover', 'Accent hover', 'color'],
      ['--ui-accent-text', 'Text on accent', 'color'],
      ['--ui-accent-soft', 'Accent soft', 'color'],
      ['--ui-danger', 'Danger', 'color'],
      ['--ui-success', 'Success', 'color'],
      ['--ui-warning', 'Warning', 'color'],
    ],
  },
  {
    group: 'Chart palette',
    tokens: [1, 2, 3, 4, 5, 6].map((i) => [`--ui-chart-${i}`, `Series ${i}`, 'color']),
  },
  {
    group: 'Shape',
    tokens: [
      ['--ui-radius-sm', 'Radius small', 'length', { max: 32 }],
      ['--ui-radius-md', 'Radius medium', 'length', { max: 40 }],
      ['--ui-radius-lg', 'Radius large', 'length', { max: 60 }],
      ['--ui-border-width', 'Border width', 'length', { max: 6 }],
    ],
  },
  {
    group: 'Elevation & effects',
    tokens: [
      ['--ui-shadow-sm', 'Shadow small', 'shadow'],
      ['--ui-shadow-md', 'Shadow medium', 'shadow'],
      ['--ui-shadow-lg', 'Shadow large', 'shadow'],
      ['--ui-blur', 'Glass blur', 'length', { max: 40 }],
      ['--ui-gradient', 'Gradient', 'text'],
      ['--ui-glow', 'Glow', 'shadow'],
      ['--ui-hover-lift', 'Hover lift', 'length', { min: -8, max: 0 }],
      ['--ui-press-scale', 'Press scale', 'number', { min: 0.85, max: 1, step: 0.01 }],
    ],
  },
  {
    group: 'Typography',
    tokens: [
      ['--ui-font', 'Body font', 'font'],
      ['--ui-font-display', 'Display font', 'font'],
      ['--ui-font-size', 'Base size', 'length', { min: 12, max: 20, step: 0.5 }],
      ['--ui-weight-strong', 'Strong weight', 'select', { options: ['500', '600', '700', '800'] }],
      ['--ui-heading-weight', 'Heading weight', 'select', { options: ['500', '600', '700', '800', '900'] }],
      ['--ui-heading-transform', 'Heading case', 'select', { options: ['none', 'uppercase'] }],
    ],
  },
  {
    group: 'Motion',
    tokens: [
      ['--ui-duration-fast', 'Fast', 'ms', { max: 600 }],
      ['--ui-duration', 'Normal', 'ms', { max: 1000 }],
      ['--ui-duration-slow', 'Slow', 'ms', { max: 2000 }],
      ['--ui-ease', 'Easing', 'ease'],
      ['--ui-ease-spring', 'Spring easing', 'ease'],
    ],
  },
]

export const FONTS = [
  ['System', "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"],
  ['Inter', "'Inter', system-ui, sans-serif"],
  ['Nunito', "'Nunito', system-ui, sans-serif"],
  ['Fredoka', "'Fredoka', 'Nunito', system-ui, sans-serif"],
  ['Space Grotesk', "'Space Grotesk', system-ui, sans-serif"],
  ['Syne', "'Syne', 'Space Grotesk', sans-serif"],
  ['Serif', "Georgia, 'Times New Roman', serif"],
  ['Monospace', "ui-monospace, 'Cascadia Code', Consolas, monospace"],
]

export const EASES = [
  ['Standard', 'cubic-bezier(0.2, 0, 0, 1)'],
  ['Smooth out', 'cubic-bezier(0.22, 1, 0.36, 1)'],
  ['Spring', 'cubic-bezier(0.34, 1.56, 0.64, 1)'],
  ['Big spring', 'cubic-bezier(0.34, 1.8, 0.64, 1)'],
  ['Elastic', 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'],
  ['Linear', 'linear'],
  ['Ease in-out', 'ease-in-out'],
]

export const ALL_TOKENS = TOKEN_GROUPS.flatMap((g) => g.tokens.map(([name]) => name))

/** Which bucket an edit goes in: colours/shadows per mode, everything else shared. */
export const isModeToken = (type) => type === 'color' || type === 'shadow'

/** Read the resolved value of every token for a style + theme from a hidden probe element. */
export function readTokens(base, theme, vars) {
  const probe = document.createElement('div')
  probe.className = 'ui-root'
  probe.dataset.style = base
  probe.dataset.theme = theme
  Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', pointerEvents: 'none', width: '0', height: '0' })
  for (const [k, v] of Object.entries(vars ?? {})) probe.style.setProperty(k, v)
  document.body.appendChild(probe)
  const cs = getComputedStyle(probe)
  const out = {}
  for (const name of [...ALL_TOKENS, '--ui-overlay', '--ui-focus', '--ui-raised-border', '--ui-field-bg', '--ui-field-border', '--ui-shadow-inset', '--ui-radius-full', '--ui-heading-tracking', '--ui-font-mono']) {
    out[name] = cs.getPropertyValue(name).trim()
  }
  probe.remove()
  return out
}

/** Any CSS colour -> #rrggbb for <input type=color> (alpha is dropped; null if it can't be parsed). */
let ctx
export function toHex(value) {
  if (!value) return null
  ctx ??= document.createElement('canvas').getContext('2d')
  ctx.fillStyle = '#010203'
  ctx.fillStyle = value
  const v = ctx.fillStyle
  if (v === '#010203' && value.trim().toLowerCase() !== '#010203') return null
  if (v.startsWith('#')) return v
  const m = v.match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const [r, g, b] = m[1].split(',').map((n) => parseInt(n, 10))
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')
}

/** CSS for a custom theme as a standalone file (used by exports and the styleguide). */
export function themeCss(t) {
  const block = (sel, vars) =>
    Object.keys(vars ?? {}).length ? `${sel} {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n` : ''
  return (
    `/* ${t.name}: custom theme based on "${t.base}". Load after styles/${t.base}.css and use data-style="${t.base}". */\n` +
    block(`.ui-root[data-style='${t.base}']`, t.shared) +
    block(`.ui-root[data-style='${t.base}']:not([data-theme='dark'])`, t.light) +
    block(`.ui-root[data-style='${t.base}'][data-theme='dark']`, t.dark)
  )
}
