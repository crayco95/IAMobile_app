import React from 'react'
import { Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/Theme'

/** Botón del header para alternar entre tema claro/oscuro. */
export function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  return (
    <Pressable onPress={toggle} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
      <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? '#e5e7eb' : '#0f172a'} />
    </Pressable>
  )
}
