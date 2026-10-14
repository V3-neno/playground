# UI

A component workshop and style framework. It has 64 page components (buttons, dropdowns, charts, carousels, animations, page sections…), each in 8 visual **styles**. On top of those it has a theme editor, a page builder that exports runnable projects, and AI-ready styleguides.

## Run

Double-click **`start.cmd`**, or from this folder run `./start.ps1`. It opens **http://127.0.0.1:5180** with hot reload. Save a file and the page updates immediately.

The first run installs dependencies automatically (or run `./setup.ps1`).

## The four areas (top bar)

| Area | What it does |
| --- | --- |
| **Components** | Overview of every component as scaled live cards. Each component page shows all its examples, with **Controls** (live props), **Code** (its files + **Download .zip** with exactly the lib/style files it imports) and **Notes**. |
| **Themes** | Pick a style and press **Customise** to get your own theme. Edit colours, chart palette, radius, borders, shadows, blur, gradient, fonts, weights, durations and easing live on a real template page. Colours and shadows are set per light/dark; everything else is shared. Custom themes appear in every style picker, in the builder and in the styleguides. You can also export `theme.css`. |
| **Page builder** | Templates (Landing, Dashboard, App & forms, Motion showcase) act as demo pages for every style. Add any component example as a block, put blocks side by side in rows, edit props and section layout, and switch style/theme for the whole page. **Export project (.zip)** gives a runnable Vite + React app containing only the components used, plus `STYLEGUIDE.md`. Pages are saved in the browser. |
| **Styleguides** | A generated `STYLEGUIDE.md` per style (and per custom theme). It covers personality, do/don't rules, setup, every token with its light and dark value, layout rules, every component with its import path and props, page recipes and a ship checklist. Written for designers and for AI assistants generating pages. Copies live in [`styleguides/`](styleguides/). |

Toolbar (shared): **Style**, **Theme** light/dark, **Width** (full / 1280 / 768 / 390 px), **Canvas** background, **Compare styles** (every story once per style, side by side), **Reduce motion**. These settings are remembered.

## Add a component

```powershell
npm run new -- "Dropdown" --category Inputs
```

This creates `src/components/inputs/Dropdown/` containing `Dropdown.jsx`, `Dropdown.css` and `Dropdown.stories.jsx`. The component appears in the sidebar right away; if its title matches a planned catalog entry, that entry becomes live. `src/components/actions/Button/` is the reference example.

### Story file format

```jsx
import { Dropdown } from './Dropdown'

export default {
  title: 'Dropdown',          // matched against catalog.js
  category: 'Inputs',
  status: 'draft',            // draft | ready
  description: 'Shown under the title and in Notes.',
  layout: 'centered',         // centered | padded | fullscreen (default for all stories)
  height: 420,                // optional min canvas height (overlays, sections)
  controls: {                 // generates the Controls panel
    label:    { type: 'text', default: 'Pick one' },
    size:     { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    disabled: { type: 'boolean' },
  },
}

// Every named export is a story, shown in file order.
export const Playground = (args) => <Dropdown {...args} />   // takes args → wired to Controls
export const Long = () => <Dropdown options={many} />         // no args → fixed example
Long.layout = 'padded'                                         // per-story override
```

Control types: `text`, `textarea`, `number`, `range` (`min`/`max`/`step`), `boolean`, `select`, `radio` (`options`), `color`.

Stories are real components, so hooks work inside them (for example `useState` to demo an open/close state).

## Styles

| Style | Feel |
| --- | --- |
| **Base** | Neutral reference |
| **Corporate** | Calm, dense, crisp 1px lines, one confident blue (Inter) |
| **Glass** | Frosted translucent panels blurring an aurora background |
| **Soft** | Neumorphic: everything extruded from or pressed into one material |
| **Brutalist** | Thick black lines, hard offset shadows, shouting yellow, uppercase |
| **Mono** | Hard edges, monospace, paper tones |
| **Playful** | Candy colours, chunky outlines, bouncy springs (Fredoka / Nunito) |
| **Extra ✨** | Totally unnecessary: a neon gradient that rotates through everything, glows, springs, and JS flourishes (confetti, tilt, magnetic hover) |


A style is a set of values for the **token contract** in `src/styles/tokens.css`. The contract covers colours, chart palette, radius, border width, shadows, fonts and motion timing.

- **Components use only `var(--ui-*)`**, never hard-coded colours or radii. That is what lets one component render in every style.
- **Add a style** by creating `src/styles/<id>.css` that sets tokens on `[data-style='<id>']` and `[data-style='<id>'][data-theme='dark']`, then registering it in `src/styles/index.js`.
- **A style can also restyle one component beyond tokens** when needed, for example `[data-style='glass'] .ui-button { backdrop-filter: blur(8px) }`.
- **Responsive layouts** should use container queries (`@container (max-width: 500px)`) rather than media queries. Every story sits in a container (`.ui-root`), so the Width buttons resize it correctly.
- **JS-driven components** (charts, animations) can call `useUI()` and `useReducedMotion()` from `src/lib/ui-context.js`.
- **Extra-style flourishes** come from `src/lib/fx.js`: `useFx()` is true only in Extra with motion allowed; then use `burst(e)` (confetti), `sparkle(el)`, `useTilt()` (3D tilt + `--fx-x/--fx-y` for a cursor sheen), `useMagnet()`.

## Shared helpers (`src/lib`)

| File | What |
| --- | --- |
| `cx.js` | class name joiner |
| `hooks.js` | `useControllable`, `useOutsideClick`, `useKey`, `useInView`, `useElementSize`, `useInterval`, `useRovingKeys` |
| `icons.jsx` | `<Icon name="check" />`, about 70 stroke icons |
| `placeholder.js` | offline images: `placeholder()`, `PHOTOS`, `avatar(name)`, `PEOPLE` |
| `fx.js` | Extra-style effects (see above) |
| `ui-context.js` | `useUI()`, `useReducedMotion()` |

Overlays render inline, without portals, so they keep the style tokens. Each story viewport has a `transform`, so `position: fixed` modals, drawers and toasts stay inside their frame.

## Layout

```
ui/
├── scripts/new-component.mjs   # npm run new
├── src/
│   ├── catalog.js              # roadmap: categories + planned components
│   ├── components/<category>/<Name>/{Name.jsx, Name.css, Name.stories.jsx}
│   ├── lib/                    # shared helpers for components (hooks, icons, fx, placeholder, ui-context)
│   ├── styles/                 # tokens.css (contract) + one file per style; index.js holds each style's guide text
│   └── workshop/               # the app itself: viewer, ThemeStudio, Builder (+ page/), Styleguide, exporter
├── styleguides/                # generated STYLEGUIDE-<style>.md files (re-download from the Styleguides area)
├── setup.ps1 / start.ps1 / start.cmd
```

Naming: component classes use the `ui-` prefix (`.ui-button`, `.ui-button--outline`); workshop classes use `ws-`.
