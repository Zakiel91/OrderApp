import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { MAX_IMAGES } from '../lib/imageUtils'

/**
 * Camera + file picker with thumbnails, shared by the production and fix wizards.
 *
 * Object URLs are created once per file list and revoked when it changes or the
 * component unmounts. Calling URL.createObjectURL() inline in the render (the
 * previous approach) leaked one blob per file on every re-render — and the
 * wizard re-renders on every keystroke.
 */
export function ImagePicker({
  files,
  onChange,
}: {
  files: File[]
  onChange: (files: File[]) => void
}) {
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [limitHit, setLimitHit] = useState(false)

  const previews = useMemo(
    () => files.map(file => ({ file, url: URL.createObjectURL(file) })),
    [files],
  )

  useEffect(() => {
    return () => { previews.forEach(p => URL.revokeObjectURL(p.url)) }
  }, [previews])

  const add = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return
    const room = MAX_IMAGES - files.length
    if (room <= 0) { setLimitHit(true); return }
    const accepted = Array.from(incoming).slice(0, room)
    setLimitHit(accepted.length < incoming.length)
    onChange([...files, ...accepted])
  }

  const remove = (idx: number) => {
    setLimitHit(false)
    onChange(files.filter((_, i) => i !== idx))
  }

  const openCamera = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = e => add((e.target as HTMLInputElement).files)
    input.click()
  }

  const atLimit = files.length >= MAX_IMAGES

  return (
    <div className="space-y-3">
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((p, idx) => (
            <div key={p.url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-border)]">
              <img src={p.url} alt={`${t('images')} ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label={`${t('delete')} ${idx + 1}`}
                onClick={() => remove(idx)}
                className="absolute top-0 right-0 bg-[var(--color-error)] text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={openCamera}
          disabled={atLimit}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm min-h-[48px] disabled:opacity-40"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          {t('camera')}
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={atLimit}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm min-h-[48px] disabled:opacity-40"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {t('upload')}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          add(e.target.files)
          // Allow re-picking the same file after a removal.
          e.target.value = ''
        }}
      />

      <p className="text-xs text-[var(--color-text-muted)]">
        {t('images_hint')}
      </p>
      {limitHit && (
        <p role="alert" className="text-xs text-[var(--color-error)]">
          {t('images_limit', { max: String(MAX_IMAGES) })}
        </p>
      )}
    </div>
  )
}
