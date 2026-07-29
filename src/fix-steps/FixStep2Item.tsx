import { useState, useEffect, useRef } from 'react'
import { useFixForm } from '../context/FixFormContext'
import { useLanguage } from '../context/LanguageContext'
import { useWizardErrors } from '../context/WizardNavContext'
import { FormField, fieldClass } from '../components/FormField'
import { ImagePicker } from '../components/ImagePicker'
import { JEWELRY_TYPES, METALS_SORTED, JEWELRY_ICONS, FIX_OPTIONS } from '../lib/constants'
import { searchUpid } from '../lib/api'
import type { JewelryType, FixOption } from '../lib/types'
import type { UpidResult } from '../lib/api'

export function FixStep2Item() {
  const { form, updateField } = useFixForm()
  const { t } = useLanguage()
  const errors = useWizardErrors()

  // Results are tagged with the query that produced them, so visibility is
  // derived instead of stored. That keeps the effect free of synchronous
  // setState calls and makes a stale dropdown impossible.
  const [results, setResults] = useState<{ query: string; items: UpidResult[] }>({ query: '', items: [] })
  const [dismissed, setDismissed] = useState(false)
  // Set when the value change came from picking a result, so the dropdown
  // doesn't immediately re-open with a search for the value we just chose.
  const skipNextSearch = useRef(false)

  // Single source of truth: the form field. The old version kept a parallel
  // `upidQuery` state and rendered `upidQuery || form.main_stone`.
  const query = form.main_stone.trim()
  const showUpidResults = !dismissed && query.length >= 2 && results.query === query && results.items.length > 0

  useEffect(() => {
    if (skipNextSearch.current) { skipNextSearch.current = false; return }
    if (query.length < 2) return

    let cancelled = false
    const timer = setTimeout(() => {
      // searchUpid can reject (endpoint down / offline). Without this catch it
      // became an unhandled rejection.
      searchUpid(query)
        .then(items => { if (!cancelled) setResults({ query, items }) })
        .catch(() => { if (!cancelled) setResults({ query, items: [] }) })
    }, 300)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [query])

  const toggleFixOption = (opt: FixOption) => {
    const current = form.fix_options
    if (current.includes(opt)) {
      updateField('fix_options', current.filter(x => x !== opt))
    } else {
      updateField('fix_options', [...current, opt])
    }
  }

  return (
    <div className="p-4 space-y-1">
      <h2 className="text-lg font-semibold mb-4">{t('fix_step2_title')}</h2>

      {/* Jewelry Type */}
      <FormField label={t('jewelry_type')} required error={errors.jewelry_type}>
        <div className="grid grid-cols-3 gap-2">
          {JEWELRY_TYPES.map(jt => {
            const active = form.jewelry_type === jt.key
            return (
              <button
                key={jt.key}
                type="button"
                aria-pressed={active}
                onClick={() => updateField('jewelry_type', jt.key as JewelryType)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors min-h-[72px] ${
                  active
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'
                }`}
              >
                <span className="w-7 h-7" aria-hidden="true" dangerouslySetInnerHTML={{ __html: JEWELRY_ICONS[jt.icon] || '' }} />
                <span className="text-[12px] font-medium">{t(jt.key)}</span>
              </button>
            )
          })}
        </div>
      </FormField>

      {/* Metal */}
      <FormField label={t('metal')}>
        <div className="flex flex-wrap gap-2">
          {METALS_SORTED.map(m => (
            <button key={m} type="button"
              aria-pressed={form.metal === m}
              onClick={() => updateField('metal', form.metal === m ? '' : m)}
              className={`px-3 py-2.5 rounded-xl text-[13px] font-medium min-h-[44px] transition-colors ${
                form.metal === m
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
              }`}>{m}</button>
          ))}
        </div>
      </FormField>

      {/* What needs to be fixed - multi select */}
      <FormField label={t('fix_what')} required error={errors.fix_options}>
        <div className="grid grid-cols-2 gap-2">
          {FIX_OPTIONS.map(opt => {
            const active = form.fix_options.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                aria-pressed={active}
                onClick={() => toggleFixOption(opt as FixOption)}
                className={`px-3 py-3 rounded-xl text-[13px] font-medium min-h-[48px] transition-colors text-start ${
                  active
                    ? 'bg-[var(--color-primary)] text-white border border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
                }`}
              >
                {active && '✓ '}{t(`fixopt_${opt}`)}
              </button>
            )
          })}
        </div>
      </FormField>

      {/* Other fix description */}
      {form.fix_options.includes('other') && (
        <FormField label={t('fix_other_describe')} required error={errors.fix_other_text}>
          <input type="text" className={fieldClass(!!errors.fix_other_text)} value={form.fix_other_text}
            aria-invalid={!!errors.fix_other_text}
            onChange={e => updateField('fix_other_text', e.target.value)}
            placeholder={t('fix_other_placeholder')} />
        </FormField>
      )}

      {/* New size if resize selected */}
      {form.fix_options.includes('resize') && (
        <FormField label={t('fix_new_size')} required error={errors.size}>
          <input type="text" className={fieldClass(!!errors.size)} value={form.size}
            aria-invalid={!!errors.size}
            onChange={e => updateField('size', e.target.value)}
            placeholder={t('fix_new_size_placeholder')} />
        </FormField>
      )}

      {/* UPID search (jewelry inventory) */}
      <FormField label={t('fix_upid')}>
        <div className="relative">
          <input
            type="text"
            className={fieldClass()}
            value={form.main_stone}
            onChange={e => { setDismissed(false); updateField('main_stone', e.target.value) }}
            onBlur={() => setTimeout(() => setDismissed(true), 200)}
            placeholder={t('fix_upid_placeholder')}
          />
          {showUpidResults && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {results.items.map((u, i) => (
                <button key={u.upid || i} type="button"
                  className="w-full px-4 py-2.5 text-start text-sm hover:bg-[var(--color-surface-light)] transition-colors border-b border-[var(--color-border)] last:border-0"
                  onMouseDown={() => {
                    skipNextSearch.current = true
                    setDismissed(true)
                    updateField('main_stone', u.upid)
                  }}>
                  <span className="font-bold">{u.upid}</span>
                  {u.model_name && <span className="text-[var(--color-text-muted)]"> · {u.model_name}</span>}
                  {u.metal_type && <span className="text-[var(--color-text-muted)]"> · {u.metal_type} {u.metal_color}</span>}
                  {u.center_stone_shape && <span className="text-[var(--color-text-muted)]"> · {u.center_stone_shape}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </FormField>

      {/* Additional description */}
      <FormField label={t('fix_description')}>
        <textarea className={fieldClass() + ' min-h-[70px] resize-none'} value={form.description}
          onChange={e => updateField('description', e.target.value)} rows={3}
          placeholder={t('fix_description_placeholder')} />
      </FormField>

      {/* Comment / price notes */}
      <FormField label={t('fix_comment')}>
        <textarea className={fieldClass() + ' min-h-[60px] resize-none'} value={form.comment}
          onChange={e => updateField('comment', e.target.value)} rows={2}
          placeholder={t('fix_comment_placeholder')} />
      </FormField>

      {/* Price */}
      <FormField label={t('price_to_client')} error={errors.price_to_client}>
        <input type="number" min="0" step="0.01" className={fieldClass(!!errors.price_to_client)} value={form.price_to_client}
          aria-invalid={!!errors.price_to_client}
          onChange={e => updateField('price_to_client', e.target.value)} placeholder="$" />
      </FormField>

      {/* Deadline */}
      <FormField label={t('deadline')}>
        <input type="date" className={fieldClass()} value={form.deadline}
          onChange={e => updateField('deadline', e.target.value)} />
      </FormField>

      {/* Images */}
      <FormField label={t('images')}>
        <ImagePicker
          files={form.image_files}
          onChange={files => updateField('image_files', files)}
        />
      </FormField>
    </div>
  )
}
