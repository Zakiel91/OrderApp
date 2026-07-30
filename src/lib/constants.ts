export const ACTIVE_PREFIXES = [
  'INNO', 'JOR', 'RAV', 'MOR', 'AMIT', 'RAN',
  'ROM', 'IDO', 'DAN', 'TOM', 'GRE', 'FIX',
] as const

// Shared by the production and fix client steps — was duplicated in both.
export const COUNTRIES = [
  'Israel', 'United States', 'United Kingdom', 'Belgium', 'Germany',
  'France', 'Italy', 'Switzerland', 'Netherlands', 'India',
  'China', 'Hong Kong', 'Japan', 'UAE', 'Thailand',
  'Australia', 'Canada', 'Russia', 'Turkey', 'South Africa',
] as const

export const JEWELRY_TYPES = [
  { key: 'ring', icon: 'ring' },
  { key: 'earrings', icon: 'earrings' },
  { key: 'pendant', icon: 'pendant' },
  { key: 'necklace', icon: 'necklace' },
  { key: 'bracelet', icon: 'bracelet' },
  { key: 'other', icon: 'other' },
] as const

// Removed 10K Gold entirely
export const METALS_SORTED = [
  '14K WHITE', '14K YELLOW', '14K ROSE',
  '18K WHITE', '18K YELLOW', '18K ROSE',
  'PLATINUM', '9K WHITE', '9K YELLOW', '9K ROSE',
  'SILVER',
]

// Prong/setting types - matching industry standard names
export const PRONG_TYPE_OPTIONS = [
  'round', 'claw', 'petite_claw', 'tab',
] as const

// Collections/styles filtered per jewelry type
// Bracelet has no collections for now
export const COLLECTIONS_BY_TYPE: Record<string, string[]> = {
  ring: [
    'solitaire', 'halo', 'three_stone', 'tiffany', 'vintage',
    'modern', 'cluster', 'bypass', 'split_shank', 'cathedral',
    'bezel', 'tension', 'pave', 'channel', 'signet',
  ],
  earrings: [
    'stud', 'halo_stud', 'drop', 'dangle', 'huggie',
    'hoop', 'chandelier', 'climber', 'jacket', 'threader',
  ],
  pendant: [
    'solitaire', 'halo', 'cluster', 'heart', 'cross',
    'bar', 'initial', 'evil_eye', 'hamsa', 'modern',
  ],
  necklace: [
    'tennis', 'station', 'riviera', 'choker', 'layered',
    'lariat', 'collar', 'chain', 'pearl_strand', 'modern',
  ],
  bracelet: [],
  eternity: [
    'full_eternity', 'half_eternity', 'three_quarter', 'shared_prong',
    'channel_set', 'bezel_set', 'u_prong', 'french_pave', 'tiffany',
  ],
  other: [],
}

// UPID or MEMO - must select before deadline
export const ORDER_PURPOSE_OPTIONS = ['upid', 'memo'] as const

// Certificate options
export const CERTIFICATE_OPTIONS = ['sgl', 'cgl', 'sushi', 'none'] as const

export function formatDateIL(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  if (!y || !m || !d) return dateStr
  return `${d}/${m}/${y}`
}

// Order statuses the worker can return. Used for the filter dropdown and for
// colour lookup, so the list lives in one place.
export const ORDER_STATUSES = [
  'new', 'received', 'in_production', 'completed', 'delivered',
  'cancelled', 'on_hold', 'paid', 'sold', 'in_stock',
] as const

export const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  received: 'bg-blue-500/20 text-blue-400',
  in_production: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-green-500/20 text-green-400',
  delivered: 'bg-green-600/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-400',
  on_hold: 'bg-gray-500/20 text-gray-400',
  paid: 'bg-emerald-500/20 text-emerald-400',
  sold: 'bg-purple-500/20 text-purple-400',
  in_stock: 'bg-cyan-500/20 text-cyan-400',
}

export function statusColor(status: string): string {
  return STATUS_COLORS[status] || 'bg-gray-500/20 text-gray-400'
}

/**
 * Translate `key`, but fall back to `fallback` when there is no translation.
 * `t()` returns the key itself on a miss, which would print `payment_foo` into
 * the UI for any value the app doesn't know about (e.g. rows imported by the
 * Dashboard).
 */
export function tOr(t: (key: string) => string, key: string, fallback: string): string {
  const value = t(key)
  return value === key ? fallback : value
}

/**
 * Human label for a status. Falls back to de-snake-casing an unknown status
 * rather than showing the raw `in_production` key to the user.
 * `t()` returns the key itself when a translation is missing.
 */
export function formatStatus(status: string, t: (key: string) => string): string {
  if (!status) return ''
  const key = `status_${status}`
  const translated = t(key)
  if (translated !== key) return translated
  return status.replace(/_/g, ' ')
}

// Advance payment methods
export const PAYMENT_METHODS = ['cash', 'credit_card', 'bank_wire'] as const

// Fix options - what needs to be done
export const FIX_OPTIONS = [
  'resize', 'polish', 'rhodium', 'stone_fix', 'cleaning',
  'clasp_fix', 'chain_fix', 'soldering', 'engraving', 'other',
] as const


// SVG icons for jewelry types (luxury line art)
export const JEWELRY_ICONS: Record<string, string> = {
  ring: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="28" r="14"/><path d="M17 16l7-10 7 10"/><path d="M19 14h10"/><circle cx="24" cy="8" r="2" fill="currentColor" stroke="none"/></svg>`,
  earrings: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="20" r="8"/><circle cx="32" cy="20" r="8"/><path d="M16 12V6M32 12V6"/><circle cx="16" cy="32" r="3" fill="currentColor" stroke="none"/><circle cx="32" cy="32" r="3" fill="currentColor" stroke="none"/><line x1="16" y1="28" x2="16" y2="29"/><line x1="32" y1="28" x2="32" y2="29"/></svg>`,
  pendant: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8c0 0 6 4 12 4s12-4 12-4"/><line x1="24" y1="12" x2="24" y2="22"/><path d="M18 26l6-4 6 4v8l-6 4-6-4z"/><circle cx="24" cy="30" r="2" fill="currentColor" stroke="none"/></svg>`,
  necklace: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6c0 0 8 6 16 6s16-6 16-6"/><path d="M10 8c2 14 6 28 14 28s12-14 14-28"/><circle cx="24" cy="38" r="3" fill="currentColor" stroke="none"/></svg>`,
  bracelet: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="24" cy="24" rx="18" ry="10"/><ellipse cx="24" cy="24" rx="14" ry="7"/><circle cx="10" cy="20" r="1.5" fill="currentColor" stroke="none"/><circle cx="24" cy="14" r="1.5" fill="currentColor" stroke="none"/><circle cx="38" cy="20" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  eternity: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="14"/><circle cx="24" cy="24" r="10"/><circle cx="24" cy="10" r="2" fill="currentColor" stroke="none"/><circle cx="35" cy="17" r="2" fill="currentColor" stroke="none"/><circle cx="35" cy="31" r="2" fill="currentColor" stroke="none"/><circle cx="24" cy="38" r="2" fill="currentColor" stroke="none"/><circle cx="13" cy="31" r="2" fill="currentColor" stroke="none"/><circle cx="13" cy="17" r="2" fill="currentColor" stroke="none"/></svg>`,
  other: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 4l5 10h11l-9 7 4 11-11-7-11 7 4-11-9-7h11z"/></svg>`,
}
