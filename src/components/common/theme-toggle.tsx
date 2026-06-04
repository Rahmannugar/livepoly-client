import { MoonIcon, SunIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { THEME_STORAGE_KEY } from '#/config/app.constants'

type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return getSystemTheme()
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const isDark = theme === 'dark'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [isDark, theme])

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__sky theme-toggle__sky--day" />
        <span className="theme-toggle__sky theme-toggle__sky--night" />
        <span className="theme-toggle__thumb">
          {isDark ? (
            <MoonIcon weight="fill" className="h-4 w-4" />
          ) : (
            <SunIcon weight="fill" className="h-4 w-4" />
          )}
        </span>
      </span>
    </button>
  )
}
