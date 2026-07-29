import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { EMAIL_RE } from '../lib/validation'

interface FieldEditSheetProps {
  field: string        // DB column name, e.g. 'client_name_raw'
  label: string        // translated display label, e.g. t('client_name')
  value: string        // current field value
  type?: string        // input type: 'text' | 'tel' | 'email' | 'number' | 'date' (default: 'text')
  saving?: boolean     // true while PATCH is in flight — disables Save button
  onSave: (field: string, value: string) => Promise<void>
  onClose: () => void
}

export function FieldEditSheet({
  field,
  label,
  value,
  type,
  saving,
  onSave,
  onClose,
}: FieldEditSheetProps) {
  const { t } = useLanguage()
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus after slide-up animation completes (300ms delay), and let Escape
  // dismiss the sheet like the backdrop tap does.
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Same checks the wizard applies, so a single-field edit can't write a value
  // the create flow would have rejected.
  const trimmed = localValue.trim()
  const invalid =
    (field === 'client_name_raw' && trimmed === '') ||
    (type === 'email' && trimmed !== '' && !EMAIL_RE.test(trimmed)) ||
    (type === 'number' && trimmed !== '' && !(parseFloat(trimmed) >= 0))

  async function handleSave() {
    if (invalid) return
    await onSave(field, localValue)
  }

  return (
    // Overlay — clicking backdrop closes without saving
    <div
      className="fixed inset-0 z-[100] flex items-end"
      style={{ background: 'rgba(0,0,0,0.35)', animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}
    >
      {/* Sheet — stopPropagation so clicks inside don't close */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="w-full bg-[var(--color-surface)] pb-10"
        style={{
          borderRadius: '20px 20px 0 0',
          animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: 'var(--shadow-sheet)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          className="mx-auto mt-2.5"
          style={{ width: 36, height: 5, borderRadius: 3, background: 'rgba(60,60,67,0.18)' }}
        />

        {/* Header: Cancel · FieldName · Save */}
        <div
          className="flex justify-between items-center px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--color-separator)' }}
        >
          <button
            type="button"
            className="text-[var(--color-text-muted)] text-[17px] bg-transparent border-none cursor-pointer font-[var(--font-body)]"
            onClick={onClose}
          >
            {t('cancel')}
          </button>
          <span className="text-[17px] font-semibold text-[var(--color-text)]">{label}</span>
          <button
            type="button"
            className="text-[var(--color-primary)] text-[17px] font-semibold bg-transparent border-none cursor-pointer disabled:opacity-40 font-[var(--font-body)]"
            disabled={saving || invalid}
            onClick={handleSave}
          >
            {saving ? '…' : t('save_changes')}
          </button>
        </div>

        {/* Input with underline */}
        <div className="px-5 pt-5 pb-2">
          <input
            ref={inputRef}
            type={type || 'text'}
            {...(type === 'number' ? { min: 0, step: 0.01 } : {})}
            value={localValue}
            onChange={e => setLocalValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !invalid && !saving) handleSave() }}
            aria-invalid={invalid}
            className="w-full text-[17px] bg-transparent outline-none pb-2 text-[var(--color-text)]"
            style={{
              border: 'none',
              borderBottom: `2px solid ${invalid ? 'var(--color-error)' : 'var(--color-primary)'}`,
            }}
          />
          {invalid && (
            <p role="alert" className="mt-2 text-[13px] text-[var(--color-error)]">
              {t(type === 'email' ? 'err_email' : type === 'number' ? 'err_positive' : 'err_required')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
