# Playful: UI styleguide

> Instructions for designers and AI assistants. Follow this document when building or editing any page in the **Playful** style.
> It's generated from the UI workshop, so token values and the component list are exact.

## 1. Personality
Friendly, bouncy and a bit cheeky. Candy colours, chunky 2px outlines with offset shadows, pill shapes and spring motion.

**Fonts:** Fredoka (display), Nunito (body).

## 2. Setup
Every component must render inside a style root. The root sets the tokens, background, text colour and font:
```jsx
import './styles/tokens.css'
import './styles/playful.css'
import { UIContext } from './lib/ui-context'

<UIContext.Provider value={{ style: 'playful', theme: 'light', reducedMotion: false }}>
  <div className="ui-root" data-style="playful" data-theme="light">{/* page */}</div>
</UIContext.Provider>
```
- Set `data-theme="dark"` for dark mode. Every token has a dark value (see below).
- `.ui-root` is a size container, so components respond to **their container's** width (`@container`), not the viewport.
- Overlays (modal, drawer, toast, popover) render inline, without portals, so they stay inside the root and keep its tokens.

## 3. Rules

**Do**
- Lift clickable things on hover (--ui-hover-lift) and squish them on press (--ui-press-scale).
- Use the spring easings (--ui-ease, --ui-ease-spring) for entrances and state changes.
- Use pill shapes for buttons and chips, large radii for cards, and slight rotations on stickers and badges.
- Mix the candy chart palette freely in illustrations and accents.

**Don't**
- Use thin 1px hairlines or long dense paragraphs.
- Let motion block the user. Keep it under ~500ms.

**Always**
- Style only with `var(--ui-*)` tokens. Never hard-code colours, radii, shadows, fonts or durations.
- Use existing components (section 6) before writing new markup. New components follow the same pattern: tokens first, then a small "style overrides" block.
- Headings use the `.ui-heading` class (display font, weight, tracking and case come from tokens). Use `.ui-gradient-text` for highlighted words.
- Show focus with `box-shadow: 0 0 0 3px var(--ui-focus)` on `:focus-visible`.
- Honour reduced motion: OS `prefers-reduced-motion` and `useReducedMotion()` from `lib/ui-context`.
- Use semantic HTML and correct ARIA roles. Everything must be keyboard reachable.

## 4. Design tokens
Values resolved for this style. Use the variable, not the value.

### Colour
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ui-bg` | `#fff6e9` | `#1c1330` | Page background |
| `--ui-surface` | `#ffffff` | `#2a1f45` | Subtle fills: table headers, hovered rows, wells |
| `--ui-surface-2` | `#ffeacc` | `#362959` | Stronger fills: tracks, pressed states |
| `--ui-raised` | `#ffffff` | `#2a1f45` | Cards, menus, popovers, modals |
| `--ui-raised-border` | `#2b1d3a` | `#f3e8ff` | Border of raised surfaces |
| `--ui-text` | `#2b1d3a` | `#fff3f8` | Body and heading text |
| `--ui-text-muted` | `#6e5b84` | `#c4b2dc` | Secondary text, hints, captions |
| `--ui-border` | `#2b1d3a` | `#f3e8ff` | Dividers and control borders |
| `--ui-accent` | `#ff5c8a` | same | Primary actions, links, selection, focus |
| `--ui-accent-hover` | `#ff3f75` | same | Hover state of accent fills |
| `--ui-accent-text` | `#ffffff` | same | Text and icons on accent fills |
| `--ui-accent-soft` | `#ffe1ea` | `#4a2340` | Tinted backgrounds for selected / highlighted items |
| `--ui-danger` | `#ff4d4d` | same | Errors, destructive actions |
| `--ui-success` | `#2ec4a0` | same | Success, positive deltas |
| `--ui-warning` | `#ffb703` | same | Warnings, pending states |
| `--ui-focus` | `rgb(77 150 255 / 0.5)` | same | Focus ring (box-shadow: 0 0 0 3px var(--ui-focus)) |
| `--ui-overlay` | `rgb(43 29 58 / 0.45)` | `rgb(10 5 20 / 0.6)` | Backdrop behind modals and drawers |
| `--ui-field-bg` | `#ffffff` | `#241a3b` | Input background |
| `--ui-field-border` | `#2b1d3a` | `#f3e8ff` | Input border |

### Charts
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ui-chart-1` | `#ff5c8a` | same | Data series, in order |
| `--ui-chart-2` | `#4d96ff` | same | Data series, in order |
| `--ui-chart-3` | `#2ec4a0` | same | Data series, in order |
| `--ui-chart-4` | `#ffb703` | same | Data series, in order |
| `--ui-chart-5` | `#9b5de5` | same | Data series, in order |
| `--ui-chart-6` | `#ff8c42` | same | Data series, in order |

### Shape
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ui-radius-sm` | `12px` | same | Chips, small controls, inner corners |
| `--ui-radius-md` | `18px` | same | Buttons, inputs, menus |
| `--ui-radius-lg` | `28px` | same | Cards, modals, sections |
| `--ui-radius-full` | `999px` | same | Pills and avatars |
| `--ui-border-width` | `2px` | same | Every border |

### Elevation & effects
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ui-shadow-sm` | `2px 3px 0 #2b1d3a` | `2px 3px 0 #ff5c8a` | Resting buttons, small raised items |
| `--ui-shadow-md` | `4px 5px 0 #2b1d3a` | `4px 5px 0 #ff5c8a` | Cards, menus, hover elevation |
| `--ui-shadow-lg` | `7px 8px 0 #2b1d3a` | `7px 8px 0 #ff5c8a` | Modals, drawers, floating panels |
| `--ui-shadow-inset` | `none` | same | Sunken / pressed (inputs, pressed toggles) |
| `--ui-blur` | `0px` | same | backdrop-filter: blur() on raised surfaces |
| `--ui-gradient` | `linear-gradient(120deg, #ff5c8a, #ffb703)` | same | Primary fills, gradient text, decorative borders |
| `--ui-glow` | `0 0 0 4px #ffe1ea` | `0 0 0 4px #4a2340` | Extra shadow on accent elements on hover / focus |
| `--ui-hover-lift` | `-3px` | same | translateY on hover for clickable surfaces |
| `--ui-press-scale` | `0.94` | same | scale on :active |

### Typography
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ui-font` | `'Nunito', system-ui, sans-serif` | same | Body font |
| `--ui-font-display` | `'Fredoka', 'Nunito', system-ui, sans-serif` | same | Headings (.ui-heading) |
| `--ui-font-mono` | `ui-monospace, 'Cascadia Code', Consolas, monospace` | same | Code, numbers in tables if desired |
| `--ui-font-size` | `15.5px` | same | Base font size |
| `--ui-weight-strong` | `800` | same | Buttons, labels, emphasis |
| `--ui-heading-weight` | `600` | same | Headings |
| `--ui-heading-transform` | `none` | same | Heading case |
| `--ui-heading-tracking` | `0` | same | Heading letter-spacing |

### Motion
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ui-duration-fast` | `160ms` | same | Hover / press feedback |
| `--ui-duration` | `280ms` | same | Most transitions (open/close, state changes) |
| `--ui-duration-slow` | `520ms` | same | Entrances, large movements |
| `--ui-ease` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | same | Default easing |
| `--ui-ease-spring` | `cubic-bezier(0.68, -0.6, 0.32, 1.6)` | same | Playful overshoot (entrances, toggles) |

