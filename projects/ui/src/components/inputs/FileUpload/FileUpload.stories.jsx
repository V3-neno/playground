import { FileUpload } from './FileUpload'

export default {
  title: 'File upload',
  category: 'Inputs',
  status: 'ready',
  description: 'Drop zone (click or drag) with a file list, simulated progress, type/size/count validation and remove. Nothing leaves the browser. In Extra the border is a moving rainbow and dropping files sets off paper confetti.',
  controls: {
    label: { type: 'text', default: 'Drop files here' },
    hint: { type: 'text', default: 'PNG, JPG or PDF up to 5 MB' },
    accept: { type: 'text', default: 'image/*,.pdf' },
    multiple: { type: 'boolean', default: true },
    compact: { type: 'boolean', default: false },
    simulate: { type: 'boolean', default: true },
    disabled: { type: 'boolean', default: false },
  },
}

export const Playground = (args) => (
  <div style={{ width: 'min(100%, 400px)' }}>
    <FileUpload {...args} maxSize={5 * 1024 * 1024} />
  </div>
)

export const Compact = () => (
  <div style={{ width: 'min(100%, 380px)' }}>
    <FileUpload compact label="Attach a file" hint="Any file, one at a time" multiple={false} />
  </div>
)

export const Limits = () => (
  <div style={{ width: 'min(100%, 400px)' }}>
    <FileUpload label="Add up to 3 images" hint="Images only, max 200 KB each" accept="image/*" maxSize={200 * 1024} maxFiles={3} />
  </div>
)

export const Disabled = () => (
  <div style={{ width: 'min(100%, 400px)' }}>
    <FileUpload label="Uploads are paused" hint="Try again later" disabled />
  </div>
)
