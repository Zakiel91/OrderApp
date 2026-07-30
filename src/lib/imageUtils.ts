import { API_BASE } from './config'
import { ApiError } from './api'
import { notifySessionExpired } from './session'

const MAX_WIDTH = 1200
const MAX_HEIGHT = 1200
const QUALITY = 0.8

/** Matches the `images_hint` copy shown to the user. */
export const MAX_IMAGES = 5

function getAuthHeader(): Record<string, string> {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}
  } catch { return {} }
}

// Compress image in browser before upload
export function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Scale down if larger than max
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not supported')); return }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        blob => {
          if (blob) resolve(blob)
          else reject(new Error('Compression failed'))
        },
        'image/jpeg',
        QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

// Upload compressed image to R2. Authorization is required — the endpoint is
// behind requireAuth in the worker, same as every other /api route.
export async function uploadImage(file: File, orderId: string): Promise<string> {
  const compressed = await compressImage(file)
  const formData = new FormData()
  formData.append('file', compressed, file.name.replace(/\.\w+$/, '.jpg'))
  formData.append('order_id', orderId)

  // No Content-Type header — the browser must set the multipart boundary itself.
  const res = await fetch(`${API_BASE}/api/images/upload`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  })
  if (!res.ok) {
    if (res.status === 401) notifySessionExpired()
    throw new ApiError(res.status, `Upload failed (${res.status})`)
  }
  const data = await res.json() as { key: string }
  return data.key
}

// Upload all images for an order, return comma-separated keys
export async function uploadOrderImages(files: File[], orderId: string): Promise<string> {
  if (files.length === 0) return ''
  const keys = await Promise.all(files.map(f => uploadImage(f, orderId)))
  return keys.join(',')
}

/**
 * Fetch a stored image as an object URL.
 *
 * `<img src>` cannot carry an Authorization header, so a plain URL would only
 * work if the endpoint were public. Instead the bytes are fetched with the JWT
 * and wrapped in a blob URL. Callers MUST revoke the returned URL on unmount.
 */
export async function fetchImageObjectUrl(key: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/images/get?key=${encodeURIComponent(key)}`, {
    headers: getAuthHeader(),
  })
  if (!res.ok) {
    if (res.status === 401) notifySessionExpired()
    throw new ApiError(res.status, `Image fetch failed (${res.status})`)
  }
  return URL.createObjectURL(await res.blob())
}
