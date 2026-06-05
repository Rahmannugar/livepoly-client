import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react'
import { forwardRef, useState, type InputHTMLAttributes } from 'react'

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(props, ref) {
    const [isVisible, setIsVisible] = useState(false)

    return (
      <div className="relative">
        <input
          ref={ref}
          type={isVisible ? 'text' : 'password'}
          className="h-10 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-base)] px-4 pr-11 text-sm font-semibold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
          {...props}
        />
        <button
          type="button"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[var(--sea-ink-soft)] transition hover:bg-[var(--surface)] hover:text-[var(--sea-ink)]"
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? (
            <EyeSlashIcon weight="bold" className="h-4.5 w-4.5" />
          ) : (
            <EyeIcon weight="bold" className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
    )
  },
)
