import { useEffect, useState } from 'react'
import { placeholder } from '../../../lib/placeholder'
import { demoClip } from './demoClip'
import { VideoPlayer } from './VideoPlayer'

// The demo clip is recorded in the browser on first use (takes a few seconds), then shared.
function useDemoClip() {
  const [src, setSrc] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    let live = true
    demoClip()
      .then((url) => live && setSrc(url))
      .catch((e) => live && setError(e.message))
    return () => {
      live = false
    }
  }, [])
  return { src, error }
}

const POSTER = placeholder({ seed: 5, width: 960, height: 540 })

export default {
  title: 'Video player',
  category: 'Media',
  status: 'ready',
  description:
    'Custom controls around a native <video>: scrubber with buffered range and hover time, volume, speed, fullscreen, controls that hide when idle, plus keys (Space/K, ←/→, J/L, ↑/↓, M, F, 0–9). The demo clip is rendered in the browser via canvas + MediaRecorder. In Extra a blurred live copy of the video glows behind the player.',
  layout: 'padded',
  controls: {
    title: { type: 'text', default: 'Generated in your browser' },
    aspect: { type: 'radio', options: ['16 / 9', '4 / 3', '21 / 9'], default: '16 / 9' },
    loop: { type: 'boolean', default: true },
    muted: { type: 'boolean', default: false },
  },
}

export const Default = () => {
  const { src, error } = useDemoClip()
  if (error) return <p>Demo clip unavailable: {error}</p>
  return <VideoPlayer src={src} poster={POSTER} title="Demo clip" loop />
}

export const Playground = (args) => {
  const { src } = useDemoClip()
  return <VideoPlayer src={src} poster={POSTER} {...args} />
}

export const Autoplay = () => {
  const { src } = useDemoClip()
  return <VideoPlayer src={src} autoPlay muted loop title="Autoplay (muted, looping)" aspect="21 / 9" />
}

export const Loading = () => <VideoPlayer poster={POSTER} title="Waiting for a source" />
Loading.storyName = 'Loading state'
