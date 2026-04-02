import { useOrderForm } from '../context/OrderFormContext'
import { useLanguage } from '../context/LanguageContext'
import { FormField, selectClass, inputClass } from '../components/FormField'
import { ACTIVE_PREFIXES } from '../lib/constants'

export function Step1Basics() {
  const { form, updateField } = useOrderForm()
  const { t } = useLanguage()

  return (
    <div className="p-4 space-y-1">
      <h2 className="text-lg font-semibold mb-4">{t('step1_title')}</h2>

      <FormField label={t('prefix')} required>
        <select
          className={selectClass}
          value={form.order_prefix}
          onChange={e => updateField('order_prefix', e.target.value)}
        >
          <option value="">--</option>
          {ACTIVE_PREFIXES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </FormField>

      <FormField label={t('order_number')}>
        <input
          type="text"
          className={inputClass + ' bg-[var(--color-surface-light)] cursor-not-allowed'}
          value={form.order_number || t('auto_generated')}
          disabled
        />
      </FormField>

      <FormField label={t('order_date')} required>
        <input
          type="date"
          className={inputClass}
          value={form.order_date}
          onChange={e => updateField('order_date', e.target.value)}
        />
      </FormField>
    </div>
  )
}
