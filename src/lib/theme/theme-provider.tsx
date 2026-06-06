import { useEffect, useMemo, useState } from 'react'
import { ThemeContext, type Theme } from './useTheme'

const THEME_STORAGE_KEY = 'livepoly-theme'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getPreferredTheme(): Theme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return getSystemTheme()
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [hasResolvedTheme, setHasResolvedTheme] = useState(false)
  const isDark = theme === 'dark'

  useEffect(() => {
    const preferredTheme = getPreferredTheme()

    setTheme(preferredTheme)
    setHasResolvedTheme(true)
    applyTheme(preferredTheme)
  }, [])

  useEffect(() => {
    if (!hasResolvedTheme) {
      return
    }

    applyTheme(theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [hasResolvedTheme, theme])

  const value = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme: () => {
        setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
      },
    }),
    [theme, isDark],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
