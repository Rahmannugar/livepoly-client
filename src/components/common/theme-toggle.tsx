import { MoonIcon, SunIcon } from '@phosphor-icons/react'
import { useTheme } from '#/lib/theme/useTheme'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="theme-toggle"
      onClick={toggleTheme}
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
