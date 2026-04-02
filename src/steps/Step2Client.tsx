import { useEffect, useCallback } from 'react'
import { useOrderForm } from '../context/OrderFormContext'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { FormField, inputClass, selectClass } from '../components/FormField'
import { PhoneInput } from '../components/PhoneInput'
import { useClientLookup } from '../hooks/useClientLookup'
import type { ClientRecord } from '../lib/api'

const COUNTRIES = [
  'Israel', 'United States', 'United Kingdom', 'Belgium', 'Germany',
  'France', 'Italy', 'Switzerland', 'Netherlands', 'India',
  'China', 'Hong Kong', 'Japan', 'UAE', 'Thailand',
  'Australia', 'Canada', 'Russia', 'Turkey', 'South Africa',
]

type IdType = 'id' | 'company'

export function Step2Client() {
  const { form, updateField, updateFields } = useOrderForm()
  const { t } = useLanguage()
  const { user } = useAuth()

  useEffect(() => {
    if (user) updateField('salesman_name', user.name)
  }, [user, updateField])

  const applyClient = useCallback((client: ClientRecord) => {
    updateFields({
      client_db_id:          (client as any).id || 0,
      client_name:           (client as any).name || client.client_name || '',
      client_id:             client.client_id || '',
      client_company_number: client.company_number || '',
      client_phone:          client.client_phone || '',
      client_email:          client.client_email || '',
      client_address:        client.client_address || '',
      client_country:        client.client_country || '',
    })
  }, [updateFields])

  const {
    lookupStatus, nameSuggestions, showSuggestions, nameSearching, clientSelected, phoneMatches,
    setShowSuggestions, lookupByField, doNameSearch, handleNameChange, selectSuggestion,
    selectPhoneMatch, clearClient,
  } = useClientLookup(applyClient)

  const idType: IdType = form.client_company_number ? 'company' : 'id'
  const idValue = idType === 'id' ? form.client_id : form.client_company_number

  const StatusIcon = () => {
    if (lookupStatus === 'searching') return <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)] animate-pulse">🔍</span>
    if (lookupStatus === 'found') return <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-success)]">✓</span>
    if (lookupStatus === 'not_found') return <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-error)]">✗</span>
    return null
  }

  return (
    <div className="p-4 space-y-1">
      <h2 className="text-lg font-semibold mb-4">{t('step2_title')}</h2>

      {/* Hint */}
      <div className="rounded-xl px-3 py-2.5 mb-5 flex items-start gap-2"
        style={{ background: 'var(--color-accent)12', border: '1px solid var(--color-accent)30' }}>
        <span className="text-sm mt-0.5">💡</span>
        <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">
          {t('client_lookup_hint')}
        </p>
      </div>

      {/* Clear button — shown when a client is selected from DB */}
      {clientSelected && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg mb-3"
          style={{ background: 'var(--color-success)15', border: '1px solid var(--color-success)40' }}>
          <span className="text-[13px] text-[var(--color-success)] font-medium">✓ Client found in database</span>
          <button
            type="button"
            onClick={() => clearClient(() => updateFields({
              client_db_id: 0, client_name: '', client_id: '', client_company_number: '',
              client_phone: '', client_email: '', client_address: '', client_country: '',
            }))}
            className="text-xs px-2 py-1 rounded-md"
            style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
          >
            Clear
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
          <StatusIcon />
        </div>
      </FormField>

      {/* Phone match picker — shown when multiple clients share the same phone */}
      {phoneMatches.length > 1 && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <p className="px-3 py-2 text-[12px] text-[var(--color-text-muted)]" style={{ background: 'var(--color-surface)' }}>
            Multiple clients found — select one:
          </p>
          {phoneMatches.map((c, i) => (
            <button key={i} type="button"
              onMouseDown={() => selectPhoneMatch(c)}
              className="w-full px-3 py-2.5 text-left text-sm flex justify-between items-center"
              style={{ borderTop: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }}>
              <span className="font-medium">{(c as any).client_name}</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {(c as any).company_name ? `🏢 ${(c as any).company_name}` : (c as any).client_phone || ''}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 2. Client Name with autocomplete */}
      <FormField label={t('client_name')} required>
        <div className="relative">
          <input
            type="text"
            className={inputClass}
            style={{ paddingRight: '2.5rem' }}
            value={form.client_name}
            onChange={e => handleNameChange(e.target.value, v => updateField('client_name', v))}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => nameSuggestions.length > 0 && setShowSuggestions(true)}
            placeholder={t('client_name_placeholder')}
            autoComplete="off"
          />
          {/* Search icon — triggers search at any length */}
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); doNameSearch(form.client_name) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md"
            style={{ color: 'var(--color-text-muted)', opacity: form.client_name ? 1 : 0.3 }}
          >
            {nameSearching ? (
              <span className="text-sm animate-pulse">⏳</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            )}
          </button>
          {showSuggestions && nameSuggestions.length > 0 && (
            <ul className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl overflow-hidden shadow-lg"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              {nameSuggestions.map((c, i) => (
                <li key={i}
                  onMouseDown={() => selectSuggestion(c)}
                  className="px-3 py-2.5 cursor-pointer text-sm flex justify-between items-center"
                  style={{ borderBottom: i < nameSuggestions.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                  <span className="font-medium">{(c as any).name || c.client_name}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">{c.client_phone || (c as any).company_name || ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </FormField>

      {/* 3. ID / Company Number */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[15px] font-medium text-[var(--color-text-muted)] tracking-wide">
            {idType === 'id' ? 'ID Number' : 'Company Number'}
            <span className="text-[var(--color-text-muted)] text-xs ms-2 opacity-70">
              {idType === 'id' ? 'תעודת זהות' : 'ח"פ'}
            </span>
            <span className="text-[var(--color-text-muted)] text-xs ms-1 opacity-50">({t('optional')})</span>
          </label>
          <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)] text-[12px]">
            <button type="button"
              onClick={() => updateField('client_company_number', '')}
              className="px-3 py-1 font-medium transition-colors"
              style={{ background: idType === 'id' ? 'var(--color-primary)' : 'transparent', color: idType === 'id' ? '#fff' : 'var(--color-text-muted)' }}>
              Person
            </button>
            <button type="button"
              onClick={() => updateField('client_id', '')}
              className="px-3 py-1 font-medium transition-colors"
              style={{ background: idType === 'company' ? 'var(--color-primary)' : 'transparent', color: idType === 'company' ? '#fff' : 'var(--color-text-muted)' }}>
              Company
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            className={inputClass}
            value={idValue}
            onChange={e => {
              if (idType === 'id') { updateField('client_id', e.target.value); lookupByField('id', e.target.value) }
              else { updateField('client_company_number', e.target.value); lookupByField('company', e.target.value) }
            }}
            placeholder={idType === 'id' ? '9 digit ID number' : '9 digit company number'}
            inputMode="numeric"
          />
          <StatusIcon />
        </div>
      </div>

      {/* 4. Email */}
      <FormField label={t('client_email')}>
        <input type="email" className={inputClass} value={form.client_email}
          onChange={e => updateField('client_email', e.target.value)} />
      </FormField>

      {/* 5. Address */}
      <FormField label={t('client_address')}>
        <input type="text" className={inputClass} value={form.client_address}
          onChange={e => updateField('client_address', e.target.value)}
          placeholder={t('client_address_placeholder')} />
      </FormField>

      {/* 6. Country */}
      <FormField label={t('client_country')}>
        <select className={selectClass} value={form.client_country}
          onChange={e => updateField('client_country', e.target.value)}>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </FormField>
    </div>
  )
}