## 5. Layout
- Page sections: full-width bands with content constrained to ~1200px (wide) or ~760px (narrow), 24px side gutters, vertical padding of 24 / 48 / 96px.
- Grids: `repeat(auto-fit, minmax(…, 1fr))` or container queries. Collapse to one column below ~760px of container width.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px.
- Test every page at 390, 768 and 1280px wide, light and dark.

## 6. Components
All components live in `src/components/<category>/<Name>/` (`<Name>.jsx`, `<Name>.css`, `<Name>.stories.jsx` with working examples). Import the component, pass props, and put it inside the style root.

### Actions

#### Button
Reference component: tokens for everything, small per-style overrides at the bottom of the CSS, and confetti + a magnetic hover in the Extra style.
`import { Button } from 'src/components/actions/Button/Button'`  ·  examples: Playground, Variants, Sizes, With Icons, States

| Prop | Type | Default |
| --- | --- | --- |
| `children` | string | `"Get started"` |
| `variant` | `solid` / `outline` / `ghost` / `danger` | `"solid"` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `icon` | `plus` / `arrow-right` / `download` / `sparkles` / `heart` | `""` |
| `loading` | boolean | `false` |
| `disabled` | boolean | `false` |

#### Button group
Pass `options` for a segmented control (single choice, arrow keys move the selection, sliding thumb). Without options it joins its child buttons into one attached group.
`import { ButtonGroup } from 'src/components/actions/ButtonGroup/ButtonGroup'`  ·  examples: Segmented, Playground, Icon Only, With Disabled, Attached, Vertical

| Prop | Type | Default |
| --- | --- | --- |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `fullWidth` | boolean | `false` |

#### Icon button
A button that is just an icon. Always pass a `label`: it is the accessible name and the tooltip. Optional badge (number or dot).
`import { IconButton } from 'src/components/actions/IconButton/IconButton'`  ·  examples: Toolbar, Playground, Variants, Sizes, Badges, Disabled

| Prop | Type | Default |
| --- | --- | --- |
| `icon` | `check` / `x` / `chevron-down` / `chevron-up` / `chevron-left` / `chevron-right` / `plus` / `minus` / `search` / `arrow-right` / `arrow-left` / `arrow-up` / `arrow-down` / `menu` / `more` / `calendar` / `upload` / `download` / `info` / `alert` / `check-circle` / `x-circle` / `star` / `heart` / `play` / `pause` / `volume` / `mute` / `maximize` / `home` / `sliders` / `user` / `users` / `bell` / `mail` / `copy` / `trash` / `edit` / `external` / `file` / `image` / `sun` / `moon` / `zap` / `sparkles` / `trending-up` / `trending-down` / `grid` / `list` / `filter` / `clock` / `lock` / `globe` / `settings` / `command` / `link` / `bold` / `italic` / `underline` / `align-left` / `align-center` / `align-right` / `folder` / `bar-chart` / `pie-chart` / `layers` / `rocket` / `shield` / `credit-card` / `message` / `eye` / `refresh` / `inbox` / `quote` | `"heart"` |
| `label` | string | `"Like"` |
| `variant` | `solid` / `outline` / `ghost` | `"outline"` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `shape` | `square` / `round` | `"square"` |
| `disabled` | boolean | `false` |

#### Link
Text link with three variants: inline (in running text), subtle (underline on hover) and standalone (call to action with a nudging arrow). `external` opens a new tab and announces it.
`import { Link } from 'src/components/actions/Link/Link'`  ·  examples: Variants, Playground, In Text, With Icons

| Prop | Type | Default |
| --- | --- | --- |
| `children` | string | `"Read the changelog"` |
| `variant` | `inline` / `subtle` / `standalone` | `"standalone"` |
| `external` | boolean | `false` |
| `icon` | `file` / `download` / `globe` / `mail` | `""` |

#### Toggle
A two-state button (aria-pressed) for things like bold, like or pin. Group them in a `ui-toggle-bar` toolbar. In Extra, switching on throws confetti (or the `celebrate` emoji).
`import { Toggle } from 'src/components/actions/Toggle/Toggle'`  ·  examples: Formatting, Playground, Like Button, States, Sizes

| Prop | Type | Default |
| --- | --- | --- |
| `children` | string | `"Pin"` |
| `icon` | `check` / `x` / `chevron-down` / `chevron-up` / `chevron-left` / `chevron-right` / `plus` / `minus` / `search` / `arrow-right` / `arrow-left` / `arrow-up` / `arrow-down` / `menu` / `more` / `calendar` / `upload` / `download` / `info` / `alert` / `check-circle` / `x-circle` / `star` / `heart` / `play` / `pause` / `volume` / `mute` / `maximize` / `home` / `sliders` / `user` / `users` / `bell` / `mail` / `copy` / `trash` / `edit` / `external` / `file` / `image` / `sun` / `moon` / `zap` / `sparkles` / `trending-up` / `trending-down` / `grid` / `list` / `filter` / `clock` / `lock` / `globe` / `settings` / `command` / `link` / `bold` / `italic` / `underline` / `align-left` / `align-center` / `align-right` / `folder` / `bar-chart` / `pie-chart` / `layers` / `rocket` / `shield` / `credit-card` / `message` / `eye` / `refresh` / `inbox` / `quote` | `"star"` |
| `variant` | `outline` / `ghost` | `"outline"` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `disabled` | boolean | `false` |

### Inputs

#### Checkbox
Native checkbox with a drawn tick, indeterminate state, description and sizes. In Extra it backflips and sparkles when ticked.
`import { Checkbox } from 'src/components/inputs/Checkbox/Checkbox'`  ·  examples: Playground, Select All, States, Sizes

| Prop | Type | Default |
| --- | --- | --- |
| `label` | string | `"Send me the newsletter"` |
| `description` | string | `"One email a month, no spam."` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `indeterminate` | boolean | `false` |
| `invalid` | boolean | `false` |
| `disabled` | boolean | `false` |

#### Combobox
Type to filter, arrows to move, Enter to pick, Escape to close (or clear). Multiple mode turns picks into removable chips; Backspace removes the last one. In Extra, chips are glowing gradient pills and adding one throws confetti.
`import { Combobox } from 'src/components/inputs/Combobox/Combobox'`  ·  examples: Playground, Multiple, States

| Prop | Type | Default |
| --- | --- | --- |
| `label` | string | `"City"` |
| `placeholder` | string | `"Search cities…"` |
| `multiple` | boolean | `false` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `error` | string | `""` |
| `disabled` | boolean | `false` |

#### Date picker
Field that opens a month calendar (an ARIA grid). Arrows move by day/week, PageUp/PageDown by month (Shift for year), Home/End within the week, Enter picks, Escape closes. Supports min/max and the first day of the week. In Extra, picking a date turns it into a glowing gem and sets off confetti.
`import { calendar } from 'src/components/inputs/DatePicker/calendar'`  ·  examples: Playground, Open, Inline Calendar, States

