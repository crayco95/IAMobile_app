import React from 'react'
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native'
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
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={[styles.card, { maxWidth: cardMax }] }>
        <View style={styles.cardHeader}>
          <Ionicons name="checkmark-circle" size={20} color="#7f1d1d" />
          <Text style={styles.title}>Result</Text>
        </View>
        {result.previewUri && <Image source={{ uri: result.previewUri }} style={styles.image} />}
        <View style={styles.box}>
          <Text style={styles.row}>ID: {result.id}</Text>
          <Text style={styles.row}>Label: {result.label}</Text>
          <Text style={styles.row}>Confidence: {(result.confidence * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.footer}><Text style={styles.footerText}>v0.1.0</Text></View>
      </BlurView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 24 },
  card: { width: '100%', maxWidth: 420, alignSelf: 'center', backgroundColor: '#ffffff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, alignItems: 'center' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12, color: '#0f172a', textAlign: 'center' },
  image: { width: '100%', height: 280, borderRadius: 12 },
  box: { marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, alignItems: 'center' },
  row: { marginBottom: 6, textAlign: 'center' }
  ,footer: { marginTop: 12, alignItems: 'center' }
  ,footerText: { color: '#64748b' }
})
