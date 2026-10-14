/*
 * Renders a short demo video entirely in the browser (canvas -> MediaRecorder -> blob URL), so the player
 * has something real to play offline. Recorded once per page load and shared by every story.
 */
let cache = null

export const DEMO_SECONDS = 8

export function demoClip({ seconds = DEMO_SECONDS, width = 960, height = 540 } = {}) {
  if (cache) return cache
  cache = new Promise((resolve, reject) => {
    if (typeof MediaRecorder === 'undefined') return reject(new Error('MediaRecorder is not supported here'))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    const stream = canvas.captureStream(30)
    const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t))
    if (!mimeType) return reject(new Error('No supported video format'))
    const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3_000_000 })
    const chunks = []
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
    rec.onstop = () => resolve(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })))
    rec.onerror = (e) => reject(e.error ?? new Error('Recording failed'))
    const start = performance.now()
    // setTimeout instead of rAF so recording keeps going if the tab isn't painting.
    const tick = () => {
      const t = (performance.now() - start) / 1000
      paint(ctx, Math.min(t, seconds), width, height, seconds)
      if (t < seconds) setTimeout(tick, 1000 / 30)
      else rec.stop()
    }
    rec.start(200)
    tick()
  })
  cache.catch(() => (cache = null)) // allow a retry
  return cache
}

function paint(ctx, t, w, h, total) {
  const hue = (t * 25) % 360
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, `hsl(${hue}, 80%, 55%)`)
  g.addColorStop(1, `hsl(${(hue + 120) % 360}, 75%, 35%)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // Orbiting blobs
  for (let i = 0; i < 6; i++) {
    const a = t * (0.6 + i * 0.15) + i
    const x = w / 2 + Math.cos(a) * w * (0.18 + i * 0.04)
    const y = h / 2 + Math.sin(a * 1.3) * h * (0.15 + i * 0.03)
    ctx.beginPath()
    ctx.fillStyle = `hsla(${(hue + i * 50) % 360}, 90%, 70%, 0.35)`
    ctx.arc(x, y, 40 + i * 14, 0, Math.PI * 2)
    ctx.fill()
  }

  // Bouncing ball, so seeking is visibly frame-accurate
  const bx = (w * 0.1 + ((t * 220) % (w * 0.8)))
  const by = h * 0.72 - Math.abs(Math.sin(t * 3)) * h * 0.3
  ctx.beginPath()
  ctx.fillStyle = '#fff'
  ctx.arc(bx, by, 18, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.font = `700 ${Math.round(h / 7)}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${t.toFixed(1)}s`, w / 2, h / 2)
  ctx.font = `500 ${Math.round(h / 26)}px system-ui, sans-serif`
  ctx.fillText('Demo clip, rendered in your browser', w / 2, h / 2 + h / 12)

  // Progress line along the bottom
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillRect(0, h - 8, w, 8)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, h - 8, (w * t) / total, 8)
}