| Prop | Type | Default |
| --- | --- | --- |
| `label` | string | `"Check-in"` |
| `placeholder` | string | `"Pick a date"` |
| `weekStartsOn` | `1` / `0` | `"1"` |
| `locale` | `en` / `sv` / `de` / `fr` / `ja` | `"en"` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `disabled` | boolean | `false` |

#### Dropdown
Select-only listbox: arrow keys, Home/End, type-ahead, Escape. Options can carry icons, descriptions and a disabled state. In Extra the options cascade in and choosing one throws sparkles.
`import { Dropdown } from 'src/components/inputs/Dropdown/Dropdown'`  ·  examples: Playground, Open, States, Sizes

| Prop | Type | Default |
| --- | --- | --- |
| `label` | string | `"Favourite fruit"` |
| `placeholder` | string | `"Pick one…"` |
| `hint` | string | `""` |
| `error` | string | `""` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `disabled` | boolean | `false` |

#### File upload
Drop zone (click or drag) with a file list, simulated progress, type/size/count validation and remove. Nothing leaves the browser. In Extra the border is a moving rainbow and dropping files sets off paper confetti.
`import { FileUpload } from 'src/components/inputs/FileUpload/FileUpload'`  ·  examples: Playground, Compact, Limits, Disabled

| Prop | Type | Default |
| --- | --- | --- |
| `label` | string | `"Drop files here"` |
| `hint` | string | `"PNG, JPG or PDF up to 5 MB"` |
| `accept` | string | `"image/*,.pdf"` |
| `multiple` | boolean | `true` |
| `compact` | boolean | `false` |
| `simulate` | boolean | `true` |
| `disabled` | boolean | `false` |

#### Radio group
Native radios in a radiogroup (arrow keys move the selection). Three variants: dots, cards and segmented. In Extra the dot has a pulsing halo, cards tilt toward the cursor and choosing sparkles.
`import { RadioGroup } from 'src/components/inputs/RadioGroup/RadioGroup'`  ·  examples: Playground, Cards, Segmented, States

| Prop | Type | Default |
| --- | --- | --- |
| `label` | string | `"Shipping"` |
| `variant` | `default` / `cards` / `segmented` | `"default"` |
| `orientation` | `vertical` / `horizontal` | `"vertical"` |
| `hint` | string | `""` |
| `error` | string | `""` |
| `disabled` | boolean | `false` |

#### Slider
Single or range slider: drag anywhere on the track, or use arrows, PageUp/PageDown, Home and End. Value bubble, marks and a custom formatter. In Extra the fill glows, the thumb is a glowing orb, and hitting either end sets off confetti.
`import { Slider } from 'src/components/inputs/Slider/Slider'`  ·  examples: Playground, Price Range, With Marks, States

| Prop | Type | Default |
| --- | --- | --- |
| `label` | string | `"Volume"` |
| `min` | number | `0` |
| `max` | number | `100` |
| `step` | number 1–undefined | `1` |
| `range` | boolean | `false` |
| `showValue` | `hover` / `always` / `never` | `"hover"` |
| `disabled` | boolean | `false` |

#### Switch
role="switch" toggle with an iOS-style squish while pressed, optional icons in the thumb, description and sizes. In Extra the thumb spins over on a rainbow track and throws stars.
`import { Switch } from 'src/components/inputs/Switch/Switch'`  ·  examples: Playground, Settings, States, Sizes

| Prop | Type | Default |
| --- | --- | --- |
| `label` | string | `"Wi-Fi"` |
| `description` | string | `""` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `labelPosition` | `right` / `left` | `"right"` |
| `disabled` | boolean | `false` |

#### Text field
Single-line or multiline input with label, hint, error, icons, clear button, password reveal and a character counter. In Extra it throws glitter as you type.
`import { TextField } from 'src/components/inputs/TextField/TextField'`  ·  examples: Playground, Variants, States, Sizes, Multiline

| Prop | Type | Default |
| --- | --- | --- |
| `label` | string | `"Email"` |
| `placeholder` | string | `"you@example.com"` |
| `hint` | string | `"We'll never share it."` |
| `error` | string | `""` |
| `icon` | `mail` / `search` / `user` / `lock` / `globe` | `"mail"` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `type` | `text` / `email` / `password` / `number` | `"email"` |
| `clearable` | boolean | `true` |
| `required` | boolean | `false` |
| `disabled` | boolean | `false` |

### Navigation

#### Breadcrumbs
A nav landmark with an ordered list; the last crumb is aria-current="page". Long trails collapse into a "…" button. Extra adds gradient text, a sweeping underline and spinning ✦ separators.
`import { Breadcrumbs } from 'src/components/navigation/Breadcrumbs/Breadcrumbs'`  ·  examples: Simple, Playground, Separators, Collapsed, Long Labels

| Prop | Type | Default |
| --- | --- | --- |
| `separator` | `chevron` / `slash` / `dot` / `arrow` | `"chevron"` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `maxItems` | number 0–6 | `0` |

#### Menu
Action menu (role="menu"): Enter/Space/↓ opens, arrows + Home/End move, letters type-ahead, Esc closes and returns focus. Supports separators, group labels, shortcuts, danger and checkbox items. Extra: rainbow rim, items cascade in on a spring, a glowing highlight glides behind them, and every pick pops confetti.
`import { Menu } from 'src/components/navigation/Menu/Menu'`  ·  examples: Open, Playground, Grouped, Checkable, Icon Trigger

| Prop | Type | Default |
| --- | --- | --- |
| `label` | string | `"Actions"` |
| `trigger` | `button` / `icon` | `"button"` |
| `align` | `start` / `end` | `"start"` |

#### Navbar
Responsive top bar: a highlight follows the hovered link and settles back on the current page. Under ~720px of container width, links and actions fold into an animated hamburger panel (try Width 390). Extra: rainbow hairline, a neon pill that chases your cursor, a spinning gradient logo.
`import { Navbar } from 'src/components/navigation/Navbar/Navbar'`  ·  examples: Bar, Playground, Floating, Mobile (tap the burger)

| Prop | Type | Default |
| --- | --- | --- |
| `brand` | string | `"Acme"` |
| `variant` | `solid` / `floating` / `transparent` | `"solid"` |
| `logo` | `sparkles` / `zap` / `rocket` / `layers` / `globe` / `heart` | `"sparkles"` |
| `withActions` | boolean | `true` |

#### Pagination
Numbered pagination with ellipsis gaps and a sliding active marker. ←/→/Home/End work anywhere inside it. Squeezed below ~420px it switches to "Page 3 of 12". In Extra the marker is a squishy neon orb and the last page earns confetti.
`import { Pagination } from 'src/components/navigation/Pagination/Pagination'`  ·  examples: Compact, Playground, Variants, Controlled, Narrow

| Prop | Type | Default |
| --- | --- | --- |
| `count` | number 1–40 | `12` |
| `siblings` | number 0–3 | `1` |
| `variant` | `default` / `outline` / `simple` | `"default"` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `labels` | boolean | `false` |

