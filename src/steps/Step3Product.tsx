import { useState } from 'react'
import { useOrderForm } from '../context/OrderFormContext'
import { useLanguage } from '../context/LanguageContext'
import { FormField, inputClass } from '../components/FormField'
import { JEWELRY_TYPES, METALS_SORTED, COLLECTIONS_BY_TYPE, JEWELRY_ICONS } from '../lib/constants'
import { MetalWheelPicker } from '../components/MetalWheelPicker'
import { RingSizer } from '../components/measurements/RingSizer'
import { NecklaceSizer } from '../components/measurements/NecklaceSizer'
import { BraceletSizer } from '../components/measurements/BraceletSizer'
import type { JewelryType } from '../lib/types'

function formatCollection(c: string) {
  return c.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function StyleChips({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => {
        const label = formatCollection(item)
        const active = value === item
        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-all"
            style={{
              background: active ? 'var(--color-primary)' : 'var(--color-surface)',
              color: active ? '#fff' : 'var(--color-text-muted)',
              border: active ? 'none' : '1px solid var(--color-border)',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function Step3Product() {
  const { form, updateField } = useOrderForm()
  const { t } = useLanguage()
  const [otherType, setOtherType] = useState('')

  const collections = form.jewelry_type ? (COLLECTIONS_BY_TYPE[form.jewelry_type] || []) : []

  const renderMeasurements = () => {
    switch (form.jewelry_type) {
      case 'ring':
      case 'eternity':
        return <RingSizer />
      case 'necklace':
      case 'pendant':
        return <NecklaceSizer />
      case 'bracelet':
        return <BraceletSizer />
      default:
        return null
    }
  }

  return (
    <div className="p-4 space-y-1">
      <h2 className="text-lg font-semibold mb-4">{t('step3_title')}</h2>

      <FormField label={t('jewelry_type')} required>
        <div className="grid grid-cols-3 gap-2">
          {JEWELRY_TYPES.map(jt => (
            <button
              key={jt.key}
              type="button"
              onClick={() => {
                updateField('jewelry_type', jt.key as JewelryType)
                updateField('collection_style', '')
                if (jt.key !== 'other') setOtherType('')
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl min-h-[72px] transition-all ${
                form.jewelry_type === jt.key
                  ? 'bg-[var(--color-primary)] text-white scale-[1.02] shadow-lg'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
              }`}
            >
              <span
                className="w-7 h-7 mb-1"
                dangerouslySetInnerHTML={{ __html: JEWELRY_ICONS[jt.icon] || '' }}
              />
              <span className="text-xs font-medium">{t(jt.key)}</span>
            </button>
          ))}
        </div>
      </FormField>

      {form.jewelry_type === 'other' && (
        <FormField label={t('other_type_describe')} required>
          <input
            type="text"
            className={inputClass}
            value={otherType}
            onChange={e => {
              setOtherType(e.target.value)
              updateField('comment', e.target.value)
            }}
            placeholder={t('other_type_placeholder')}
          />
        </FormField>
      )}

      {/* Style — horizontal chip scroll, distinct from metal wheel */}
      {collections.length > 0 && (
        <FormField label="Style">
          <StyleChips
            items={collections}
            value={form.collection_style || collections[0]}
            onChange={val => updateField('collection_style', val)}
          />
        </FormField>
      )}

      <FormField label={t('metal')} required>
        <MetalWheelPicker
          value={form.metal || '14K WHITE'}
          onChange={val => updateField('metal', val)}
          metals={METALS_SORTED}
          showQuickPick
        />
      </FormField>

      {form.jewelry_type && form.jewelry_type !== 'other' && (
        <div className="border border-[var(--color-border)] rounded-xl p-4 bg-[var(--color-surface)]">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">{t('size')}</h3>
          {renderMeasurements()}
        </div>
      )}

      <FormField label={t('comments')}>
        <textarea
          className={inputClass + ' min-h-[80px] resize-none'}
          value={form.comment}
          onChange={e => updateField('comment', e.target.value)}
          rows={3}
        />
      </FormField>
    </div>
  )
}
