import { useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'

/**
 * Bottom-sheet confirmation, styled to match FieldEditSheet.
 *
 * Replaces window.confirm(), which cannot be styled, ignores the app's language
 * direction, and is suppressed outright in some installed-PWA webviews.
 */
export function ConfirmSheet({
  title,
  message,
  confirmLabel,
  destructive,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string
  message?: string
  confirmLabel: string
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const { t } = useLanguage()
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Focus the primary action, and let Escape dismiss.
  useEffect(() => {
    const timer = setTimeout(() => confirmRef.current?.focus(), 300)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end"
      style={{ background: 'rgba(0,0,0,0.35)', animation: 'fadeIn 0.2s ease' }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full bg-[var(--color-surface)] pb-10 px-5"
        style={{
          borderRadius: '20px 20px 0 0',
          animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: 'var(--shadow-sheet)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="mx-auto mt-2.5 mb-5"
          style={{ width: 36, height: 5, borderRadius: 3, background: 'rgba(60,60,67,0.18)' }}
        />

        <h2 className="text-[17px] font-semibold text-[var(--color-text)] mb-1.5">{title}</h2>
        {message && (
          <p className="text-[15px] text-[var(--color-text-secondary)] mb-5">{message}</p>
        )}

        <div className="space-y-2.5">
          <button
            ref={confirmRef}
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="w-full font-semibold rounded-xl px-4 py-4 min-h-[52px] text-[15px] text-white disabled:opacity-50"
            style={{ background: destructive ? '#dc2626' : 'var(--color-primary)' }}
          >
            {busy ? '…' : confirmLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="w-full bg-[var(--color-surface)] text-[var(--color-text)] font-medium rounded-xl px-4 py-3.5 min-h-[50px] border border-[var(--color-border)] text-[15px] disabled:opacity-50"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