#### Sidebar nav
App shell with sections, nested groups (animated open/close), badges and an icon-only collapsed rail. Below ~620px of container width it becomes a top bar + off-canvas drawer (Esc or the scrim closes it). Extra: a glowing gradient slab springs between items, icons wobble, the logo has an orbiting ring.
`import { SidebarNav } from 'src/components/navigation/SidebarNav/SidebarNav'`  ·  examples: Rail, Playground, Nested Open, Collapsed, Mobile (tap ☰)

| Prop | Type | Default |
| --- | --- | --- |
| `brand` | string | `"Northwind"` |
| `logo` | `layers` / `zap` / `rocket` / `globe` / `sparkles` | `"layers"` |
| `collapsed` | boolean | `false` |
| `footer` | boolean | `true` |

#### Stepper
Steps with complete / current / upcoming states and animated connectors; horizontal or vertical, optionally clickable. Squeezed horizontally it drops the descriptions. Extra: the current step gets a spinning rainbow halo, the fill shimmers, each completed step throws confetti and finishing throws a party.
`import { Stepper } from 'src/components/navigation/Stepper/Stepper'`  ·  examples: Progress, Playground, Vertical, Clickable, All Done

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `horizontal` / `vertical` | `"horizontal"` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `clickable` | boolean | `false` |

#### Tabs
Accessible tablist with a sliding indicator. Arrow keys / Home / End move between tabs. In Extra the indicator is a neon blob that springs, stretches and squishes, and selecting a tab throws sparkles.
`import { Tabs } from 'src/components/navigation/Tabs/Tabs'`  ·  examples: Segmented, Playground, Variants, With Icons And Badges, Fitted, Many Tabs Scroll

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `underline` / `pills` / `segmented` | `"underline"` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `fitted` | boolean | `false` |

### Overlays

#### Command palette
A ⌘K launcher: combobox input + grouped listbox with fuzzy matching (word starts and runs rank higher, matched letters highlighted), ↑/↓/Enter, Escape, focus trap and focus return. `hotkey="k"` binds Ctrl/⌘+K; `inline` embeds it. Extra drops it in on a spring, turns the active row into a glowing gradient pill, shimmers the matched letters and pops confetti on select.
`import { CommandPalette } from 'src/components/overlays/CommandPalette/CommandPalette'`  ·  examples: Preview, Playground, Inline, Empty

| Prop | Type | Default |
| --- | --- | --- |
| `placeholder` | string | `"Type a command or search…"` |
| `emptyText` | string | `"No results"` |

#### Drawer
Edge panel (right, left, top, bottom) with backdrop, focus trap, Escape and backdrop-click to close. Glass and Soft float it off the edge. Extra overshoots on a spring, lights a neon edge, cascades the content in and leaves a sparkle trail.
`import { Drawer } from 'src/components/overlays/Drawer/Drawer'`  ·  examples: Preview, Playground, Sides, Navigation

| Prop | Type | Default |
| --- | --- | --- |
| `side` | `right` / `left` / `top` / `bottom` | `"right"` |
| `title` | string | `"Filters"` |
| `description` | string | `"Narrow down 1,284 results."` |
| `closeOnBackdrop` | boolean | `true` |

#### Modal
Centered dialog with backdrop, focus trap, focus return, Escape and backdrop-click to close. Becomes a bottom sheet in narrow containers. In Extra it springs in with a rotating rainbow rim, floats, and pops confetti.
`import { Modal } from 'src/components/overlays/Modal/Modal'`  ·  examples: Preview, Playground, Form, Sizes, Static

| Prop | Type | Default |
| --- | --- | --- |
| `title` | string | `"Publish changes?"` |
| `description` | string | `"Your edits will go live for everyone on the team."` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `closeOnBackdrop` | boolean | `true` |
| `hideClose` | boolean | `false` |

#### Popover
Click-triggered panel anchored to any element. Four placements, three alignments, optional arrow and close button; children can be a function receiving { close }. Extra pops it on a hard spring, adds a glow, a cursor-following sheen, 3D tilt and sparkles.
`import { Popover } from 'src/components/overlays/Popover/Popover'`  ·  examples: Preview, Playground, Placements, Profile Card

| Prop | Type | Default |
| --- | --- | --- |
| `placement` | `top` / `right` / `bottom` / `left` | `"bottom"` |
| `align` | `start` / `center` / `end` | `"center"` |
| `title` | string | `"Share link"` |
| `arrow` | boolean | `true` |
| `showClose` | boolean | `false` |

#### Toast
Wrap the app in <ToastProvider position max>, then `const { toast, dismiss, clear } = useToast()` and call `toast({ title, description, variant, duration, action })` (returns an id; duration 0 = sticky). Toasts live in an aria-live region, pause on hover/focus and show a countdown bar. Extra flips them in, glows each in its tone, uses a rainbow countdown and throws confetti for successes.
`import { Toast } from 'src/components/overlays/Toast/Toast'`  ·  examples: Preview, Playground, All Variants, With Action, Static

| Prop | Type | Default |
| --- | --- | --- |
| `position` | `bottom-right` / `bottom-center` / `bottom-left` / `top-right` / `top-center` / `top-left` | `"bottom-right"` |
| `variant` | `info` / `success` / `warning` / `danger` | `"success"` |
| `title` | string | `"Changes saved"` |
| `description` | string | `"Your profile is up to date."` |
| `duration` | number 0–10000 | `4000` |

#### Tooltip
Short hint on hover (with a delay) and instantly on keyboard focus, linked via aria-describedby; Escape hides it. Wrap one focusable element. Extra turns it into a gradient pill that wobbles out with a spinning star and a twinkle.
`import { Tooltip } from 'src/components/overlays/Tooltip/Tooltip'`  ·  examples: Preview, Playground, Placements, Toolbar (tab through it), Long Text

| Prop | Type | Default |
| --- | --- | --- |
| `content` | string | `"Copy to clipboard"` |
| `placement` | `top` / `right` / `bottom` / `left` | `"top"` |
| `delay` | number 0–1000 | `300` |

### Data display

#### Accordion
Expandable sections with animated height (no measuring), aria-expanded/aria-controls and arrow-key navigation between headers. In Extra, open items light up with a gradient rail and the chevron springs through a spin.
`import { Accordion } from 'src/components/data-display/Accordion/Accordion'`  ·  examples: Overview, Playground, Joined, Flush

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `separated` / `joined` / `flush` | `"separated"` |
| `multiple` | boolean | `false` |

#### Avatar
Picture or initials with presence status, plus AvatarGroup for overlapping stacks. In Extra, rings become a spinning gradient halo and hovering throws sparkles.
`import { Avatar } from 'src/components/data-display/Avatar/Avatar'`  ·  examples: Overview, Playground, Sizes, Status, Shapes, Group, Fallbacks

| Prop | Type | Default |
| --- | --- | --- |
| `name` | string | `"Maya Chen"` |
| `image` | boolean | `true` |
| `size` | `xs` / `sm` / `md` / `lg` / `xl` | `"xl"` |
| `shape` | `circle` / `rounded` / `square` | `"circle"` |
| `status` | `online` / `away` / `busy` / `offline` | `"online"` |
| `ring` | boolean | `true` |

