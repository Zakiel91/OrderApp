import { useLanguage } from '../context/LanguageContext'

interface Props {
  value: string
  onChange: (v: string) => void
}

// Position labels: top-left=Round, top-right=Claw, bottom-left=Petite Claw, bottom-right=Tab
const PRONGS = [
  { key: 'round', position: 'top-left' },
  { key: 'claw', position: 'top-right' },
  { key: 'petite_claw', position: 'bottom-left' },
  { key: 'tab', position: 'bottom-right' },
] as const

export function ProngSelector({ value, onChange }: Props) {
  const { t } = useLanguage()

  return (
    <div className="space-y-3">
      {/* Interactive diamond with 4 prong positions */}
      <div className="relative w-full max-w-[280px] mx-auto aspect-square">
        {/* Diamond SVG in center */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Diamond facets - brilliant cut top view */}
          <circle cx="100" cy="100" r="70" stroke="var(--color-border)" strokeWidth="1.5" fill="var(--color-surface)" />

          {/* Main facet lines */}
          <polygon points="100,30 170,100 100,170 30,100" stroke="var(--color-text-muted)" strokeWidth="0.5" fill="none" opacity="0.4" />
          <polygon points="100,45 155,100 100,155 45,100" stroke="var(--color-text-muted)" strokeWidth="0.5" fill="none" opacity="0.3" />

          {/* Star facets */}
          <line x1="100" y1="30" x2="100" y2="170" stroke="var(--color-text-muted)" strokeWidth="0.3" opacity="0.3" />
          <line x1="30" y1="100" x2="170" y2="100" stroke="var(--color-text-muted)" strokeWidth="0.3" opacity="0.3" />
          <line x1="50" y1="50" x2="150" y2="150" stroke="var(--color-text-muted)" strokeWidth="0.3" opacity="0.2" />
          <line x1="150" y1="50" x2="50" y2="150" stroke="var(--color-text-muted)" strokeWidth="0.3" opacity="0.2" />

          {/* Table */}
          <polygon points="75,60 125,60 140,75 140,125 125,140 75,140 60,125 60,75" stroke="var(--color-text-muted)" strokeWidth="0.5" fill="none" opacity="0.2" />

          {/* 4 Prong positions with distinct shapes */}

          {/* Top-Left: ROUND prong */}
          <g
            className="cursor-pointer"
            onClick={() => onChange('round')}
            opacity={value === 'round' ? 1 : 0.6}
          >
            <ellipse cx="42" cy="42" rx="10" ry="12" fill={value === 'round' ? 'var(--color-accent)' : 'var(--color-surface-light)'} stroke="var(--color-text)" strokeWidth="1.5" />
            <ellipse cx="42" cy="38" rx="6" ry="4" fill="none" stroke="var(--color-text)" strokeWidth="0.8" opacity="0.5" />
          </g>

          {/* Top-Right: CLAW prong */}
          <g
            className="cursor-pointer"
            onClick={() => onChange('claw')}
            opacity={value === 'claw' ? 1 : 0.6}
          >
            <path d="M150,50 Q158,38 158,30 Q158,26 154,28 Q148,32 148,42 Z" fill={value === 'claw' ? 'var(--color-accent)' : 'var(--color-surface-light)'} stroke="var(--color-text)" strokeWidth="1.5" strokeLinejoin="round" />
          </g>

          {/* Bottom-Left: PETITE CLAW */}
          <g
            className="cursor-pointer"
            onClick={() => onChange('petite_claw')}
            opacity={value === 'petite_claw' ? 1 : 0.6}
          >
            <path d="M50,150 Q54,142 54,138 Q54,136 50,137 Q46,140 46,148 Z" fill={value === 'petite_claw' ? 'var(--color-accent)' : 'var(--color-surface-light)'} stroke="var(--color-text)" strokeWidth="1.5" strokeLinejoin="round" />
          </g>

          {/* Bottom-Right: TAB prong */}
          <g
            className="cursor-pointer"
            onClick={() => onChange('tab')}
            opacity={value === 'tab' ? 1 : 0.6}
          >
            <rect x="148" y="148" width="14" height="10" rx="2" fill={value === 'tab' ? 'var(--color-accent)' : 'var(--color-surface-light)'} stroke="var(--color-text)" strokeWidth="1.5" />
          </g>
        </svg>

        {/* Labels positioned around the diamond */}
        {PRONGS.map(prong => {
          const isSelected = value === prong.key
          const posClasses = {
            'top-left': 'top-1 left-1',
            'top-right': 'top-1 right-1',
            'bottom-left': 'bottom-1 left-1',
            'bottom-right': 'bottom-1 right-1',
          }[prong.position]

          return (
            <button
              key={prong.key}
              type="button"
              onClick={() => onChange(prong.key)}
              className={`absolute ${posClasses} px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)] shadow-md scale-105'
                  : 'bg-[var(--color-surface-light)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {t(`prong_${prong.key}`)}
            </button>
          )
        })}
      </div>

      {/* Button row below for clear selection */}
      <div className="grid grid-cols-4 gap-2">
        {PRONGS.map(prong => (
          <button
            key={prong.key}
            type="button"
            onClick={() => onChange(prong.key)}
            className={`py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all tracking-wide ${
              value === prong.key
                ? 'bg-[var(--color-accent)] text-[var(--color-bg)] shadow-lg'
                : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
            }`}
          >
            {t(`prong_${prong.key}`)}
          </button>
        ))}
      </div>
    </div>
  )
}
