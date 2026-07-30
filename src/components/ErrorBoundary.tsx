import { Component, type ErrorInfo, type ReactNode } from 'react'

// The boundary sits ABOVE LanguageProvider (it must also catch failures inside
// the providers themselves), so it cannot use the `t()` hook. It reads the saved
// language directly instead and carries its own minimal copy.
const COPY: Record<string, { title: string; body: string; reload: string; reset: string }> = {
  en: {
    title: 'Something went wrong',
    body: 'The app hit an unexpected error. Reloading usually fixes it.',
    reload: 'Reload app',
    reset: 'Clear saved draft and reload',
  },
  he: {
    title: 'משהו השתבש',
    body: 'האפליקציה נתקלה בשגיאה לא צפויה. רענון בדרך כלל פותר את זה.',
    reload: 'רענן את האפליקציה',
    reset: 'מחק טיוטה שמורה ורענן',
  },
  ru: {
    title: 'Что-то пошло не так',
    body: 'Приложение столкнулось с непредвиденной ошибкой. Обычно помогает перезагрузка.',
    reload: 'Перезагрузить приложение',
    reset: 'Удалить черновик и перезагрузить',
  },
}

function copyForSavedLang() {
  let lang = 'en'
  try { lang = localStorage.getItem('lang') || 'en' } catch { /* private mode */ }
  return COPY[lang] || COPY.en
}

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Nothing to report to yet — surface it in the console so a screen recording
    // or a remote debugging session still shows the cause.
    console.error('Unhandled render error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    const c = copyForSavedLang()
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="text-5xl mb-5">⚠️</div>
        <h1 className="text-xl font-bold mb-2">{c.title}</h1>
        <p className="text-[15px] text-[var(--color-text-muted)] mb-6 max-w-xs">{c.body}</p>

        <div className="w-full max-w-xs space-y-3">
          <button
            className="w-full bg-[var(--color-primary)] text-white font-semibold rounded-xl px-4 py-4 min-h-[52px]"
            onClick={() => window.location.reload()}
          >
            {c.reload}
          </button>
          {/* A corrupt draft in localStorage is the most likely cause of a crash
              that survives a plain reload, so offer that escape hatch too. */}
          <button
            className="w-full bg-[var(--color-surface)] text-[var(--color-text)] font-medium rounded-xl px-4 py-3.5 min-h-[50px] border border-[var(--color-border)]"
            onClick={() => {
              try {
                localStorage.removeItem('order_draft')
                localStorage.removeItem('fix_draft')
              } catch { /* ignore */ }
              window.location.reload()
            }}
          >
            {c.reset}
          </button>
        </div>

        <pre className="mt-6 max-w-full overflow-x-auto text-[11px] text-[var(--color-text-muted)] text-start whitespace-pre-wrap">
          {this.state.error.message}
        </pre>
      </div>
    )
  }
}
