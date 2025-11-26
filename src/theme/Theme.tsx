import React, { createContext, useContext, useMemo, useState } from 'react'

type ThemeContextValue = {
  isDark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: false, toggle: () => {} })

/** Proveedor de tema (claro/oscuro) para toda la app. */
export function ThemeProvider({ children }: { children: any }) {
  const [isDark, setIsDark] = useState(false)
  const value = useMemo(() => ({ isDark, toggle: () => setIsDark(v => !v) }), [isDark])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** Hook para acceder al estado de tema y alternarlo. */
export function useTheme() {
  return useContext(ThemeContext)
}
