import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Image, useWindowDimensions, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/types'
import { useTheme } from '../theme/Theme'

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>

/** Muestra el resultado de análisis y la previsualización de la imagen. */
export function ResultScreen({ route }: Props) {
  const { result } = route.params
  const { width } = useWindowDimensions()
  const { isDark } = useTheme()
  const gradient = isDark ? ["#0f172a", "#334155"] as const : ["#ffffff", "#e5e7eb"] as const
  const cardMax = width < 480 ? 360 : width < 768 ? 440 : 540
  
  // Log del resultado completo para debug
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.log('[ResultScreen] 📋 Result completo:', JSON.stringify(result, null, 2))
      // eslint-disable-next-line no-console
      console.log('[ResultScreen] 🖼️  Tiene imagen segmentada:', !!result.segmentacion?.segmentedImageBase64, 'length:', result.segmentacion?.segmentedImageBase64?.length)
    } catch {}
  }, [result])
  
  const segmentedImageUri = result.segmentacion?.segmentedImageBase64 
    ? `data:image/png;base64,${result.segmentacion.segmentedImageBase64}`
    : null
  
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={[styles.card, { maxWidth: cardMax }] }>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#7f1d1d" />
            <Text style={styles.title}>Result</Text>
          </View>
          
          {/* Imagen original (clasificación) */}
          {result.previewUri && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>📸 Imagen Original (Clasificación)</Text>
              <Image source={{ uri: result.previewUri }} style={styles.image} />
            </View>
          )}
          
          {/* Datos de clasificación */}
          <View style={styles.box}>
            <Text style={styles.row}>✅ {result.mensaje}</Text>
            <Text style={styles.row}>🏷️  Prediction: {result.clasificacion?.prediction}</Text>
            <Text style={styles.row}>📊 Score: {(result.clasificacion?.score * 100).toFixed(2)}%</Text>
            <Text style={styles.row}>🔢 ClassIndex: {result.clasificacion?.extra?.classIndex}</Text>
            <Text style={styles.row}>⏱️  Tiempo: {result.clasificacion?.extra?.tiempoMs} ms</Text>
          </View>
          
          {/* Imagen segmentada */}
          {segmentedImageUri ? (
            <View style={styles.segmentBox}>
              <Text style={styles.segmentTitle}>🎨 Imagen Segmentada</Text>
              <Image 
                source={{ uri: segmentedImageUri }} 
                style={styles.image}
                resizeMode="contain"
                onError={(e) => {
                  // eslint-disable-next-line no-console
                  console.error('[ResultScreen] ❌ Error cargando imagen segmentada:', e.nativeEvent.error)
                }}
                onLoad={() => {
                  // eslint-disable-next-line no-console
                  console.log('[ResultScreen] ✅ Imagen segmentada cargada correctamente')
                }}
              />
              <Text style={styles.debugText}>
                Status: {result.segmentacion?.success ? '✅ Success' : '❌ Failed'}
                {result.segmentacion?.numMasks ? ` | Masks: ${result.segmentacion.numMasks}` : ''}
              </Text>
            </View>
          ) : (
            <View style={styles.segmentBox}>
              <Text style={styles.noSegmentText}>⚠️  No hay imagen de segmentación disponible</Text>
            </View>
          )}
          
          <View style={styles.footer}><Text style={styles.footerText}>v0.1.0</Text></View>
        </BlurView>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 24 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingBottom: 24 },
  card: { width: '100%', maxWidth: 420, alignSelf: 'center', backgroundColor: '#ffffff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, alignItems: 'center' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12, color: '#0f172a', textAlign: 'center' },
  imageSection: { width: '100%', marginBottom: 16, alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
  image: { width: '100%', height: 280, borderRadius: 12, marginBottom: 8 },
  segmentBox: { marginTop: 16, alignItems: 'center', width: '100%' },
  segmentTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  box: { marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, alignItems: 'center', width: '100%' },
  row: { marginBottom: 6, textAlign: 'center' },
  debugText: { fontSize: 12, color: '#64748b', marginTop: 8, textAlign: 'center' },
  noSegmentText: { fontSize: 14, color: '#ef4444', textAlign: 'center', marginTop: 8 },
  footer: { marginTop: 12, alignItems: 'center' },
  footerText: { color: '#64748b' }
})
