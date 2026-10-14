import { Button } from '../../actions/Button/Button'
import { Toast, ToastProvider, useToast } from './Toast'

export default {
  title: 'Toast',
  category: 'Overlays',
  status: 'ready',
  description:
    'Wrap the app in <ToastProvider position max>, then `const { toast, dismiss, clear } = useToast()` and call `toast({ title, description, variant, duration, action })` (returns an id; duration 0 = sticky). Toasts live in an aria-live region, pause on hover/focus and show a countdown bar. Extra flips them in, glows each in its tone, uses a rainbow countdown and throws confetti for successes.',
  height: 420,
  controls: {
    position: { type: 'select', options: ['bottom-right', 'bottom-center', 'bottom-left', 'top-right', 'top-center', 'top-left'], default: 'bottom-right' },
    variant: { type: 'radio', options: ['info', 'success', 'warning', 'danger'], default: 'success' },
    title: { type: 'text', default: 'Changes saved' },
    description: { type: 'text', default: 'Your profile is up to date.' },
    duration: { type: 'range', min: 0, max: 10000, step: 500, default: 4000 },
  },
}

export const Preview = () => (
  <div style={{ display: 'grid', gap: 8, width: 300 }}>
    <Toast variant="success" title="Saved" description="All changes synced." onClose={() => {}} />
    <Toast variant="danger" title="Upload failed" onClose={() => {}} />
  </div>
)
Preview.height = 200

function Trigger({ variant, title, description, duration }) {
  const { toast, clear } = useToast()
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <Button icon="bell" onClick={() => toast({ variant, title, description, duration })}>Show toast</Button>
      <Button variant="ghost" onClick={clear}>Clear</Button>
    </div>
  )
}

export const Playground = (args) => (
  <ToastProvider position={args.position}>
    <Trigger {...args} />
  </ToastProvider>
)

function Variants() {
  const { toast } = useToast()
  const examples = {
    info: { title: 'New version available', description: 'Refresh to get the latest features.' },
    success: { title: 'Payment received', description: '$240.00 from Acme Inc.' },
    warning: { title: 'Storage almost full', description: 'You have used 92% of 10 GB.' },
    danger: { title: 'Couldn’t connect', description: 'Check your network and try again.' },
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {Object.entries(examples).map(([variant, ex]) => (
        <Button key={variant} variant="outline" onClick={() => toast({ variant, ...ex })}>
          {variant}
        </Button>
      ))}
    </div>
  )
}

export const AllVariants = () => (
  <ToastProvider>
    <Variants />
  </ToastProvider>
)

function Undo() {
  const { toast } = useToast()
  return (
    <Button
      variant="danger"
      icon="trash"
      onClick={() =>
        toast({
          title: 'Message deleted',
          duration: 6000,
          action: { label: 'Undo', onClick: () => toast({ variant: 'success', title: 'Restored', duration: 2500 }) },
        })
      }
    >
      Delete message
    </Button>
  )
}

export const WithAction = () => (
  <ToastProvider position="bottom-center">
    <Undo />
  </ToastProvider>
)

export const Static = () => (
  <div style={{ display: 'grid', gap: 10, width: 'min(380px, 100%)' }}>
    <Toast variant="info" title="Heads up" description="Maintenance tonight at 22:00." />
    <Toast variant="success" title="Deployed" description="v2.4.1 is live." onClose={() => {}} />
    <Toast variant="warning" title="Unsaved changes" action={{ label: 'Save' }} onClose={() => {}} />
    <Toast variant="danger" title="Build failed" description="3 tests failing in checkout." duration={8000} onClose={() => {}} />
  </div>
)
Static.height = 360
