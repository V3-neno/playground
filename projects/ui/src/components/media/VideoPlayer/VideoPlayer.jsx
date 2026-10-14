import { useEffect, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, sparkle, useFx } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import './VideoPlayer.css'

const RATES = [1, 1.25, 1.5, 2, 0.5]

export const formatTime = (s) => {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

/**
 * Custom-controls video player around a native <video>.
 * Keys (when focused): Space/K play, ←/→ seek 5s, J/L seek 10s, ↑/↓ volume, M mute, F fullscreen, 0-9 jump.
 */
export function VideoPlayer({ src, poster, title, autoPlay = false, muted = false, loop = false, aspect = '16 / 9', className }) {
  const fx = useFx()
  const root = useRef(null)
  const video = useRef(null)
  const ambient = useRef(null)
  const bar = useRef(null)
  const fixDuration = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setMuted] = useState(muted)
  const [rate, setRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [idle, setIdle] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [hover, setHover] = useState(null) // { x: 0..1 } over the scrubber
  const [scrubbing, setScrubbing] = useState(false)
  const [flash, setFlash] = useState(null) // transient centre icon after a key press
  const idleTimer = useRef()

  const v = () => video.current

  // Smooth progress while playing (timeupdate only fires ~4x a second).
  useEffect(() => {
    if (!playing) return
    let id
    const loopFn = () => {
      if (!scrubbing && v()) setTime(v().currentTime)
      id = requestAnimationFrame(loopFn)
    }
    id = requestAnimationFrame(loopFn)
    return () => cancelAnimationFrame(id)
  }, [playing, scrubbing])

  // Extra: "ambient mode", a blurred copy of the video glowing behind the player.
  useEffect(() => {
    if (!fx || !ambient.current) return
    const c = ambient.current.getContext('2d')
    const id = setInterval(() => {
      const el = v()
      if (el && el.readyState >= 2) c.drawImage(el, 0, 0, ambient.current.width, ambient.current.height)
    }, 120)
    return () => clearInterval(id)
  }, [fx, src])

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === root.current)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    if (v()) v().playbackRate = rate
  }, [rate])

  const poke = () => {
    setIdle(false)
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => setIdle(true), 2200)
  }
  useEffect(() => () => clearTimeout(idleTimer.current), [])

  const toggle = (e) => {
    const el = v()
    if (!el || !src) return
    if (el.paused || el.ended) {
      el.play().catch(() => {})
      if (fx && e) burst(e, { count: 18, spread: 90 })
    } else el.pause()
  }
  const seek = (to) => {
    const el = v()
    if (!el || !duration) return
    el.currentTime = Math.max(0, Math.min(duration, to))
    setTime(el.currentTime)
  }
  const setVol = (val) => {
    const el = v()
    if (!el) return
    el.volume = Math.max(0, Math.min(1, val))
    el.muted = el.volume === 0
  }
  const toggleMute = () => {
    const el = v()
    if (!el) return
    el.muted = !el.muted
    if (!el.muted && el.volume === 0) el.volume = 0.5
  }
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else root.current?.requestFullscreen?.().catch(() => {})
  }
  const show = (icon) => {
    setFlash({ icon, id: Math.random() })
  }

  const onKeyDown = (e) => {
    if (e.target.closest('input')) return
    const k = e.key.toLowerCase()
    const actions = {
      ' ': () => (toggle(), show(v()?.paused ? 'play' : 'pause')),
      k: () => (toggle(), show(v()?.paused ? 'play' : 'pause')),
      arrowright: () => (seek(time + 5), show('chevron-right')),
      arrowleft: () => (seek(time - 5), show('chevron-left')),
      l: () => (seek(time + 10), show('chevron-right')),
      j: () => (seek(time - 10), show('chevron-left')),
      arrowup: () => (setVol(volume + 0.1), show('volume')),
      arrowdown: () => (setVol(volume - 0.1), show(volume - 0.1 <= 0 ? 'mute' : 'volume')),
      m: () => (toggleMute(), show(isMuted ? 'volume' : 'mute')),
      f: toggleFullscreen,
    }
    if (actions[k]) {
      e.preventDefault()
      actions[k]()
      poke()
    } else if (/^[0-9]$/.test(k)) {
      seek((Number(k) / 10) * duration)
      poke()
    }
  }

  // Scrubber
  const ratioAt = (e) => {
    const r = bar.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
  }
  const onBarDown = (e) => {
    if (!duration) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setScrubbing(true)
    setTime(ratioAt(e) * duration)
  }
  const onBarMove = (e) => {
    const x = ratioAt(e)
    setHover({ x })
    if (scrubbing) setTime(x * duration)
  }
  const onBarUp = (e) => {
    if (!scrubbing) return
    setScrubbing(false)
    seek(ratioAt(e) * duration)
    if (fx) sparkle(e)
  }
  const onBarKey = (e) => {
    const step = { ArrowRight: 5, ArrowLeft: -5, PageUp: 30, PageDown: -30 }[e.key]
    if (step) {
      e.preventDefault()
      e.stopPropagation()
      seek(time + step)
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      e.stopPropagation()
      seek(e.key === 'Home' ? 0 : duration)
    }
  }

  // MediaRecorder output has no duration until the end is found; jump far ahead once to make the browser compute it.
  const readDuration = () => {
    const el = v()
    if (!el) return
    if (el.duration === Infinity) {
      fixDuration.current = true
      el.currentTime = 1e101
    } else if (Number.isFinite(el.duration)) {
      setDuration(el.duration)
      if (fixDuration.current) {
        fixDuration.current = false
        el.currentTime = 0
        setTime(0)
      }
    }
  }
  const onProgress = () => {
    const el = v()
    if (el?.buffered.length && Number.isFinite(el.duration)) setBuffered(el.buffered.end(el.buffered.length - 1) / el.duration)
  }

  const pct = duration ? (time / duration) * 100 : 0
  const loading = !src || waiting

  return (
    <div
      ref={root}
      className={cx('ui-video', playing && 'is-playing', idle && playing && !scrubbing && 'is-idle', fullscreen && 'is-fullscreen', className)}
      style={{ '--_aspect': aspect }}
      tabIndex={0}
      role="region"
      aria-label={title ? `Video: ${title}` : 'Video player'}
      onKeyDown={onKeyDown}
      onPointerMove={poke}
      onPointerLeave={() => playing && setIdle(true)}
    >
      {fx && <canvas ref={ambient} className="ui-video__ambient" width="48" height="27" aria-hidden />}
      <div className="ui-video__frame">
        <video
          ref={video}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          preload="metadata"
          onClick={toggle}
          onDoubleClick={toggleFullscreen}
          onPlay={() => (setPlaying(true), poke())}
          onPause={() => (setPlaying(false), setIdle(false))}
          onEnded={() => (setPlaying(false), setIdle(false))}
          onWaiting={() => setWaiting(true)}
          onPlaying={() => setWaiting(false)}
          onCanPlay={() => setWaiting(false)}
          onLoadedMetadata={readDuration}
          onDurationChange={readDuration}
          onTimeUpdate={() => {
            if (fixDuration.current) return readDuration()
            if (!scrubbing) setTime(v().currentTime)
          }}
          onProgress={onProgress}
          onVolumeChange={() => {
            setVolume(v().volume)
            setMuted(v().muted)
          }}
        />

        {loading && (
          <div className="ui-video__loading" aria-live="polite">
            <span className="ui-video__spinner" aria-hidden />
            {!src && <span>Preparing video…</span>}
          </div>
        )}

        {!playing && src && !waiting && (
          <button type="button" className="ui-video__big" aria-label="Play" onClick={toggle}>
            <Icon name="play" size={30} />
          </button>
        )}

        {flash && (
          <span key={flash.id} className="ui-video__flash" aria-hidden onAnimationEnd={() => setFlash(null)}>
            <Icon name={flash.icon} size={26} />
          </span>
        )}

        {title && <div className="ui-video__title">{title}</div>}

        <div className="ui-video__controls">
          <div
            ref={bar}
            className={cx('ui-video__bar', scrubbing && 'is-scrubbing')}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
            onPointerDown={onBarDown}
            onPointerMove={onBarMove}
            onPointerUp={onBarUp}
            onPointerLeave={() => setHover(null)}
            onKeyDown={onBarKey}
            style={{ '--_pct': `${pct}%`, '--_buf': `${buffered * 100}%` }}
          >
            <span className="ui-video__rail">
              <span className="ui-video__buffered" />
              <span className="ui-video__played" />
            </span>
            <span className="ui-video__thumb" />
            {hover && duration > 0 && (
              <span className="ui-video__tip" style={{ left: `${hover.x * 100}%` }}>
                {formatTime(hover.x * duration)}
              </span>
            )}
          </div>

          <div className="ui-video__row">
            <button type="button" className="ui-video__btn" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle} disabled={!src}>
              <Icon name={playing ? 'pause' : 'play'} size={18} />
            </button>
            <button type="button" className="ui-video__btn" aria-label="Back 10 seconds" onClick={() => seek(time - 10)} disabled={!duration}>
              <Icon name="refresh" size={16} style={{ transform: 'scaleX(-1)' }} />
            </button>
            <div className="ui-video__volume">
              <button type="button" className="ui-video__btn" aria-label={isMuted ? 'Unmute' : 'Mute'} onClick={toggleMute}>
                <Icon name={isMuted || volume === 0 ? 'mute' : 'volume'} size={18} />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                aria-label="Volume"
                onChange={(e) => setVol(Number(e.target.value))}
                style={{ '--_vol': `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
            <span className="ui-video__time">
              {formatTime(time)} <span>/ {formatTime(duration)}</span>
            </span>
            <span className="ui-video__spacer" />
            <button
              type="button"
              className="ui-video__btn ui-video__rate"
              aria-label={`Playback speed ${rate}x`}
              onClick={() => setRate((r) => RATES[(RATES.indexOf(r) + 1) % RATES.length])}
            >
              {rate}×
            </button>
            <button type="button" className="ui-video__btn" aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={toggleFullscreen}>
              <Icon name="maximize" size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
