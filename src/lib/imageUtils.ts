const MAX_WIDTH = 1200
const MAX_HEIGHT = 1200
const QUALITY = 0.8

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

const API_BASE = 'https://innovation-diamonds-api.innovation-diamonds.workers.dev'

// Upload compressed image to R2
export async function uploadImage(file: File, orderId: string): Promise<string> {
  const compressed = await compressImage(file)
  const formData = new FormData()
  formData.append('file', compressed, file.name.replace(/\.\w+$/, '.jpg'))
  formData.append('order_id', orderId)

  const res = await fetch(`${API_BASE}/api/images/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Upload failed')
  const data = await res.json() as { key: string }
  return data.key
}

// Upload all images for an order, return comma-separated keys
export async function uploadOrderImages(files: File[], orderId: string): Promise<string> {
  if (files.length === 0) return ''
  const keys = await Promise.all(files.map(f => uploadImage(f, orderId)))
  return keys.join(',')
}

// Get image URL from key
export function getImageUrl(key: string): string {
  return `${API_BASE}/api/images/get?key=${encodeURIComponent(key)}`
}
