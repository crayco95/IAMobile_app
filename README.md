# IAMobile_app (Expo + React Native)

Aplicación móvil y web para captura/selección de imágenes, previsualización y envío en Base64. Soporta Android, iOS y Web.

## Requisitos
- Node.js y npm
- Expo SDK 54 (proyecto actualizado)
- Expo Go actualizado en iOS/Android (para pruebas en dispositivo)

## Instalación
- `npm install`

## Ejecución
- Web: `npm run web` → `http://localhost:8081/`
- Desarrollo con túnel (recomendado para iOS): `npx expo start --tunnel`
- Android (requiere SDK/Emulador): `npm run android`

## Configuración
- `app.json` → `expo.extra`:
  - `API_BASE_URL`: URL del servicio (endpoint `POST /analyze` recibe `{ imageBase64, mime }`).
  - `IMAGE_MAX_MB`: límite configurable de tamaño (por defecto `5`).

## Flujo de imágenes
- Captura/galería (`expo-image-picker`).
- Validación de formato y tamaño.
- Conversión a Base64 y previsualización (data URI o archivo local según plataforma).
- Envío en Base64 al backend si `API_BASE_URL` está configurado; en otro caso, mock.

## Notas iOS
- Usa túnel: `npx expo start --tunnel` y abre el enlace `exp://...exp.direct` en Expo Go.
- Algunas imágenes (HEIC/iCloud) se normalizan a JPEG para la previsualización.
- Si Expo Go muestra incompatibilidad de SDK, es necesario usar la última versión de Expo Go o ejecutar en simulador iOS.

## Estructura
- Entrada: `index.js`, `App.tsx`
- Navegación: `src/navigation/AppNavigator.tsx`
- Pantallas: `src/screens/HomeScreen.tsx`, `src/screens/CaptureScreen.tsx`, `src/screens/ResultScreen.tsx`
- API: `src/api/service.ts` (real), `src/api/mock.ts` (mock)
- Utilidades: `src/utils/image.ts`
- Tema/Componentes: `src/theme/Theme.tsx`, `src/components/ThemeToggle.tsx`

## Scripts útiles
- `npm run start` (QR y comandos Expo)
- `npm run web` (web)
- `npm run android` (Android)
- `npm run ios` (requiere macOS/Xcode)
- `npm run typecheck` (TypeScript)

