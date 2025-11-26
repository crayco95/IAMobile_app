import { UploadResult } from '../types'
/** Tipos de rutas del stack principal. */
export type RootStackParamList = {
  Home: undefined
  Capture: undefined
  Result: { result: UploadResult }
}
