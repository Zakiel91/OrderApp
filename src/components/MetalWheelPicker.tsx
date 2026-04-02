import { useRef, useEffect, useCallback } from 'react'

const ITEM_HEIGHT = 44

const COLOR_DOT: Record<string, string> = {
  WHITE:    '#e8e8e8',
  YELLOW:   '#f0c040',
  ROSE:     '#e8967a',
  PLATINUM: '#d0d8e0',
  SILVER:   '#c0c8d4',
}

function getColorDot(metal: string): string {
  if (metal.includes('WHITE'))    return COLOR_DOT.WHITE
  if (metal.includes('YELLOW'))   return COLOR_DOT.YELLOW
  if (metal.includes('ROSE'))     return COLOR_DOT.ROSE
  if (metal === 'PLATINUM')       return COLOR_DOT.PLATINUM
  if (metal === 'SILVER')         return COLOR_DOT.SILVER
  return '#aaa'
}

interface Props {
  value: string
  onChange: (val: string) => void
  metals: string[]
  showQuickPick?: boolean
}

export function MetalWheelPicker({ value, onChange, metals, showQuickPick = false }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: index * ITEM_HEIGHT, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  // Scroll to selected on mount
  useEffect(() => {
    const idx = metals.indexOf(value)
    if (idx >= 0) scrollToIndex(idx, false)
  }, [])

  // Snap on scroll end
  const snapTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const handleScrollEvent = useCallback(() => {
    clearTimeout(snapTimeout.current)
    snapTimeout.current = setTimeout(() => {
      const el = listRef.current
      if (!el) return
      const idx = Math.round(el.scrollTop / ITEM_HEIGHT)
      const clamped = Math.max(0, Math.min(metals.length - 1, idx))
      scrollToIndex(clamped)
      onChange(metals[clamped])
    }, 80)
  }, [metals, onChange, scrollToIndex])

  return (
    <div className="flex flex-col gap-3">
      {/* Wheel */}
      <div className="relative mx-auto" style={{ width: '100%', maxWidth: 340 }}>
        {/* Selection highlight */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-10 rounded-xl"
          style={{
            top: `${ITEM_HEIGHT * 2}px`,
            height: `${ITEM_HEIGHT}px`,
            background: 'var(--color-accent)18',
            border: '1.5px solid var(--color-accent)60',
          }}
        />
        {/* Top/bottom fade */}
        <div className="absolute top-0 left-0 right-0 h-[88px] pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, var(--color-bg), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[88px] pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, var(--color-bg), transparent)' }} />

        {/* Scrollable list */}
        <div
          ref={listRef}
          onScroll={handleScrollEvent}
          className="overflow-y-scroll hide-scrollbar"
          style={{
            height: `${ITEM_HEIGHT * 5}px`,
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Padding items top */}
          <div style={{ height: ITEM_HEIGHT * 2 }} />

          {metals.map((m, i) => (
            <div
              key={m}
              onClick={() => { scrollToIndex(i); onChange(m) }}
              className="flex items-center justify-center gap-2.5 cursor-pointer select-none"
              style={{
                height: ITEM_HEIGHT,
                scrollSnapAlign: 'center',
                transition: 'opacity 0.15s',
                opacity: m === value ? 1 : 0.45,
              }}
            >
              <span
                className="rounded-full flex-shrink-0 shadow-sm"
                style={{
                  width: 14,
                  height: 14,
                  background: getColorDot(m),
                  border: '1.5px solid rgba(0,0,0,0.12)',
                }}
              />
              <span
                className="font-medium tracking-wide"
                style={{
                  fontSize: m === value ? 17 : 15,
                  color: m === value ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontWeight: m === value ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {m}
              </span>
            </div>
          ))}

          {/* Padding items bottom */}
          <div style={{ height: ITEM_HEIGHT * 2 }} />
        </div>
      </div>

      {/* Quick-tap grid for common choices */}
      {showQuickPick && <div className="grid grid-cols-3 gap-1.5">
        {['14K WHITE', '14K YELLOW', '14K ROSE', '18K WHITE', '18K YELLOW', '18K ROSE'].map(m => (
          <button
            key={m}
            type="button"
            onClick={() => {
              onChange(m)
              scrollToIndex(metals.indexOf(m))
            }}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-all"
            style={{
              background: value === m ? 'var(--color-primary)' : 'var(--color-surface)',
              color: value === m ? '#fff' : 'var(--color-text-muted)',
              border: value === m ? 'none' : '1px solid var(--color-border)',
            }}
          >
            <span className="rounded-full flex-shrink-0"
              style={{ width: 8, height: 8, background: getColorDot(m), border: '1px solid rgba(0,0,0,0.1)' }} />
            {m}
          </button>
        ))}
      </div>}
    </div>
  )
}
