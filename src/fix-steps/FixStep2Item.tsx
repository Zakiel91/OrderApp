import { useRef, useState, useEffect } from 'react'
import { useFixForm } from '../context/FixFormContext'
import { useLanguage } from '../context/LanguageContext'
import { FormField, inputClass } from '../components/FormField'
import { JEWELRY_TYPES, METALS_SORTED, JEWELRY_ICONS, FIX_OPTIONS } from '../lib/constants'
import { searchUpid } from '../lib/api'
import type { JewelryType, FixOption } from '../lib/types'
import type { UpidResult } from '../lib/api'

export function FixStep2Item() {
  const { form, updateField } = useFixForm()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // UPID search (jewelry inventory)
  const [upidQuery, setUpidQuery] = useState('')
  const [upidResults, setUpidResults] = useState<UpidResult[]>([])
  const [showUpidResults, setShowUpidResults] = useState(false)

  useEffect(() => {
    if (upidQuery.length < 2) { setUpidResults([]); return }
    const timer = setTimeout(async () => {
      const results = await searchUpid(upidQuery)
      setUpidResults(results)
      setShowUpidResults(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [upidQuery])

  const toggleFixOption = (opt: FixOption) => {
    const current = form.fix_options
    if (current.includes(opt)) {
      updateField('fix_options', current.filter(x => x !== opt))
    } else {
      updateField('fix_options', [...current, opt])
    }
  }

  const handleImageAdd = (files: FileList | null) => {
    if (!files) return
    updateField('image_files', [...form.image_files, ...Array.from(files)])
  }

  const handleImageRemove = (idx: number) => {
    updateField('image_files', form.image_files.filter((_, i) => i !== idx))
  }

  return (
    <div className="p-4 space-y-1">
      <h2 className="text-lg font-semibold mb-4">{t('fix_step2_title')}</h2>

      {/* Jewelry Type */}
      <FormField label={t('jewelry_type')} required>
        <div className="grid grid-cols-3 gap-2">
          {JEWELRY_TYPES.map(jt => {
            const active = form.jewelry_type === jt.key
            return (
              <button
                key={jt.key}
                type="button"
                onClick={() => updateField('jewelry_type', jt.key as JewelryType)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors min-h-[72px] ${
                  active
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'
                }`}
              >
                <span className="w-7 h-7" dangerouslySetInnerHTML={{ __html: JEWELRY_ICONS[jt.icon] || '' }} />
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
            <button key={m} type="button" onClick={() => updateField('metal', m)}
              className={`px-3 py-2.5 rounded-xl text-[13px] font-medium min-h-[44px] transition-colors ${
                form.metal === m
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
              }`}>{m}</button>
          ))}
        </div>
      </FormField>

      {/* What needs to be fixed - multi select */}
      <FormField label={t('fix_what')} required>
        <div className="grid grid-cols-2 gap-2">
          {FIX_OPTIONS.map(opt => {
            const active = form.fix_options.includes(opt)
            return (
              <button
                key={opt}
                type="button"
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
        <FormField label={t('fix_other_describe')} required>
          <input type="text" className={inputClass} value={form.fix_other_text}
            onChange={e => updateField('fix_other_text', e.target.value)}
            placeholder={t('fix_other_placeholder')} />
        </FormField>
      )}

      {/* New size if resize selected */}
      {form.fix_options.includes('resize') && (
        <FormField label={t('fix_new_size')} required>
          <input type="text" className={inputClass} value={form.size}
            onChange={e => updateField('size', e.target.value)}
            placeholder={t('fix_new_size_placeholder')} />
        </FormField>
      )}

      {/* UPID search (jewelry inventory) */}
      <FormField label={t('fix_upid')}>
        <div className="relative">
          <input
            type="text"
            className={inputClass}
            value={upidQuery || form.main_stone}
            onChange={e => {
              setUpidQuery(e.target.value)
              updateField('main_stone', e.target.value)
            }}
            placeholder={t('fix_upid_placeholder')}
          />
          {showUpidResults && upidResults.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {upidResults.map((u, i) => (
                <button key={i} type="button"
                  className="w-full px-4 py-2.5 text-start text-sm hover:bg-[var(--color-surface-light)] transition-colors border-b border-[var(--color-border)] last:border-0"
                  onClick={() => { updateField('main_stone', u.upid); setUpidQuery(u.upid); setShowUpidResults(false) }}>
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
        <textarea className={inputClass + ' min-h-[70px] resize-none'} value={form.description}
          onChange={e => updateField('description', e.target.value)} rows={3}
          placeholder={t('fix_description_placeholder')} />
      </FormField>

      {/* Comment / price notes */}
      <FormField label={t('fix_comment')}>
        <textarea className={inputClass + ' min-h-[60px] resize-none'} value={form.comment}
          onChange={e => updateField('comment', e.target.value)} rows={2}
          placeholder={t('fix_comment_placeholder')} />
      </FormField>

      {/* Price */}
      <FormField label={t('price_to_client')}>
        <input type="number" className={inputClass} value={form.price_to_client}
          onChange={e => updateField('price_to_client', e.target.value)} placeholder="$" />
      </FormField>

      {/* Deadline */}
      <FormField label={t('deadline')}>
        <input type="date" className={inputClass} value={form.deadline}
          onChange={e => updateField('deadline', e.target.value)} />
      </FormField>

      {/* Images */}
      <FormField label={t('images')}>
        <div className="space-y-3">
          {form.image_files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.image_files.map((file, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-border)]">
                  <img src={URL.createObjectURL(file)} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleImageRemove(idx)}
                    className="absolute top-0 right-0 bg-[var(--color-error)] text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl">×</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button type="button"
              onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.capture = 'environment'; i.onchange = (e) => handleImageAdd((e.target as HTMLInputElement).files); i.click() }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm min-h-[48px]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              {t('camera')}
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm min-h-[48px]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {t('upload')}
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageAdd(e.target.files)} />
        </div>
      </FormField>
    </div>
  )
}
