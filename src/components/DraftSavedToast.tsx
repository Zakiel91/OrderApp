import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

interface Props {
  form: unknown
}

export function DraftSavedToast({ form }: Props) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)
  // Don't announce "Draft saved" just for opening the wizard.
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; return }

    // Both timers are tracked here. The old version returned a cleanup from
    // inside the setTimeout callback, where the return value is discarded — so
    // the hide timer survived unmount and fired setState on a dead component.
    let hideTimer: ReturnType<typeof setTimeout> | undefined
    const showTimer = setTimeout(() => {
      setVisible(true)
      hideTimer = setTimeout(() => setVisible(false), 2000)
    }, 500)

    return () => {
      clearTimeout(showTimer)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [form])

  if (!visible) return null

  return (
    <div
      role="status"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40
                 bg-[var(--color-success)] text-white text-[14px]
                 px-4 py-1.5 rounded-full
                 animate-[fadeIn_150ms_ease-out] pointer-events-none"
    >
      &#x2713; {t('draft_saved')}
    </div>
  )
}
