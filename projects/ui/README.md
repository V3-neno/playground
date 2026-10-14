# UI

A component workshop: build page components (buttons, dropdowns, charts, carousels, animations…) in isolation and view them in several visual **styles**.

## Run

Double-click **`start.cmd`**, or from this folder run `./start.ps1`. It opens **http://127.0.0.1:5180** with hot reload. Save a file and the page updates immediately.

The first run installs dependencies automatically (or run `./setup.ps1`).

## The workshop

| Area | What it does |
| --- | --- |
| **Sidebar** | Every category and component from `src/catalog.js`. Grey = planned, dot = built (orange draft, green ready). Press `/` to search. |
| **Overview** | All components as cards, with live previews of the built ones in the current style. |
| **Toolbar** | **Style** (base, mono…), **Theme** light/dark, **Width** (full / 1280 / 768 / 390 px), **Canvas** background, **Reduce motion**. These settings are remembered. |
| **Component page** | Every story of the component, stacked. The **↻** button remounts a story, which replays its animations. |
| **Panel** | **Controls** (live props), **Code** (the component's files, with a copy button), **Notes**. |

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

A style is a set of values for the **token contract** in `src/styles/tokens.css`. The contract covers colours, chart palette, radius, border width, shadows, fonts and motion timing.

- **Components use only `var(--ui-*)`**, never hard-coded colours or radii. That is what lets one component render in every style.
- **Add a style** by creating `src/styles/<id>.css` that sets tokens on `[data-style='<id>']` and `[data-style='<id>'][data-theme='dark']`, then registering it in `src/styles/index.js`.
- **A style can also restyle one component beyond tokens** when needed, for example `[data-style='glass'] .ui-button { backdrop-filter: blur(8px) }`.
- **Responsive layouts** should use container queries (`@container (max-width: 500px)`) rather than media queries. Every story sits in a container (`.ui-root`), so the Width buttons resize it correctly.
- **JS-driven components** (charts, animations) can call `useUI()` and `useReducedMotion()` from `src/lib/ui-context.js`.

## Layout

```
ui/
├── scripts/new-component.mjs   # npm run new
├── src/
│   ├── catalog.js              # roadmap: categories + planned components
│   ├── components/<category>/<Name>/{Name.jsx, Name.css, Name.stories.jsx}
│   ├── lib/                    # shared helpers for components (cx, ui-context)
│   ├── styles/                 # tokens.css (contract) + one file per style
│   └── workshop/               # the viewer app itself (not part of components)
├── setup.ps1 / start.ps1 / start.cmd
```

Naming: component classes use the `ui-` prefix (`.ui-button`, `.ui-button--outline`); workshop classes use `ws-`.
