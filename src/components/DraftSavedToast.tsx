import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

interface Props {
  form: unknown
}

export function DraftSavedToast({ form }: Props) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const debounce = setTimeout(() => {
      setVisible(true)
      const hide = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(hide)
    }, 500)
    return () => clearTimeout(debounce)
  }, [form])

  if (!visible) return null

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40
                 bg-[var(--color-success)] text-white text-[14px]
                 px-4 py-1.5 rounded-full
                 animate-[fadeIn_150ms_ease-out]"
    >
      &#x2713; {t('draft_saved')}
    </div>
  )
}
