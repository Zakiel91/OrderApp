import { useState, useRef, useEffect } from 'react'

export const COUNTRY_CODES = [
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+1',   flag: '🇺🇸', name: 'USA / Canada' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgium' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: '+41',  flag: '🇨🇭', name: 'Switzerland' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: '+43',  flag: '🇦🇹', name: 'Austria' },
  { code: '+46',  flag: '🇸🇪', name: 'Sweden' },
  { code: '+47',  flag: '🇳🇴', name: 'Norway' },
  { code: '+45',  flag: '🇩🇰', name: 'Denmark' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+30',  flag: '🇬🇷', name: 'Greece' },
  { code: '+48',  flag: '🇵🇱', name: 'Poland' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
  { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+66',  flag: '🇹🇭', name: 'Thailand' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+7',   flag: '🇷🇺', name: 'Russia' },
  { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
]

interface Props {
  countryCode: string
  phone: string
  onCountryChange: (code: string) => void
  onPhoneChange: (phone: string) => void
  onPhoneBlur?: () => void
  placeholder?: string
}

export function PhoneInput({ countryCode, phone, onCountryChange, onPhoneChange, onPhoneBlur, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const selected = COUNTRY_CODES.find(c => c.code === countryCode) ?? COUNTRY_CODES[0]

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <div ref={wrapperRef} className="relative">
      {/* Unified input container */}
      <div
        className="flex items-center rounded-xl overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          border: '1.5px solid var(--color-border)',
          transition: 'border-color 0.2s',
        }}
      >
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 py-3 text-sm font-medium flex-shrink-0 select-none"
          style={{
            borderRight: '1.5px solid var(--color-border)',
            background: 'transparent',
            color: 'var(--color-text)',
            minWidth: 0,
          }}
        >
          <span className="text-lg leading-none">{selected.flag}</span>
          <span className="tabular-nums text-[13px] opacity-80">{selected.code}</span>
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            style={{ opacity: 0.4, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M1 3L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Phone number input */}
        <input
          type="tel"
          className="flex-1 px-3 py-3 text-sm bg-transparent outline-none"
          style={{ color: 'var(--color-text)', caretColor: 'var(--color-accent)' }}
          value={phone}
          onChange={e => onPhoneChange(e.target.value)}
          onBlur={onPhoneBlur}
          placeholder={placeholder || '50 123 4567'}
          inputMode="numeric"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 rounded-xl overflow-hidden"
          style={{
            width: '220px',
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          {COUNTRY_CODES.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onCountryChange(c.code); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left"
              style={{
                background: c.code === countryCode ? 'var(--color-accent)18' : 'transparent',
                color: 'var(--color-text)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent)22')}
              onMouseLeave={e => (e.currentTarget.style.background = c.code === countryCode ? 'var(--color-accent)18' : 'transparent')}
            >
              <span className="text-lg leading-none">{c.flag}</span>
              <span className="flex-1 truncate">{c.name}</span>
              <span className="tabular-nums text-[12px] opacity-50">{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
