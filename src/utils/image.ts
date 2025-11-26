import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system'
/**
 * Devuelve si el `uri` apunta a una imagen soportada.
 */
export function isSupportedImage(uri: string) {
  const lower = uri.toLowerCase()
  return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.startsWith('file://')
}

/** Formatea bytes a una cadena legible (KB/MB/GB). */
export function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/** Verifica tipos MIME soportados para imagen. */
export function isSupportedMime(mime?: string) {
  if (!mime) return false
  const m = mime.toLowerCase()
  return m.includes('image/jpeg') || m.includes('image/jpg') || m.includes('image/png')
}

/**
 * Lee una imagen desde `uri` y retorna Base64, MIME y data URI.
 * Web: usa `fetch`+`Blob`+`FileReader`. Nativo: usa `expo-file-system`.
 */
export async function readBase64(uri: string) {
  if (Platform.OS === 'web') {
    const resp = await fetch(uri)
    const blob = await resp.blob()
    const mime = blob.type || 'image/jpeg'
    const reader = new FileReader()
    const dataUri: string = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('Failed to read blob'))
      reader.readAsDataURL(blob)
    })
    const base64 = dataUri.split(',')[1] || ''
    return { base64, mime, dataUri }
  } else {
    const lower = uri.toLowerCase()
    const mime = lower.endsWith('.png') ? 'image/png' : 'image/jpeg'
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as const })
    const dataUri = `data:${mime};base64,${base64}`
    return { base64, mime, dataUri }
  }
}

export function base64ByteLength(b64: string) {
  const len = b64.length
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0
  return Math.floor((len * 3) / 4) - padding
}

export function mimeFromUri(uri?: string) {
  if (!uri) return 'image/jpeg'
  const lower = uri.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  return 'image/jpeg'
}
