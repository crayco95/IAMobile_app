export interface ClassificationExtra {
  classIndex: number
  rawOutput: number[]
  tiempoMs: number
}

export interface Classification {
  prediction: string
  score: number
  extra: ClassificationExtra
}

export interface Segmentation {
  error?: string | null
  numMasks: number
  segmentedImageBase64: string
  success: boolean
}

export interface UploadResult {
  exitoso: boolean
  mensaje: string
  clasificacion: Classification
  segmentacion: Segmentation
  previewUri?: string
}
