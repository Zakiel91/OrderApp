import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

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

  // Auto-focus after slide-up animation completes (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300)
    return () => clearTimeout(timer)
  }, [])

  async function handleSave() {
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
            disabled={saving}
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
            value={localValue}
            onChange={e => setLocalValue(e.target.value)}
            className="w-full text-[17px] bg-transparent outline-none pb-2 text-[var(--color-text)]"
            style={{
              border: 'none',
              borderBottom: '2px solid var(--color-primary)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
