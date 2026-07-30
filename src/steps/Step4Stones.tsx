import { useState, useCallback } from 'react'
import { useOrderForm } from '../context/OrderFormContext'
import { useLanguage } from '../context/LanguageContext'
import { useWizardErrors } from '../context/WizardNavContext'
import { FormField, fieldClass } from '../components/FormField'
import { ProngSelector } from '../components/ProngSelector'
import { searchStones } from '../lib/api'
import type { StoneResult } from '../lib/types'

/** Matches the `stones_hint` copy. */
const MAX_STONES = 2

export function Step4Stones() {
  const { form, updateField } = useOrderForm()
  const { t } = useLanguage()
  const errors = useWizardErrors()
  const [stoneResults, setStoneResults] = useState<StoneResult[]>([])
  const [stoneQuery, setStoneQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const showProng = form.jewelry_type === 'ring' || form.jewelry_type === 'eternity'

  // Parse selected stones (|||-separated parcel names)
  const selectedStones = form.main_stone_parcel
    ? form.main_stone_parcel.split('|||').filter(Boolean)
    : []
  const atLimit = selectedStones.length >= MAX_STONES

  const handleSearch = useCallback(async (q: string) => {
    setStoneQuery(q)
    if (q.length < 2) { setStoneResults([]); return }
    setSearching(true)
    try {
      const results = await searchStones(q)
      setStoneResults(Array.isArray(results) ? results : [])
    } catch { setStoneResults([]) }
    setSearching(false)
  }, [])

  const addStone = (parcelName: string) => {
    if (!parcelName) return
    const current = selectedStones.filter(s => s !== parcelName)
    // The hint promises "up to 2" — enforce it instead of silently accepting more.
    if (current.length >= MAX_STONES) return
    current.push(parcelName)
    updateField('main_stone_parcel', current.join('|||'))
    setStoneQuery('')
    setStoneResults([])
  }

  const removeStone = (parcelName: string) => {
    const updated = selectedStones.filter(s => s !== parcelName)
    updateField('main_stone_parcel', updated.join('|||'))
  }

  return (
    <div className="p-4 space-y-1">
      <h2 className="text-lg font-semibold mb-4">{t('step4_title')}</h2>

      <FormField label={t('main_stone')}>
        {/* Selected stones chips */}
        {selectedStones.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedStones.map(stone => (
              <span
                key={stone}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-sm"
              >
                <span className="text-[var(--color-accent)] font-medium">{stone}</span>
                <button
                  type="button"
                  aria-label={`${t('delete')} ${stone}`}
                  onClick={() => removeStone(stone)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] text-xs ml-0.5 min-h-[48px] flex items-center"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          type="text"
          className={fieldClass()}
          value={stoneQuery}
          onChange={e => handleSearch(e.target.value)}
          placeholder={t('search_stones')}
          disabled={atLimit}
          aria-label={t('search_stones')}
        />
        {searching && <p className="text-xs text-[var(--color-text-muted)] mt-1">{t('loading')}</p>}
        {stoneResults.length > 0 && (
          <ul className="mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg max-h-48 overflow-y-auto">
            {stoneResults.map((s, i) => (
              <li key={s.parcel_name || i}>
                {/* A real <button>, so the row is reachable by keyboard. */}
                <button
                  type="button"
                  className="w-full px-3 py-2.5 hover:bg-[var(--color-surface-light)] text-sm min-h-[48px] flex items-center justify-between text-start"
                  onClick={() => addStone(s.parcel_name)}
                >
                  <span className="font-medium">{s.parcel_name}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {[s.shape, s.carat && `${s.carat}ct`, s.color, s.clarity].filter(Boolean).join(' · ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          {t('stones_hint')}
        </p>
      </FormField>

      <FormField label={t('manual_entry')}>
        <input
          type="text"
          className={fieldClass()}
          value={form.main_stone_manual}
          onChange={e => updateField('main_stone_manual', e.target.value)}
          placeholder={t('manual_entry')}
        />
      </FormField>

      <FormField label={t('side_stones')}>
        <textarea
          className={fieldClass() + ' min-h-[60px] resize-none'}
          value={form.side_stones}
          onChange={e => updateField('side_stones', e.target.value)}
          rows={2}
        />
      </FormField>

      {showProng && (
        <FormField label={t('prong_type')} required error={errors.cat_claw}>
          <ProngSelector
            value={form.cat_claw}
            onChange={v => updateField('cat_claw', v)}
          />
        </FormField>
      )}
    </div>
  )
}