#### Badge
Compact status labels, counts and removable tags. In Extra, accent badges shimmer across the rotating gradient and dots glow.
`import { Badge } from 'src/components/data-display/Badge/Badge'`  ·  examples: Overview, Playground, Tones, Status, Counts, Removable

| Prop | Type | Default |
| --- | --- | --- |
| `children` | string | `"New"` |
| `tone` | `accent` / `success` / `warning` / `danger` / `neutral` | `"accent"` |
| `variant` | `soft` / `solid` / `outline` | `"solid"` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `dot` | boolean | `false` |
| `pulse` | boolean | `false` |

#### Card
Grouped content on a raised surface: optional media, eyebrow, title, body and footer. Interactive cards are buttons or links; in Extra they tilt in 3D with a holographic sheen that follows the cursor.
`import { Card } from 'src/components/data-display/Card/Card'`  ·  examples: Compact, Playground, Variants, Interactive grid, Horizontal

| Prop | Type | Default |
| --- | --- | --- |
| `title` | string | `"Northern lights tour"` |
| `subtitle` | string | `"3 nights · Tromsø"` |
| `eyebrow` | string | `"Featured"` |
| `variant` | `elevated` / `outline` / `filled` | `"elevated"` |
| `media` | boolean | `true` |
| `interactive` | boolean | `true` |
| `horizontal` | boolean | `false` |

#### List
Rows with leading icon/avatar, title, description and trailing meta or action. `selectable` turns it into a keyboard-navigable listbox (arrows, Home/End, Enter). In Extra rows float in staggered and selection throws confetti.
`import { List } from 'src/components/data-display/List/List'`  ·  examples: Overview, Playground, People, Selectable, Plain

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `divided` / `separated` / `plain` | `"divided"` |
| `selectable` | boolean | `false` |
| `dense` | boolean | `false` |

#### Stat
KPI tile: label, a value that counts up when it scrolls into view, change vs. last period and an optional sparkline. In Extra the number is gradient-lit and sparkles when it lands.
`import { Stat } from 'src/components/data-display/Stat/Stat'`  ·  examples: Overview, Playground, Dashboard, Plain

| Prop | Type | Default |
| --- | --- | --- |
| `label` | string | `"Monthly revenue"` |
| `value` | number | `48250` |
| `prefix` | string | `"$"` |
| `suffix` | string | `""` |
| `decimals` | number 0–3 | `0` |
| `delta` | number | `12.4` |
| `invertDelta` | boolean | `false` |
| `icon` | `credit-card` / `users` / `bar-chart` / `zap` / `eye` | `"credit-card"` |
| `trend` | boolean | `true` |
| `variant` | `card` / `plain` | `"card"` |

#### Table
Sortable columns (click a header to cycle asc → desc → off, with aria-sort), row selection with an indeterminate select-all, sticky header, striped/dense modes, and a stacked card layout below 560px container width. In Extra, rows cascade in on every sort and selection glows.
`import { Table } from 'src/components/data-display/Table/Table'`  ·  examples: Overview, Playground, Sticky header + scroll, Stacked (narrow), Empty

| Prop | Type | Default |
| --- | --- | --- |
| `selectable` | boolean | `true` |
| `striped` | boolean | `false` |
| `dense` | boolean | `false` |
| `stackOnMobile` | boolean | `true` |

#### Timeline
Ordered events with toned markers, a current step, alternate (zig-zag) and horizontal layouts that collapse on narrow containers. Items reveal as they scroll in. In Extra the spine is a flowing gradient and the current step pulses.
`import { Timeline } from 'src/components/data-display/Timeline/Timeline'`  ·  examples: Overview, Playground, Order tracking, Alternate, Horizontal

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `vertical` / `horizontal` | `"vertical"` |
| `alternate` | boolean | `false` |
| `reveal` | boolean | `true` |

### Charts

#### Area chart
Volume over time, from zero. Overlapping series fade to transparent; stacked series show part-to-whole with totals in the tooltip. Extra adds breathing neon fills and comets riding the ridgelines.
`import { AreaChart } from 'src/components/charts/AreaChart/AreaChart'`  ·  examples: Thumbnail, Playground, Overlapping, Single Series, Live

| Prop | Type | Default |
| --- | --- | --- |
| `seriesCount` | number 1–6 | `3` |
| `stacked` | boolean | `true` |
| `curve` | `smooth` / `linear` / `step` | `"smooth"` |
| `grid` | boolean | `true` |
| `animate` | boolean | `true` |
| `card` | boolean | `true` |
| `height` | number 140–420 | `280` |

#### Bar chart
Hand-drawn SVG bars: grouped, stacked, horizontal, negative values. Hover a category for its tooltip, click legend items to toggle series. Mono hatches, Brutalist inks, Playful pills, Extra glows, shimmers and throws sparkles (click for confetti).
`import { BarChart } from 'src/components/charts/BarChart/BarChart'`  ·  examples: Thumbnail, Playground, Stacked, Horizontal, Negative, Live

| Prop | Type | Default |
| --- | --- | --- |
| `seriesCount` | number 1–6 | `3` |
| `months` | number 3–12 | `8` |
| `stacked` | boolean | `false` |
| `horizontal` | boolean | `false` |
| `grid` | boolean | `true` |
| `showValues` | boolean | `false` |
| `animate` | boolean | `true` |
| `card` | boolean | `true` |
| `height` | number 140–420 | `280` |

#### Donut chart
Part-to-whole for up to six categories. Slices sweep in, hovering a slice or legend row pulls it out and shows it in the centre. Extra spins a neon halo behind the ring and throws slice-coloured confetti on click.
`import { DonutChart } from 'src/components/charts/DonutChart/DonutChart'`  ·  examples: Thumbnail, Playground, Pie, Half Donut, Small, Live

| Prop | Type | Default |
| --- | --- | --- |
| `slices` | number 2–6 | `5` |
| `thickness` | number 0.1–1 | `0.3` |
| `size` | number 120–320 | `220` |
| `half` | boolean | `false` |
| `legend` | boolean | `true` |
| `showPercent` | boolean | `true` |
| `animate` | boolean | `true` |
| `card` | boolean | `true` |

#### Gauge
One value against a range, with status zones. The needle swings in on a spring and the zone status ships as icon + label (role="meter" for screen readers). Extra lights the ticks up, sprays sparks from the needle tip on every change, and throbs red in the danger zone.
`import { Gauge } from 'src/components/charts/Gauge/Gauge'`  ·  examples: Thumbnail, Playground, Zones, Semicircle, Live

| Prop | Type | Default |
| --- | --- | --- |
| `value` | number 0–100 | `72` |
| `sweep` | number 180–300 | `240` |
| `thickness` | number 6–32 | `16` |
| `size` | number 140–360 | `240` |
| `needle` | boolean | `true` |
| `ticks` | boolean | `true` |
| `showStatus` | boolean | `true` |
| `animate` | boolean | `true` |
| `card` | boolean | `true` |

