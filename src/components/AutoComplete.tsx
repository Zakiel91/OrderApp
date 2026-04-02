import { useState, useRef, useEffect } from 'react'
import { inputClass } from './FormField'

interface Props {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  onSearch?: (query: string) => void
}

export function AutoComplete({ value, onChange, suggestions, placeholder, onSearch }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 20)

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        className={inputClass}
        value={query}
        placeholder={placeholder}
        onChange={e => {
          setQuery(e.target.value)
          setOpen(true)
          onSearch?.(e.target.value)
        }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg max-h-48 overflow-y-auto shadow-lg">
          {filtered.map(item => (
            <li
              key={item}
              className="px-3 py-2.5 cursor-pointer hover:bg-[var(--color-surface-light)] active:bg-[var(--color-surface-light)] text-sm min-h-[44px] flex items-center"
              onClick={() => { onChange(item); setQuery(item); setOpen(false) }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
