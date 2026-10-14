import { TextField } from './TextField'

export default {
  title: 'Text field',
  category: 'Inputs',
  status: 'ready',
  description: 'Single-line or multiline input with label, hint, error, icons, clear button, password reveal and a character counter. In Extra it throws glitter as you type.',
  controls: {
    label: { type: 'text', default: 'Email' },
    placeholder: { type: 'text', default: 'you@example.com' },
    hint: { type: 'text', default: "We'll never share it." },
    error: { type: 'text', default: '' },
    icon: { type: 'select', options: ['', 'mail', 'search', 'user', 'lock', 'globe'], default: 'mail' },
    size: { type: 'radio', options: ['sm', 'md', 'lg'], default: 'md' },
    type: { type: 'select', options: ['text', 'email', 'password', 'number'], default: 'email' },
    clearable: { type: 'boolean', default: true },
    required: { type: 'boolean', default: false },
    disabled: { type: 'boolean', default: false },
  },
}

export const Playground = (args) => <TextField {...args} error={args.error || undefined} icon={args.icon || undefined} />

export const Variants = () => (
  <div style={{ display: 'grid', gap: 16, width: 320 }}>
    <TextField label="Search" icon="search" placeholder="Search anything…" clearable defaultValue="Workshop" />
    <TextField label="Password" type="password" defaultValue="hunter2" hint="At least 8 characters" />
    <TextField label="Price" icon="credit-card" suffix="SEK" defaultValue="249" />
  </div>
)

export const States = () => (
  <div style={{ display: 'grid', gap: 16, width: 320 }}>
    <TextField label="Username" defaultValue="ada" error="That name is taken" required />
    <TextField label="Disabled" defaultValue="Can't touch this" disabled />
  </div>
)

export const Sizes = () => (
  <div style={{ display: 'grid', gap: 12, width: 320 }}>
    <TextField size="sm" placeholder="Small" icon="search" />
    <TextField size="md" placeholder="Medium" icon="search" />
    <TextField size="lg" placeholder="Large" icon="search" />
  </div>
)

export const Multiline = () => (
  <div style={{ width: 360 }}>
    <TextField label="Bio" multiline maxLength={120} defaultValue="Designer of small, delightful things." hint="Shown on your profile" />
  </div>
)