#### Heatmap
Magnitude across two dimensions. Sequential uses one hue light→dark; diverging (data around zero) uses two hues with a neutral middle. Hover highlights the row and column; levels quantise like a contribution calendar. Extra makes the grid breathe in a diagonal wave and the hottest cells glow.
`import { Heatmap } from 'src/components/charts/Heatmap/Heatmap'`  ·  examples: Thumbnail, Playground, Contributions, Diverging, With Gaps

| Prop | Type | Default |
| --- | --- | --- |
| `levels` | number 0–8 | `5` |
| `maxCell` | number 10–48 | `30` |
| `showValues` | boolean | `false` |
| `legend` | boolean | `true` |
| `animate` | boolean | `true` |
| `card` | boolean | `true` |

#### Line chart
Change over time. Lines draw in left to right, a crosshair tooltip follows the pointer, and 2–4 series get direct end labels. Mono separates series by dash pattern; Extra runs glowing comets along every line.
`import { LineChart } from 'src/components/charts/LineChart/LineChart'`  ·  examples: Thumbnail, Playground, Single Series, Steps, Live

| Prop | Type | Default |
| --- | --- | --- |
| `seriesCount` | number 1–6 | `3` |
| `curve` | `smooth` / `linear` / `step` | `"smooth"` |
| `dots` | boolean | `false` |
| `grid` | boolean | `true` |
| `yZero` | boolean | `false` |
| `animate` | boolean | `true` |
| `card` | boolean | `true` |
| `height` | number 140–420 | `280` |

#### Sparkline
Word-sized trends for tables, KPI tiles and inline text. Line, area or bar; hover for the value. SparkStat pairs one with a big number and a change badge (icon + sign, never colour alone). Extra adds a heartbeat ping on the latest point.
`import { Sparkline } from 'src/components/charts/Sparkline/Sparkline'`  ·  examples: Thumbnail, Playground, Kpi Tiles, In Table, Inline, Live

| Prop | Type | Default |
| --- | --- | --- |
| `type` | `line` / `area` / `bar` | `"area"` |
| `curve` | `smooth` / `linear` / `step` | `"smooth"` |
| `points` | number 5–60 | `24` |
| `width` | number 60–400 | `220` |
| `height` | number 16–100 | `48` |
| `color` | number 0–5 | `0` |
| `showLast` | boolean | `true` |
| `showMinMax` | boolean | `false` |
| `animate` | boolean | `true` |

### Media

#### Carousel
Drag or swipe, arrows, dots, keyboard (←/→/Home/End) and autoplay that pauses on hover or focus. Effects: slide, fade and a 3D coverflow, which the Extra style uses by default with reflections and a sheen sweep.
`import { Carousel } from 'src/components/media/Carousel/Carousel'`  ·  examples: Autoplay, Playground, Fade, Coverflow, No loop (rubber-band ends), Controlled with thumbnails

| Prop | Type | Default |
| --- | --- | --- |
| `effect` | `auto` / `slide` / `fade` / `coverflow` | `"auto"` |
| `autoplay` | boolean | `true` |
| `interval` | number 1500–8000 | `4000` |
| `loop` | boolean | `true` |
| `arrows` | boolean | `true` |
| `dots` | boolean | `true` |
| `captions` | boolean | `true` |
| `aspect` | `16 / 9` / `4 / 3` / `21 / 9` / `1 / 1` | `"16 / 9"` |

#### Image gallery
Grid, masonry and bento layouts with hover, below or no captions. Tiles open the Lightbox. In Extra they fly in, tilt toward the cursor with a holographic sheen and sparkle on click.
`import { ImageGallery } from 'src/components/media/ImageGallery/ImageGallery'`  ·  examples: Grid, Playground, Masonry, Bento, Captions Below

| Prop | Type | Default |
| --- | --- | --- |
| `layout` | `grid` / `masonry` / `bento` | `"grid"` |
| `columns` | number 2–6 | `3` |
| `gap` | number 0–32 | `12` |
| `captions` | `hover` / `below` / `none` | `"hover"` |
| `lightbox` | boolean | `true` |

#### Lightbox
Full-screen viewer with zoom (click the image, or +/−/0), arrow-key navigation, a thumbnail strip, focus trap and Escape. In Extra the image warps in through a hue shift and wears a living rainbow frame.
`import { Lightbox } from 'src/components/media/Lightbox/Lightbox'`  ·  examples: Click a thumbnail, Playground, Single Image

| Prop | Type | Default |
| --- | --- | --- |
| `thumbnails` | boolean | `true` |
| `loop` | boolean | `true` |
| `startAt` | number 0–7 | `0` |

#### Video player
Custom controls around a native <video>: scrubber with buffered range and hover time, volume, speed, fullscreen, controls that hide when idle, plus keys (Space/K, ←/→, J/L, ↑/↓, M, F, 0–9). The demo clip is rendered in the browser via canvas + MediaRecorder. In Extra a blurred live copy of the video glows behind the player.
`import { demoClip } from 'src/components/media/VideoPlayer/demoClip'`  ·  examples: Default, Playground, Autoplay, Loading state

| Prop | Type | Default |
| --- | --- | --- |
| `title` | string | `"Generated in your browser"` |
| `aspect` | `16 / 9` / `4 / 3` / `21 / 9` | `"16 / 9"` |
| `loop` | boolean | `true` |
| `muted` | boolean | `false` |

### Feedback

#### Alert
Inline banner for status messages. Four tones, three variants, optional title, actions and dismiss. Warnings and errors use role="alert"; others role="status".
`import { Alert } from 'src/components/feedback/Alert/Alert'`  ·  examples: Tones, Playground, Variants, With Actions, Dismissible

| Prop | Type | Default |
| --- | --- | --- |
| `title` | string | `"Update available"` |
| `children` | string (multiline) | `"Version 2.4 adds dark mode and faster exports."` |
| `tone` | `info` / `success` / `warning` / `danger` | `"info"` |
| `variant` | `soft` / `outline` / `solid` | `"soft"` |
| `dismissible` | boolean | `true` |

#### Empty state
What to show when there is nothing to show: icon art, title, a short explanation and the action that fixes it. Plain or card variant; accent, danger or success tone.
`import { EmptyState } from 'src/components/feedback/EmptyState/EmptyState'`  ·  examples: Compact, Playground, No Results, Error, Success, In AList

| Prop | Type | Default |
| --- | --- | --- |
| `icon` | `check` / `x` / `chevron-down` / `chevron-up` / `chevron-left` / `chevron-right` / `plus` / `minus` / `search` / `arrow-right` / `arrow-left` / `arrow-up` / `arrow-down` / `menu` / `more` / `calendar` / `upload` / `download` / `info` / `alert` / `check-circle` / `x-circle` / `star` / `heart` / `play` / `pause` / `volume` / `mute` / `maximize` / `home` / `sliders` / `user` / `users` / `bell` / `mail` / `copy` / `trash` / `edit` / `external` / `file` / `image` / `sun` / `moon` / `zap` / `sparkles` / `trending-up` / `trending-down` / `grid` / `list` / `filter` / `clock` / `lock` / `globe` / `settings` / `command` / `link` / `bold` / `italic` / `underline` / `align-left` / `align-center` / `align-right` / `folder` / `bar-chart` / `pie-chart` / `layers` / `rocket` / `shield` / `credit-card` / `message` / `eye` / `refresh` / `inbox` / `quote` | `"folder"` |
| `title` | string | `"No projects yet"` |
| `description` | string (multiline) | `"Projects keep your files, people and deadlines in one place. Create your first one to get going."` |
| `tone` | `accent` / `success` / `danger` | `"accent"` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `variant` | `plain` / `card` | `"card"` |

