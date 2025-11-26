import { UploadResult } from '../types'
/** Mock de subida en Base64 para desarrollo sin backend. */

function wait(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

export async function mockUploadBase64(base64: string, mime?: string): Promise<UploadResult> {
  await wait(1500)
  const labels = ['Gato', 'Perro', 'Persona', 'Documento', 'Vehículo']
  const label = labels[Math.floor(Math.random() * labels.length)]
  const confidence = 0.6 + Math.random() * 0.4
  const dataUri = `data:${mime || 'image/jpeg'};base64,${base64}`
  return { id: randomId(), label, confidence, previewUri: dataUri }
}
