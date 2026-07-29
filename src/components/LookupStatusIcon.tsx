import type { LookupStatus } from '../hooks/useClientLookup'

// Declared at module level (not inside a step's render) so React keeps one
// component identity — a nested definition is re-created every render.
export function LookupStatusIcon({
  status,
  offsetClass = 'right-3',
}: {
  status: LookupStatus
  /** Horizontal offset, e.g. 'right-12' when the field has a trailing button. */
  offsetClass?: string
}) {
  if (status === 'idle') return null

  const base = `absolute ${offsetClass} top-1/2 -translate-y-1/2 text-sm pointer-events-none`
  if (status === 'searching') {
    return <span className={`${base} text-[var(--color-text-muted)] animate-pulse`}>🔍</span>
  }
  if (status === 'found') {
    return <span className={`${base} text-[var(--color-success)]`}>✓</span>
  }
  return <span className={`${base} text-[var(--color-error)]`}>✗</span>
}