#### Progress bar
Linear progress with label and value, four tones, three sizes, stripes and an indeterminate mode (omit `value`). In Extra it grows a comet head and throws confetti when it reaches 100%.
`import { ProgressBar } from 'src/components/feedback/ProgressBar/ProgressBar'`  ·  examples: Overview, Playground, Animated, Tones, Sizes And Stripes, Indeterminate

| Prop | Type | Default |
| --- | --- | --- |
| `value` | number 0–100 | `62` |
| `label` | string | `"Uploading assets"` |
| `showValue` | boolean | `true` |
| `size` | `sm` / `md` / `lg` | `"md"` |
| `tone` | `accent` / `success` / `warning` / `danger` | `"accent"` |
| `striped` | boolean | `false` |
| `indeterminate` | boolean | `false` |

#### Skeleton
Loading placeholders: lines of text, circles and blocks. They are aria-hidden; mark the loading region with aria-busy. Each style has its own idea of "loading": shimmer, breathing, marching hatches, blinking blocks, holographic foil.
`import { Skeleton } from 'src/components/feedback/Skeleton/Skeleton'`  ·  examples: Card, Playground, Media Card, List, Loading To Content

| Prop | Type | Default |
| --- | --- | --- |
| `lines` | number 1–8 | `3` |
| `circle` | boolean | `true` |
| `animate` | boolean | `true` |

#### Spinner
Loading indicator in five shapes. role="status" with a hidden `label`. tone="current" inherits the text colour, for use inside buttons.
`import { Spinner } from 'src/components/feedback/Spinner/Spinner'`  ·  examples: All, Playground, Sizes, In Context

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `ring` / `dots` / `bars` / `pulse` / `orbit` | `"ring"` |
| `size` | number 12–96 | `44` |
| `label` | string | `"Loading"` |

### Motion

#### Marquee
A seamless infinite scroller (two copies, each sliding by its own measured width) in any direction, with pause or slow on hover and faded edges. With reduced motion it becomes a normal scrollable row. In Extra the items are neon gradient text and hovering turbo-charges it to 4×.
`import { Marquee } from 'src/components/motion/Marquee/Marquee'`  ·  examples: Logo wall, Playground, Crossing bands, Ticker (slows on hover), Vertical testimonial columns

| Prop | Type | Default |
| --- | --- | --- |
| `speed` | number 10–300 | `60` |
| `direction` | `left` / `right` | `"left"` |
| `hover` | `pause` / `slow` / `none` | `"pause"` |
| `gap` | number 0–120 | `48` |
| `fade` | boolean | `true` |

#### Number counter
Counts up when scrolled into view and tweens again whenever the value changes. Choose a tweened number or an odometer of rolling digit columns, formatted with Intl.NumberFormat (currency, compact, percent…). Screen readers only hear the final value. In Extra the digits spin like a slot machine in neon and finish with confetti.
`import { NumberCounter } from 'src/components/motion/NumberCounter/NumberCounter'`  ·  examples: Stats (press ↻ to replay), Playground, Odometer, Changing values, Compact

| Prop | Type | Default |
| --- | --- | --- |
| `value` | number | `12480` |
| `variant` | `count` / `odometer` | `"count"` |
| `duration` | number 200–4000 | `1600` |
| `decimals` | number 0–3 | `0` |
| `easing` | `out` / `inOut` / `linear` / `spring` | `"out"` |
| `prefix` | string | `""` |
| `suffix` | string | `"+"` |

#### Page transition
Change pageKey and the old page plays out while the new one plays in, stacked in the same grid cell. Effects: fade, direction-aware slide, scale, flip, wipe and portal, a circle that opens from wherever you last clicked. In Extra the portal has a glowing rainbow rim and the leaving page glitches out.
`import { PageTransition } from 'src/components/motion/PageTransition/PageTransition'`  ·  examples: Auto-cycling tabs, Playground, Pick an effect

| Prop | Type | Default |
| --- | --- | --- |
| `effect` | `auto` / `fade` / `slide` / `scale` / `flip` / `wipe` / `portal` | `"auto"` |
| `duration` | number 0–1500 | `0` |

#### Parallax
Layered scenes that move at different speeds, driven by scroll (the nearest scroll container, or the page) or by the pointer. Layers only use transforms through CSS variables updated in requestAnimationFrame. Reduced motion holds still. In Extra the scene becomes a 3D diorama that tilts toward the cursor, and its colours drift as you scroll.
`import { Parallax } from 'src/components/motion/Parallax/Parallax'`  ·  examples: Pointer, Playground, Scroll (inside a scroll container), Floating cards

| Prop | Type | Default |
| --- | --- | --- |
| `mode` | `pointer` / `scroll` | `"pointer"` |
| `strength` | number 0–3 | `1` |
| `height` | number 180–520 | `320` |

#### Reveal on scroll
Children animate in the first time they enter the viewport, using IntersectionObserver. Effects: fade, fade-up/down, slide, zoom, blur, flip and warp. Brutalist and Mono use stepped timing, Playful overshoots, and in Extra every element warps in with a chromatic flash and sparkles. With reduced motion everything is shown immediately.
`import { RevealOnScroll } from 'src/components/motion/RevealOnScroll/RevealOnScroll'`  ·  examples: All effects (press ↻ to replay), Playground, Inside a scroll container, Every time (once = false)

| Prop | Type | Default |
| --- | --- | --- |
| `effect` | `auto` / `fade` / `fade-up` / `fade-down` / `slide-left` / `slide-right` / `zoom` / `blur` / `flip` / `warp` | `"auto"` |
| `delay` | number 0–1000 | `0` |
| `duration` | number 0–2000 | `0` |
| `once` | boolean | `true` |

#### Stagger list
Children enter one after another. Items added later animate in on their own, and reorders glide into place (FLIP). Playful pops, Brutalist and Mono step, and in Extra rows warp in and a neon comet streaks across each one.
`import { StaggerList } from 'src/components/motion/StaggerList/StaggerList'`  ·  examples: People (press ↻ to replay), Playground, Add, remove and shuffle, Grid (pop)

| Prop | Type | Default |
| --- | --- | --- |
| `effect` | `auto` / `rise` / `fade` / `scale` / `slide` / `flip` / `pop` | `"auto"` |
| `stagger` | number 0–300 | `70` |
| `duration` | number 0–1500 | `0` |

#### Typewriter
Types, pauses, deletes and cycles through words with a human-ish rhythm, or scrambles each word out of random glyphs. Screen readers get the plain text. Brutalist highlights the typed text and Playful bounces the cursor. In Extra it scrambles in neon with an RGB-split glitch and a sparkle per word.
`import { Typewriter } from 'src/components/motion/Typewriter/Typewriter'`  ·  examples: Headline, Playground, Scramble, Terminal (types once)

