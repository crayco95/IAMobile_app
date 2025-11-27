import { UploadResult } from '../types'
/** Mock de subida en Base64 para desarrollo sin backend. */

function wait(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

export async function mockUploadBase64(base64: string, mime?: string): Promise<UploadResult> {
  await wait(1200)
  const predictions = ['Harvest Stage', 'Growth Stage', 'Unknown']
  const prediction = predictions[Math.floor(Math.random() * predictions.length)]
  const score = 0.8 + Math.random() * 0.2
  const previewUri = `data:${mime || 'image/jpeg'};base64,${base64}`
  const transparentPng1x1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAoMBgQK9cUQAAAAASUVORK5CYII='
  return {
    exitoso: true,
    mensaje: 'Imagen procesada correctamente',
    clasificacion: {
      prediction,
      score,
      extra: { classIndex: 0, rawOutput: [score, 1 - score, 0], tiempoMs: 100 + Math.floor(Math.random() * 50) }
    },
    segmentacion: { error: null, numMasks: 1, segmentedImageBase64: transparentPng1x1, success: true },
    previewUri
  }
}
