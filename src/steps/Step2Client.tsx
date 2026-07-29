import { useEffect, useCallback, useState } from 'react'
import { useOrderForm } from '../context/OrderFormContext'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { useWizardErrors } from '../context/WizardNavContext'
import { FormField, fieldClass, selectClass } from '../components/FormField'
import { PhoneInput } from '../components/PhoneInput'
import { LookupStatusIcon } from '../components/LookupStatusIcon'
import { useClientLookup } from '../hooks/useClientLookup'
import { clientDisplayName, type ClientRecord } from '../lib/api'
import { COUNTRIES } from '../lib/constants'

type IdType = 'id' | 'company'

export function Step2Client() {
  const { form, updateField, updateFields } = useOrderForm()
  const { t } = useLanguage()
  const { user } = useAuth()
  const errors = useWizardErrors()

  // Own state instead of deriving from client_company_number. The derived
  // version made the "Company" button a no-op: it cleared client_id, which left
  // company_number empty, which kept the mode on "Person".
  const [idType, setIdType] = useState<IdType>(() => (form.client_company_number ? 'company' : 'id'))

  useEffect(() => {
    if (user) updateField('salesman_name', user.name)
  }, [user, updateField])

  const applyClient = useCallback((client: ClientRecord) => {
    updateFields({
      client_db_id:          client.id || 0,
      client_name:           clientDisplayName(client),
      client_id:             client.client_id || '',
      client_company_number: client.company_number || '',
      client_phone:          client.client_phone || '',
      client_email:          client.client_email || '',
      client_address:        client.client_address || '',
      client_country:        client.client_country || '',
    })
    // Follow whichever identifier the matched client actually has.
    if (client.company_number) setIdType('company')
    else if (client.client_id) setIdType('id')
  }, [updateFields])

  const {
    statusFor, nameSuggestions, showSuggestions, nameSearching, clientSelected, phoneMatches,
    setShowSuggestions, lookupByField, doNameSearch, handleNameChange, selectSuggestion,
    selectPhoneMatch, clearClient,
  } = useClientLookup(applyClient)

  const idValue = idType === 'id' ? form.client_id : form.client_company_number

  const switchIdType = (next: IdType) => {
    if (next === idType) return
    setIdType(next)
    // Only one identifier is meaningful at a time — drop the other so the order
    // doesn't carry a stale ID from the mode the user abandoned.
    updateFields(next === 'id' ? { client_company_number: '' } : { client_id: '' })
  }

  return (
    <div className="p-4 space-y-1">
      <h2 className="text-lg font-semibold mb-4">{t('step2_title')}</h2>

      {/* Hint */}
      <div className="rounded-xl px-3 py-2.5 mb-5 flex items-start gap-2"
        style={{ background: 'var(--color-accent)12', border: '1px solid var(--color-accent)30' }}>
        <span className="text-sm mt-0.5" aria-hidden="true">💡</span>
        <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">
          {t('client_lookup_hint')}
        </p>
      </div>

      {/* Clear button — shown when a client is selected from DB */}
      {clientSelected && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg mb-3"
          style={{ background: 'var(--color-success)15', border: '1px solid var(--color-success)40' }}>
          <span className="text-[13px] text-[var(--color-success)] font-medium">✓ {t('client_found_in_db')}</span>
          <button
            type="button"
            onClick={() => clearClient(() => {
              setIdType('id')
              updateFields({
                client_db_id: 0, client_name: '', client_id: '', client_company_number: '',
                client_phone: '', client_email: '', client_address: '', client_country: '',
              })
            })}
            className="text-xs px-2 min-h-[48px] flex items-center rounded-md"
            style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
          >
            {t('clear')}
          </button>
        </div>
      )}

      {/* 1. Phone */}
      <FormField label={t('client_phone')}>
        <div className="relative">
          <PhoneInput
            countryCode={form.client_country_code}
            phone={form.client_phone}
            onCountryChange={code => updateField('client_country_code', code)}
            onPhoneChange={phone => {
              updateField('client_phone', phone)
              lookupByField('phone', phone)
            }}
          />
          <LookupStatusIcon status={statusFor('phone')} />
        </div>
      </FormField>

      {/* Phone match picker — shown when multiple clients share the same phone */}
      {phoneMatches.length > 1 && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <p className="px-3 py-2 text-[12px] text-[var(--color-text-muted)]" style={{ background: 'var(--color-surface)' }}>
            {t('multiple_clients_found')}
          </p>
          {phoneMatches.map((c, i) => (
            <button key={c.id ?? i} type="button"
              onMouseDown={() => selectPhoneMatch(c)}
              className="w-full px-3 py-2.5 text-left text-sm flex justify-between items-center"
              style={{ borderTop: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }}>
              <span className="font-medium">{clientDisplayName(c)}</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {c.company_name ? `🏢 ${c.company_name}` : c.client_phone || ''}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 2. Client Name with autocomplete */}
      <FormField label={t('client_name')} required error={errors.client_name}>
        <div className="relative">
          <input
            type="text"
            className={fieldClass(!!errors.client_name)}
            style={{ paddingRight: '2.5rem' }}
            value={form.client_name}
            onChange={e => handleNameChange(e.target.value, v => updateField('client_name', v))}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => nameSuggestions.length > 0 && setShowSuggestions(true)}
            placeholder={t('client_name_placeholder')}
            autoComplete="off"
            aria-invalid={!!errors.client_name}
          />
          {/* Search icon — triggers search at any length */}
          <button
            type="button"
            aria-label={t('search_clients')}
            onMouseDown={e => { e.preventDefault(); doNameSearch(form.client_name) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-md"
            style={{ color: 'var(--color-text-muted)', opacity: form.client_name ? 1 : 0.3 }}
          >
            {nameSearching ? (
              <span className="text-sm animate-pulse" aria-hidden="true">⏳</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            )}
          </button>
          {showSuggestions && nameSuggestions.length > 0 && (
            <ul className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl overflow-hidden shadow-lg"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              {nameSuggestions.map((c, i) => (
                <li key={c.id ?? i}
                  style={{ borderBottom: i < nameSuggestions.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                  <button
                    type="button"
                    onMouseDown={() => selectSuggestion(c)}
                    className="w-full px-3 py-2.5 text-start text-sm flex justify-between items-center"
                  >
                    <span className="font-medium">{clientDisplayName(c)}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{c.client_phone || c.company_name || ''}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </FormField>

      {/* 3. ID / Company Number */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2 gap-2">
          <label htmlFor="client-identifier" className="text-[15px] font-medium text-[var(--color-text-muted)] tracking-wide">
            {idType === 'id' ? t('client_id') : t('company_number')}
            <span className="text-[var(--color-text-muted)] text-xs ms-1 opacity-50">({t('optional')})</span>
          </label>
          <div className="flex border border-[var(--color-border)] text-[12px] shrink-0" role="group" aria-label={t('id_type')}>
            <button type="button"
              aria-pressed={idType === 'id'}
              onClick={() => switchIdType('id')}
              className="px-3 min-h-[48px] flex items-center justify-center font-medium transition-colors rounded-l-lg"
              style={{ background: idType === 'id' ? 'var(--color-primary)' : 'transparent', color: idType === 'id' ? '#fff' : 'var(--color-text-muted)' }}>
              {t('id_type_person')}
            </button>
            <button type="button"
              aria-pressed={idType === 'company'}
              onClick={() => switchIdType('company')}
              className="px-3 min-h-[48px] flex items-center justify-center font-medium transition-colors rounded-r-lg border-l border-[var(--color-border)]"
              style={{ background: idType === 'company' ? 'var(--color-primary)' : 'transparent', color: idType === 'company' ? '#fff' : 'var(--color-text-muted)' }}>
              {t('id_type_company')}
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            id="client-identifier"
            type="text"
            className={fieldClass()}
            value={idValue}
            onChange={e => {
              if (idType === 'id') { updateField('client_id', e.target.value); lookupByField('id', e.target.value) }
              else { updateField('client_company_number', e.target.value); lookupByField('company', e.target.value) }
            }}
            placeholder={idType === 'id' ? t('id_9_digits') : t('company_9_digits')}
            inputMode="numeric"
          />
          <LookupStatusIcon status={statusFor(idType)} />
        </div>
      </div>

      {/* 4. Email */}
      <FormField label={t('client_email')} error={errors.client_email}>
        <input type="email" className={fieldClass(!!errors.client_email)} value={form.client_email}
          autoComplete="email" inputMode="email"
          aria-invalid={!!errors.client_email}
          onChange={e => updateField('client_email', e.target.value)} />
      </FormField>

      {/* 5. Address */}
      <FormField label={t('client_address')}>
        <input type="text" className={fieldClass()} value={form.client_address}
          onChange={e => updateField('client_address', e.target.value)}
          placeholder={t('client_address_placeholder')} />
      </FormField>

      {/* 6. Country */}
      <FormField label={t('client_country')}>
        <select className={selectClass} value={form.client_country}
          onChange={e => updateField('client_country', e.target.value)}>
          {/* Explicit empty option: without it a blank value silently displayed
              "Israel" (the first option) while nothing was actually selected. */}
          <option value="">{t('not_specified')}</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </FormField>
    </div>
  )
}