| Prop | Type | Default |
| --- | --- | --- |
| `words` | string | `"delightful, fast, accessible, yours"` |
| `mode` | `auto` / `type` / `scramble` | `"auto"` |
| `cursor` | `bar` / `block` / `underscore` / `none` | `"bar"` |
| `typeSpeed` | number 20–200 | `70` |
| `pause` | number 300–4000 | `1500` |
| `loop` | boolean | `true` |

### Sections

#### FAQ
Accordion FAQ (aria-expanded buttons, arrow keys move between questions, smooth height animation) in a centered or split layout with a contact card. Extra: the open question gets a rainbow border and sparkles.
`import { FAQ } from 'src/components/sections/FAQ/FAQ'`  ·  examples: Playground, Split

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `centered` / `split` | `"centered"` |
| `multiple` | boolean | `false` |
| `contact` | boolean | `true` |
| `title` | string | `"Questions, answered"` |
| `highlight` | string | `"answered"` |

#### Feature grid
Feature section as cards, a two-column list, or a bento grid with one hero tile. Extra: holographic tilt cards with a cursor-following sheen and sparkling icons.
`import { FeatureGrid } from 'src/components/sections/FeatureGrid/FeatureGrid'`  ·  examples: Playground, Bento, List, Two Columns

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `cards` / `list` / `bento` | `"cards"` |
| `columns` | `2` / `3` | `3` |
| `eyebrow` | string | `"Features"` |
| `title` | string | `"Everything you need, nothing you don’t"` |
| `highlight` | string | `"nothing"` |
| `lead` | string (multiline) | `"Six reasons teams switch, and the reason they stay: it just keeps getting out of the way."` |

#### Footer
Site footer: multi-column links with a validated newsletter form and a status pill, a one-row simple version, and a mega version with a giant wordmark. Extra: the wordmark does a rainbow stadium wave and subscribing sends a burst of love letters.
`import { Footer } from 'src/components/sections/Footer/Footer'`  ·  examples: Playground, Mega, Simple

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `columns` / `simple` / `mega` | `"columns"` |
| `brand` | string | `"Lumen"` |
| `tagline` | string | `"Components in eight styles, from boardroom to completely unnecessary."` |
| `newsletter` | boolean | `true` |

#### Hero
Top-of-page hero in three layouts: centered with product shot, split with a floating stat, and centered with a stats band. Extra: floating blobs, a tilting holographic screenshot, sparkly badge and marquee logos.
`import { Hero } from 'src/components/sections/Hero/Hero'`  ·  examples: Playground, Split, With Stats, Minimal

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `centered` / `split` / `stats` | `"centered"` |
| `eyebrow` | string | `"New · Version 2.0 is here"` |
| `title` | string | `"Build pages people actually remember"` |
| `highlight` | string | `"remember"` |
| `subtitle` | string (multiline) | `"A kit of components in eight wildly different styles. Swap the look of an entire site without touching a single component."` |
| `primary` | string | `"Get started free"` |
| `secondary` | string | `"See how it works"` |
| `image` | boolean | `true` |

#### Pricing table
Three plans with a monthly/yearly radiogroup (arrow keys work), animated prices, a highlighted plan and an optional comparison table. Extra: holographic foil cards that tilt toward the cursor, and confetti when you pick a plan.
`import { PricingTable } from 'src/components/sections/PricingTable/PricingTable'`  ·  examples: Playground, With Comparison, Yearly

| Prop | Type | Default |
| --- | --- | --- |
| `featured` | `Starter` / `Pro` / `Enterprise` / `none` | `"Pro"` |
| `discount` | number 0–50 | `20` |
| `currency` | `$` / `€` / `£` / `kr` | `"$"` |
| `defaultBilling` | `monthly` / `yearly` | `"monthly"` |
| `comparison` | boolean | `false` |
| `title` | string | `"Simple pricing, no surprises"` |
| `highlight` | string | `"no surprises"` |

#### Testimonials
Social proof as a masonry grid, a two-row marquee that pauses on hover, or a single spotlight quote with arrows, dots and autoplay. Extra: glowing gradient cards, a wobbling neon quote mark and sparkly stars.
`import { Testimonials } from 'src/components/sections/Testimonials/Testimonials'`  ·  examples: Playground, Marquee, Spotlight

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `grid` / `marquee` / `spotlight` | `"grid"` |
| `title` | string | `"Loved by teams who ship"` |
| `highlight` | string | `"Loved"` |
| `lead` | string | `"Don’t take our word for it. Take theirs."` |
| `autoplay` | boolean | `true` |
| `speed` | number 10–90 | `40` |

## 7. Page recipes
Proven block orders. The workshop's page builder has these as templates.

**Landing page:** Marketing site: navbar, hero, logos, features, numbers, testimonials, pricing, FAQ, footer.
1. navbar (Bar)
2. hero (Playground)
3. marquee (Logo wall)
4. feature grid (Bento)
5. number counter (Stats (press ↻ to replay))
6. testimonials (Playground)
7. pricing table (Playground)
8. faq (Split)
9. footer (Playground)

**Dashboard:** Analytics app: KPI tiles, line + donut charts, bars, gauge, data table, activity.
1. navbar (Bar)
2. breadcrumbs (Simple)
3. sparkline (Kpi Tiles)
4. row of [line chart (Playground), donut chart (Playground)]
5. row of [bar chart (Stacked), gauge (Zones)]
6. table (Playground)
7. row of [timeline (Overview), list (People)]
8. pagination (Compact)

**App & forms:** Product UI: tabs, forms, toggles, upload, alerts, overlays, media, empty states.
1. navbar (Bar)
2. stepper (Progress)
3. tabs (Playground)
4. row of [text field (Playground), dropdown (Playground), date picker (Playground)]
5. row of [switch (Settings), checkbox (Select All), radio group (Cards)]
6. row of [slider (Price Range), file upload (Playground)]
7. alert (Tones)
8. row of [modal (Preview), drawer (Preview), toast (Preview), command palette (Preview)]
9. row of [card (Interactive grid)]
10. carousel (Autoplay)
11. row of [accordion (Overview), empty state (Compact)]

**Motion showcase:** Every animation component: typewriter, reveals, stagger, counters, parallax, marquee, transitions.
1. typewriter (Headline)
2. parallax (Pointer)
3. reveal on scroll (All effects (press ↻ to replay))
4. stagger list (Grid (pop))
5. number counter (Stats (press ↻ to replay))
6. marquee (Crossing bands)
7. page transition (Auto-cycling tabs)
8. image gallery (Bento)

## 8. Checklist before you ship a page
- [ ] Only `--ui-*` tokens, no raw colours or pixel radii
- [ ] Built from existing components where one exists
- [ ] Works at 390 / 768 / 1280px and in light + dark
- [ ] Keyboard and screen-reader friendly, visible focus
- [ ] Motion respects reduced-motion
- [ ] Feels like the personality above: Friendly, bouncy and a bit cheeky

