import { useEffect, useState } from 'react'
import { fetchImageObjectUrl } from '../lib/imageUtils'

type Load =
  | { key: string; status: 'loading' }
  | { key: string; status: 'ready'; url: string }
  | { key: string; status: 'failed' }

/**
 * Renders an image stored in R2 behind the authenticated /api/images/get route.
 *
 * A plain `<img src>` cannot send the Authorization header, so the bytes are
 * fetched with the JWT and shown via a blob URL that is revoked on unmount.
 */
export function AuthImage({
  imageKey,
  alt,
  className,
}: {
  imageKey: string
  alt: string
  className?: string
}) {
  // One state value carrying the key it belongs to. Resetting it when imageKey
  // changes is done by adjusting state during render — the effect body must not
  // call setState synchronously, and a stale URL must never be shown for a new
  // key even for a single frame.
  const [load, setLoad] = useState<Load>({ key: imageKey, status: 'loading' })
  if (load.key !== imageKey) {
    setLoad({ key: imageKey, status: 'loading' })
  }

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    fetchImageObjectUrl(imageKey)
      .then(url => {
        if (cancelled) { URL.revokeObjectURL(url); return }
        objectUrl = url
        setLoad({ key: imageKey, status: 'ready', url })
      })
      .catch(() => {
        if (!cancelled) setLoad({ key: imageKey, status: 'failed' })
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [imageKey])

  if (load.status === 'failed') {
    return (
      <div
        className={className}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-surface-light)', color: 'var(--color-text-muted)', fontSize: 20,
        }}
        role="img"
        aria-label={alt}
      >
        ⚠️
      </div>
    )
  }

  if (load.status === 'loading') {
    return (
      <div
        className={className}
        style={{ background: 'var(--color-surface-light)' }}
        aria-hidden="true"
      />
    )
  }

  return <img src={load.url} alt={alt} className={className} />
}
