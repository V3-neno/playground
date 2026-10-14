import { useEffect, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { useInView } from '../../../lib/hooks'
import { useReducedMotion } from '../../../lib/ui-context'
import './Typewriter.css'

const GLYPHS = '!<>-_\\/[]{}=+*^?#%&@$01'

/**
 * Types out each of `words`, pauses, deletes, moves on. mode: 'type' | 'scramble' (characters decode out
 * of random glyphs) | 'auto' (scramble in the Extra style). loop = false stops on the last word.
 * cursor: 'bar' | 'block' | 'underscore' | 'none'.
 */
export function Typewriter({
  words = ['Hello, world'],
  mode = 'auto',
  typeSpeed = 70,
  deleteSpeed = 35,
  pause = 1500,
  loop = true,
  cursor = 'bar',
  startOnView = true,
  className,
}) {
  const fx = useFx()
  const reduced = useReducedMotion()
  const [ref, inView] = useInView({ once: true, threshold: 0.3 })
  const active = !startOnView || inView
  const kind = mode === 'auto' ? (fx ? 'scramble' : 'type') : mode
  const list = words.length ? words : ['']
  const shown = useTypewriter({ list, kind, typeSpeed, deleteSpeed, pause, loop, active: active && !reduced, onWord: () => fx && ref.current && sparkle(ref.current.querySelector('.ui-type__cursor') ?? ref.current) })
  const text = reduced ? list[loop ? 0 : list.length - 1] : shown

  return (
    <span ref={ref} className={cx('ui-type', `ui-type--${kind}`, `ui-type--cursor-${cursor}`, className)}>
      <span className="ui-sr-only">{loop ? list.join(', ') : list[list.length - 1]}</span>
      <span className="ui-type__text" aria-hidden="true" data-text={text}>
        {text}
      </span>
      {cursor !== 'none' && <span className="ui-type__cursor" aria-hidden="true" />}
    </span>
  )
}

function useTypewriter({ list, kind, typeSpeed, deleteSpeed, pause, loop, active, onWord }) {
  const [text, setText] = useState('')
  const onWordRef = useRef(onWord)
  onWordRef.current = onWord
  const key = list.join('\u0000')

  useEffect(() => {
    if (!active) return
    let cancelled = false
    let timer
    const wait = (ms) => new Promise((r) => (timer = setTimeout(r, ms)))
    const jitter = (ms) => ms * (0.6 + Math.random() * 0.8) // human-ish rhythm

    const typeWord = async (word) => {
      for (let i = 1; i <= word.length && !cancelled; i++) {
        setText(word.slice(0, i))
        await wait(jitter(typeSpeed))
      }
    }
    const deleteWord = async (word) => {
      for (let i = word.length - 1; i >= 0 && !cancelled; i--) {
        setText(word.slice(0, i))
        await wait(deleteSpeed)
      }
    }
    // Scramble: every position cycles random glyphs until its turn to settle on the target character.
    const scramble = async (fromWord, toWord) => {
      const len = Math.max(fromWord.length, toWord.length)
      const queue = Array.from({ length: len }, (_, i) => {
        const start = Math.floor(Math.random() * 12)
        return { from: fromWord[i] ?? '', to: toWord[i] ?? '', start, end: start + 6 + Math.floor(Math.random() * 14) }
      })
      for (let frame = 0; !cancelled; frame++) {
        let done = 0
        let out = ''
        for (const q of queue) {
          if (frame >= q.end) {
            done++
            out += q.to
          } else if (frame >= q.start) out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          else out += q.from
        }
        setText(out)
        if (done === queue.length) return
        await wait(Math.max(16, typeSpeed / 2.5))
      }
    }

    const run = async () => {
      let prev = ''
      for (let i = 0; !cancelled; i++) {
        const last = i === list.length - 1
        const word = list[i % list.length]
        if (kind === 'scramble') await scramble(prev, word)
        else await typeWord(word)
        if (cancelled) return
        onWordRef.current?.()
        if (last && !loop) return
        await wait(pause)
        if (kind !== 'scramble') await deleteWord(word)
        prev = word
        await wait(kind === 'scramble' ? 0 : typeSpeed * 3)
        if (i === list.length - 1) i = -1
      }
    }
    setText('')
    run()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [active, kind, key, typeSpeed, deleteSpeed, pause, loop]) // eslint-disable-line react-hooks/exhaustive-deps

  return text
}
