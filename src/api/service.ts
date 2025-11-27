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
  // Normalizar para evitar dobles slashes
  const normalized = baseUrl.replace(/\/+$/, '')
  // Log útil en desarrollo para verificar que se envía el payload
  try {
    // eslint-disable-next-line no-console
    console.log('[api] uploading image to', `${normalized}/procesar`, 'payload bytes ~', base64 ? base64.length : 0)
  } catch {}
  const dataUri = `data:${mime};base64,${base64}`
  const payload = { imageBase64: base64, imagenBase64: base64, mime, dataUri }
  const res = await fetch(`${normalized}/procesar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    // Intenta leer el body para obtener detalle del error del servidor
    let bodyText: string | null = null
    try {
      bodyText = await res.text()
    } catch {}
    const msg = bodyText ? `HTTP ${res.status}: ${bodyText}` : `HTTP ${res.status}`
    throw new Error(msg)
  }
  const data = await res.json()
  
  // Log completo de la respuesta del backend para debugging
  try {
    // eslint-disable-next-line no-console
    console.log('[api] ✅ Respuesta del backend:', JSON.stringify(data, null, 2))
    // eslint-disable-next-line no-console
    console.log('[api] 📊 Clasificación:', data?.clasificacion)
    // eslint-disable-next-line no-console
    console.log('[api] 🖼️  Segmentación RAW:', data?.segmentacion)
    // eslint-disable-next-line no-console
    console.log('[api] 🖼️  segmentedImageBase64 type:', typeof data?.segmentacion?.segmentedImageBase64, 'length:', data?.segmentacion?.segmentedImageBase64?.length)
    // eslint-disable-next-line no-console
    console.log('[api] 🖼️  primeros 100 chars:', data?.segmentacion?.segmentedImageBase64?.substring(0, 100))
  } catch {}
  
  // Mapear campos del backend (snake_case) a camelCase
  // El backend envía: class_index, raw_output, tiempo_ms, segmented_image_base64, num_masks
  const segmentedBase64 = data?.segmentacion?.segmented_image_base64 || data?.segmentacion?.segmentedImageBase64
  const hasSegmentedImage = segmentedBase64 && typeof segmentedBase64 === 'string' && segmentedBase64.length > 0
  
  const result: UploadResult = {
    exitoso: !!data.exitoso,
    mensaje: data.mensaje ?? '',
    clasificacion: {
      prediction: data?.clasificacion?.prediction ?? '',
      score: Number(data?.clasificacion?.score ?? 0),
      extra: {
        classIndex: Number(data?.clasificacion?.extra?.class_index ?? data?.clasificacion?.extra?.classIndex ?? 0),
        rawOutput: Array.isArray(data?.clasificacion?.extra?.raw_output || data?.clasificacion?.extra?.rawOutput) 
          ? (data.clasificacion.extra.raw_output || data.clasificacion.extra.rawOutput).map((n: any) => Number(n)) 
          : [],
        tiempoMs: Number(data?.clasificacion?.extra?.tiempo_ms ?? data?.clasificacion?.extra?.tiempoMs ?? 0)
      }
    },
    segmentacion: {
      error: data?.segmentacion?.error ?? null,
      numMasks: data?.segmentacion?.num_masks ?? data?.segmentacion?.numMasks ?? 0,
      segmentedImageBase64: hasSegmentedImage ? segmentedBase64 : '',
      success: !!data?.segmentacion?.success
    },
    previewUri: `data:${mime};base64,${base64}`
  }
  
  try {
    // eslint-disable-next-line no-console
    console.log('[api] 📦 Result final - segmentedImageBase64 length:', result.segmentacion.segmentedImageBase64.length)
  } catch {}
  
  return result
}
