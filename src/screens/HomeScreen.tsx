import React from 'react'
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/types'
import { useTheme } from '../theme/Theme'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

/** Pantalla de inicio y acceso al flujo de captura. */
export function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions()
  const { isDark } = useTheme()
  const gradient = isDark ? ["#0f172a", "#334155"] as const : ["#ffffff", "#e5e7eb"] as const
  const cardMax = width < 480 ? 360 : width < 768 ? 440 : 540
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={[styles.card, { maxWidth: cardMax }] }>
        <View style={styles.cardHeader}>
          <Ionicons name="aperture" size={24} color="#7f1d1d" />
          <Text style={styles.title}>Prototype</Text>
        </View>
        <Text style={styles.subtitle}>Image capture and analysis</Text>
        <View style={styles.actionsCenter}>
          <Pressable
            onPress={() => navigation.navigate('Capture')}
            style={({ pressed }) => [styles.primarySmall, pressed && styles.primaryPressed]}
          >
            <Text style={styles.primaryText}>Start</Text>
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>v0.1.0 · Help</Text>
        </View>
      </BlurView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#ffffff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#475569', marginTop: 8, textAlign: 'center' },
  actionsCenter: { marginTop: 20, alignItems: 'center', justifyContent: 'center' },
  primarySmall: { backgroundColor: '#7f1d1d', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  primaryPressed: { transform: [{ scale: 0.98 }], opacity: 0.95, backgroundColor: '#641515' },
  primaryText: { color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  footer: { marginTop: 16, alignItems: 'center' },
  footerText: { color: '#64748b' }
})
