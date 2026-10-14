import { useEffect, useId, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, sparkle, useFx } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import './FileUpload.css'

const formatSize = (b) => (b < 1024 ? `${b} B` : b < 1024 ** 2 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 ** 2).toFixed(1)} MB`)
const iconFor = (type) => (type.startsWith('image/') ? 'image' : type.includes('pdf') || type.startsWith('text/') ? 'file' : 'folder')

function matchesAccept(file, accept) {
  if (!accept) return true
  return accept.split(',').some((rule) => {
    const r = rule.trim().toLowerCase()
    if (r.startsWith('.')) return file.name.toLowerCase().endsWith(r)
    if (r.endsWith('/*')) return file.type.startsWith(r.slice(0, -1))
    return file.type === r
  })
}

/**
 * Drop zone + file list. Nothing is actually uploaded: with `simulate` each file gets a fake
 * progress bar so the states can be designed. Read the File objects via onFilesChange.
 */
export function FileUpload({
  label = 'Upload files',
  hint,
  accept,
  multiple = true,
  maxSize, // bytes
  maxFiles,
  simulate = true,
  compact = false,
  disabled,
  onFilesChange,
  className,
}) {
  const [items, setItems] = useState([]) // { id, file, progress, error }
  const [over, setOver] = useState(false)
  const input = useRef(null)
  const zone = useRef(null)
  const depth = useRef(0) // dragenter/leave fire for children too
  const id = useId()
  const fx = useFx()
  const counter = useRef(0)

  useEffect(() => onFilesChange?.(items.filter((i) => !i.error).map((i) => i.file)), [items]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fake upload progress.
  useEffect(() => {
    if (!simulate || !items.some((i) => !i.error && i.progress < 100)) return
    const t = setInterval(() => {
      setItems((list) =>
        list.map((i) => (i.error || i.progress >= 100 ? i : { ...i, progress: Math.min(100, i.progress + 4 + Math.random() * 14) })),
      )
    }, 160)
    return () => clearInterval(t)
  }, [items, simulate])

  // Extra: each file that finishes gets its own little sparkle.
  const done = useRef(new Set())
  useEffect(() => {
    for (const i of items) {
      if (i.progress >= 100 && !done.current.has(i.id)) {
        done.current.add(i.id)
        if (fx) sparkle(zone.current?.parentElement?.querySelector(`[data-file="${i.id}"] .ui-upload__status`), { count: 8, spread: 30 })
      }
    }
  }, [items, fx])

  const add = (files, e) => {
    if (disabled) return
    const incoming = [...files].slice(0, multiple ? undefined : 1)
    if (!incoming.length) return
    setItems((list) => {
      const base = multiple ? list : []
      const room = maxFiles ? Math.max(0, maxFiles - base.length) : Infinity
      const next = incoming.map((file, n) => ({
        id: `f${++counter.current}`,
        file,
        progress: simulate ? 0 : 100,
        error:
          n >= room
            ? `Only ${maxFiles} files allowed`
            : !matchesAccept(file, accept)
              ? 'File type not allowed'
              : maxSize && file.size > maxSize
                ? `Larger than ${formatSize(maxSize)}`
                : null,
      }))
      return [...base, ...next]
    })
    if (fx) burst(e?.clientX ? e : zone.current, { count: 34, spread: 140, shapes: ['📄', '✨', 'star', 'circle'] })
  }

  const remove = (itemId) => setItems((list) => list.filter((i) => i.id !== itemId))

  return (
    <div className={cx('ui-upload', compact && 'ui-upload--compact', className)} data-disabled={disabled || undefined}>
      <label
        ref={zone}
        htmlFor={id}
        className="ui-upload__zone"
        data-over={over || undefined}
        onDragEnter={(e) => {
          e.preventDefault()
          depth.current++
          setOver(true)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          depth.current = Math.max(0, depth.current - 1)
          if (!depth.current) setOver(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          depth.current = 0
          setOver(false)
          add(e.dataTransfer.files, e)
        }}
      >
        <input
          ref={input}
          id={id}
          type="file"
          className="ui-sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => {
            add(e.target.files)
            e.target.value = '' // allow picking the same file again
          }}
        />
        <span className="ui-upload__icon" aria-hidden>
          <Icon name="upload" size={compact ? 18 : 22} />
        </span>
        <span className="ui-upload__text">
          <span className="ui-upload__title">
            {over ? 'Drop to add' : label} {!over && <span className="ui-upload__browse">or browse</span>}
          </span>
          {hint && (
            <span className="ui-upload__hint" id={`${id}-hint`}>
              {hint}
            </span>
          )}
        </span>
      </label>
      {items.length > 0 && (
        <ul className="ui-upload__list" aria-live="polite">
          {items.map((i) => {
            const complete = !i.error && i.progress >= 100
            return (
              <li key={i.id} className="ui-upload__item" data-file={i.id} data-error={i.error ? true : undefined} data-done={complete || undefined}>
                <span className="ui-upload__file-icon">
                  <Icon name={i.error ? 'alert' : iconFor(i.file.type)} size={16} />
                </span>
                <span className="ui-upload__meta">
                  <span className="ui-upload__name" title={i.file.name}>
                    {i.file.name}
                  </span>
                  <span className="ui-upload__sub">
                    {i.error ?? (complete ? formatSize(i.file.size) : `${Math.round(i.progress)}% · ${formatSize(i.file.size)}`)}
                  </span>
                  {!i.error && !complete && (
                    <span className="ui-upload__bar" role="progressbar" aria-label={`Uploading ${i.file.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(i.progress)}>
                      <span style={{ width: `${i.progress}%` }} />
                    </span>
                  )}
                </span>
                <span className="ui-upload__status" aria-hidden>
                  {complete && <Icon name="check-circle" size={18} />}
                </span>
                <button type="button" className="ui-upload__remove" aria-label={`Remove ${i.file.name}`} onClick={() => remove(i.id)}>
                  <Icon name={complete || i.error ? 'trash' : 'x'} size={15} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
