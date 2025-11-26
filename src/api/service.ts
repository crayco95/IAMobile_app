import Constants from 'expo-constants'
import { UploadResult } from '../types'

/** Lee la URL base del servicio desde `expo.extra.API_BASE_URL`. */
export function getApiBaseUrl(): string | undefined {
  const extra = (Constants.expoConfig?.extra ?? (Constants as any).manifest?.extra) as any
  const url = extra?.API_BASE_URL as string | undefined
  return url && url.trim().length > 0 ? url : undefined
}

export function getMaxImageMb(): number {
  const extra = (Constants.expoConfig?.extra ?? (Constants as any).manifest?.extra) as any
  const n = Number(extra?.IMAGE_MAX_MB)
  return Number.isFinite(n) && n > 0 ? n : 5
}

export function getMaxImageBytes(): number {
  return getMaxImageMb() * 1024 * 1024
}

/**
 * Sube imagen en Base64 al endpoint `/analyze`.
 * Espera JSON { imageBase64, mime } y responde { id, label, confidence }.
 */
export async function uploadImageBase64(base64: string, mime: string = 'image/jpeg'): Promise<UploadResult> {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) throw new Error('API_BASE_URL no configurada')
  const res = await fetch(`${baseUrl}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64, mime })
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return { id: data.id ?? 'unknown', label: data.label, confidence: data.confidence, previewUri: `data:${mime};base64,${base64}` }
}
