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
  return {
    exitoso: !!data.exitoso,
    mensaje: data.mensaje ?? '',
    clasificacion: {
      prediction: data?.clasificacion?.prediction ?? '',
      score: Number(data?.clasificacion?.score ?? 0),
      extra: {
        classIndex: Number(data?.clasificacion?.extra?.classIndex ?? 0),
        rawOutput: Array.isArray(data?.clasificacion?.extra?.rawOutput) ? data.clasificacion.extra.rawOutput.map((n: any) => Number(n)) : [],
        tiempoMs: Number(data?.clasificacion?.extra?.tiempoMs ?? 0)
      }
    },
    segmentacion: {
      error: data?.segmentacion?.error ?? null,
      numMasks: Number(data?.segmentacion?.numMasks ?? 0),
      segmentedImageBase64: String(data?.segmentacion?.segmentedImageBase64 ?? ''),
      success: !!data?.segmentacion?.success
    },
    previewUri: `data:${mime};base64,${base64}`
  }
}
