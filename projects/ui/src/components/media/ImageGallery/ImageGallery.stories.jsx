import { PHOTOS, placeholder } from '../../../lib/placeholder'
import { ImageGallery } from './ImageGallery'

// Varied heights for masonry, still generated offline.
const TALLS = [520, 760, 640, 900, 560, 820, 700, 600, 880, 540].map((h, i) => ({
  src: placeholder({ seed: i, width: 600, height: h }),
  title: PHOTOS[i % PHOTOS.length].title,
}))

export default {
  title: 'Image gallery',
  category: 'Media',
  status: 'ready',
  description:
    'Grid, masonry and bento layouts with hover, below or no captions. Tiles open the Lightbox. In Extra they fly in, tilt toward the cursor with a holographic sheen and sparkle on click.',
  layout: 'padded',
  controls: {
    layout: { type: 'radio', options: ['grid', 'masonry', 'bento'], default: 'grid' },
    columns: { type: 'range', min: 2, max: 6, default: 3 },
    gap: { type: 'range', min: 0, max: 32, step: 2, default: 12 },
    captions: { type: 'radio', options: ['hover', 'below', 'none'], default: 'hover' },
    lightbox: { type: 'boolean', default: true },
  },
}

export const Grid = () => <ImageGallery images={PHOTOS.slice(0, 6)} columns={3} gap={8} />
Grid.height = 360

export const Playground = (args) => <ImageGallery images={args.layout === 'masonry' ? TALLS : PHOTOS} {...args} />
Playground.height = 520

export const Masonry = () => <ImageGallery images={TALLS} layout="masonry" columns={4} />
Masonry.height = 520

export const Bento = () => <ImageGallery images={[...PHOTOS, ...PHOTOS.slice(0, 4)]} layout="bento" columns={4} captions="hover" />
Bento.height = 520

export const CaptionsBelow = () => <ImageGallery images={PHOTOS.slice(0, 4)} columns={4} captions="below" aspect="1 / 1" />
