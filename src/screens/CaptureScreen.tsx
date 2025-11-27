import { useState } from 'react'
import React from 'react'
import { View, Text, Image, Pressable, ActivityIndicator, StyleSheet, Platform, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import { isSupportedImage, formatBytes, isSupportedMime, readBase64, base64ByteLength, mimeFromUri } from '../utils/image'
import { mockUploadBase64 } from '../api/mock'
import { getApiBaseUrl, uploadImageBase64 as uploadServiceBase64, getMaxImageBytes, getMaxImageMb } from '../api/service'
import { useRequest } from '../hooks/useRequest'
import { UploadResult } from '../types'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/types'
import { useTheme } from '../theme/Theme'

type Props = NativeStackScreenProps<RootStackParamList, 'Capture'>

/** Pantalla de captura/galería, validación y subida en Base64. */
export function CaptureScreen({ navigation }: Props) {
  const { width } = useWindowDimensions()
  const { isDark } = useTheme()
  const gradient = isDark ? ["#0f172a", "#334155"] as const : ["#ffffff", "#e5e7eb"] as const
  const cardMax = width < 480 ? 360 : width < 768 ? 440 : 540
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageMime, setImageMime] = useState<string | undefined>(undefined)
  const [previewDataUri, setPreviewDataUri] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState<number | undefined>(undefined)
  const { status, error, run, reset } = useRequest<UploadResult>()
  const [uiError, setUiError] = useState<string | null>(null)
  const isWeb = Platform.OS === 'web'

  function clearSelected() {
    setImageUri(null)
    setImageBase64(null)
    setImageMime(undefined)
    setPreviewDataUri(null)
    setImageSize(undefined)
    setUiError(null)
  }

  async function pickFromLibrary() {
    reset()
    setUiError(null)
    setImageSize(undefined)
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      setUiError('Permission denied for media library')
      return
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1, base64: true })
    if (res.canceled) return
    const asset = res.assets?.[0]
    const uri = asset?.uri || null
    if (!uri) return
    let size: number | undefined
    let okFormat = false
    if (isWeb) {
      const resp = await fetch(uri)
      const blob = await resp.blob()
      size = blob.size
      okFormat = isSupportedMime(blob.type) || isSupportedImage(uri)
    } else {
      const b64 = asset?.base64
      if (b64) {
        size = base64ByteLength(b64)
        okFormat = true
      } else {
        const info = await FileSystem.getInfoAsync(uri)
        size = (info as any).size as number | undefined
        okFormat = isSupportedImage(uri)
      }
    }
    setImageSize(size)
    const maxBytes = getMaxImageBytes()
    const maxMb = getMaxImageMb()
    if (!okFormat) {
      setUiError('Unsupported format. Use JPG or PNG')
      return
    }
    if (size && size > maxBytes) {
      setUiError(`Image too large: ${formatBytes(size)}. Max ${maxMb}MB`)
    }
    setImageUri(uri)
    let mime = asset?.mimeType ?? mimeFromUri(uri)
    if (asset?.base64) {
      let b64 = asset.base64
      let outUri: string | null = null
      if (!isSupportedMime(mime) || !isWeb) {
        const m = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true })
        b64 = m.base64 || b64
        mime = 'image/jpeg'
        outUri = m.uri
      }
      setImageBase64(b64)
      setImageMime(mime)
      setPreviewDataUri(outUri ?? `data:${mime};base64,${b64}`)
      // Debug logs for library picker
      try {
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📸 Image selected from library')
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📸 imageUri:', uri)
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📸 previewDataUri set to:', outUri ?? 'data URI')
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📸 base64 length:', b64.length)
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📸 mime:', mime)
      } catch {}
    } else {
      const m = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true })
      const b64 = m.base64 || ''
      setImageBase64(b64)
      setImageMime('image/jpeg')
      setPreviewDataUri(isWeb ? `data:image/jpeg;base64,${b64}` : m.uri)
      setImageSize(b64 ? base64ByteLength(b64) : size)
      // Debug logs for library picker (manipulated)
      try {
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📸 Image manipulated and selected from library')
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📸 manipulated uri:', m.uri)
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📸 previewDataUri set to:', isWeb ? 'data URI' : m.uri)
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📸 base64 length:', b64.length)
      } catch {}
    }
  }

  async function takePhoto() {
    reset()
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      setUiError('Permission denied for camera')
      return
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 1, base64: true })
    if (res.canceled) return
    const asset = res.assets?.[0]
    const uri = asset?.uri || null
    if (!uri) return
    let size: number | undefined
    let okFormat = false
    if (isWeb) {
      const resp = await fetch(uri)
      const blob = await resp.blob()
      size = blob.size
      okFormat = isSupportedMime(blob.type) || isSupportedImage(uri)
    } else {
      const b64 = asset?.base64
      if (b64) {
        size = base64ByteLength(b64)
        okFormat = true
      } else {
        const info = await FileSystem.getInfoAsync(uri)
        size = (info as any).size as number | undefined
        okFormat = isSupportedImage(uri)
      }
    }
    setImageSize(size)
    const maxBytes = getMaxImageBytes()
    const maxMb = getMaxImageMb()
    if (!okFormat) {
      setUiError('Unsupported format. Use JPG or PNG')
      return
    }
    if (size && size > maxBytes) {
      setUiError(`Image too large: ${formatBytes(size)}. Max ${maxMb}MB`)
    }
    setImageUri(uri)
    let mime = asset?.mimeType ?? mimeFromUri(uri)
    if (asset?.base64) {
      let b64 = asset.base64
      let outUri: string | null = null
      if (!isSupportedMime(mime) || !isWeb) {
        const m = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true })
        b64 = m.base64 || b64
        mime = 'image/jpeg'
        outUri = m.uri
      }
      setImageBase64(b64)
      setImageMime(mime)
      setPreviewDataUri(outUri ?? `data:${mime};base64,${b64}`)
      // Debug logs for camera
      try {
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📷 Photo taken with camera')
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📷 imageUri:', uri)
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📷 previewDataUri set to:', outUri ?? 'data URI')
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📷 base64 length:', b64.length)
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📷 mime:', mime)
      } catch {}
    } else {
      const m = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true })
      const b64 = m.base64 || ''
      setImageBase64(b64)
      setImageMime('image/jpeg')
      setPreviewDataUri(isWeb ? `data:image/jpeg;base64,${b64}` : m.uri)
      setImageSize(b64 ? base64ByteLength(b64) : size)
      // Debug logs for camera (manipulated)
      try {
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📷 Photo taken and manipulated')
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📷 manipulated uri:', m.uri)
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📷 previewDataUri set to:', isWeb ? 'data URI' : m.uri)
        // eslint-disable-next-line no-console
        console.log('[CaptureScreen] 📷 base64 length:', b64.length)
      } catch {}
    }
  }

  /** Sube la imagen en Base64: servicio real si hay URL, si no mock. */
  async function upload() {
    if (!imageBase64) return
    const maxBytes = getMaxImageBytes()
    const maxMb = getMaxImageMb()
    if (imageSize && imageSize > maxBytes) {
      setUiError(`Image too large. Max ${maxMb}MB`)
      return
    }
    try {
      const baseUrl = getApiBaseUrl()
      // Log para depuración: qué URL y tamaño de base64 se va a enviar
      try {
        // eslint-disable-next-line no-console
        console.log('[ui] upload triggered, baseUrl=', baseUrl, 'base64 length=', imageBase64?.length)
      } catch {}
      const r = await run(() => baseUrl ? uploadServiceBase64(imageBase64, imageMime || 'image/jpeg') : mockUploadBase64(imageBase64, imageMime))
      navigation.navigate('Result', { result: r })
    } catch (e) {
      // Mostrar error en la UI para no silenciar fallos
      // eslint-disable-next-line no-console
      console.error('Upload failed', e)
      setUiError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={[styles.card, { maxWidth: cardMax }] }>
        <View style={styles.cardHeader}>
          <Ionicons name="camera" size={20} color="#7f1d1d" />
          <Text style={styles.cardTitle}>Capture</Text>
        </View>
        {!(previewDataUri || imageUri) && (
          <View style={styles.actions}>
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={takePhoto}><Text style={styles.buttonText}>Take Photo</Text></Pressable>
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={pickFromLibrary}><Text style={styles.buttonText}>Pick from Gallery</Text></Pressable>
          </View>
        )}
        {(previewDataUri || imageUri) && (
          <View style={styles.preview}>
            <Image 
              key={(previewDataUri ?? imageUri) ?? 'none'} 
              source={{ uri: (previewDataUri ?? imageUri)! }} 
              style={styles.image}
              resizeMode="contain"
              onError={(e) => {
                // eslint-disable-next-line no-console
                console.error('[CaptureScreen] ❌ Error loading preview image:', e.nativeEvent.error)
                setUiError('Error loading image preview')
              }}
              onLoad={() => {
                // eslint-disable-next-line no-console
                console.log('[CaptureScreen] ✅ Preview image loaded successfully')
              }}
            />
            {!previewDataUri && !imageUri && (
              <Text style={{ color: '#64748b', marginTop: 8 }}>Loading image...</Text>
            )}
            <View style={styles.actionsBelow}>
               <Pressable style={({ pressed }) => [styles.secondary, pressed && styles.pressedSecondary]} onPress={clearSelected}><Text style={styles.secondaryText}>Change Image</Text></Pressable>
               <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={upload}><Text style={styles.buttonText}>Upload</Text></Pressable>
            </View>
          </View>
        )}
        {status === 'loading' && (
          <View style={styles.status}>
            <ActivityIndicator size="large" />
            <Text>Loading...</Text>
          </View>
        )}
        {(status === 'error' || uiError) && (
          <View style={styles.status}><Text style={styles.error}>{uiError ?? error}</Text></View>
        )}
        <View style={styles.footer}><Text style={styles.footerText}>v0.1.0</Text></View>
      </BlurView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 420, alignSelf: 'center', backgroundColor: '#ffffff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, alignItems: 'center' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  actions: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  actionsBelow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 16 },
  button: { backgroundColor: '#7f1d1d', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondary: { borderWidth: 1, borderColor: '#7f1d1d', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  secondaryText: { color: '#7f1d1d', fontWeight: '600' },
  preview: { marginTop: 16, alignItems: 'center', width: '100%' },
  image: { 
    width: '100%', 
    height: 280, 
    borderRadius: 12, 
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  status: { marginTop: 16 },
  error: { color: '#ef4444' }
  ,pressed: { transform: [{ scale: 0.98 }], opacity: 0.95, backgroundColor: '#641515' }
  ,pressedSecondary: { opacity: 0.8 }
  ,footer: { marginTop: 12, alignItems: 'center' }
  ,footerText: { color: '#64748b' }
})
