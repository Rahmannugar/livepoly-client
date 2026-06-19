import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { APP_NAME } from '#/config/app.constants'

type AuthLayoutProps = {
  title: string
  subtitle: string
  footer?: ReactNode
  children: ReactNode
}

export function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-8 sm:py-5">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col sm:min-h-[calc(100vh-2.5rem)]">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="display-title text-2xl font-semibold text-[var(--sea-ink)] sm:text-3xl"
          >
            {APP_NAME}
          </Link>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-start justify-center py-5 sm:items-center sm:py-8">
          <div className="grid w-full max-w-4xl overflow-hidden rounded-[26px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] shadow-[0_22px_60px_rgba(8,28,32,0.14)] backdrop-blur-xl sm:rounded-[32px] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="hidden border-r border-[var(--line)] p-8 lg:flex lg:flex-col lg:justify-between">
              <div>
                <h1 className="display-title text-5xl font-semibold leading-tight text-[var(--sea-ink)]">
                  Roll in. Build up. Stay in the game.
                </h1>
                <p className="mt-5 text-base leading-7 text-[var(--sea-ink-soft)]">
                  Play with friends, buy properties, build your position, and
                  stay alive till the final turn.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center mt-4">
                {['Roll', 'Buy', 'Build'].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-4 text-sm font-bold text-[var(--sea-ink)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-7">
              <div className="text-center">
                <h2 className="display-title text-3xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-4xl">
                  {title}
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--sea-ink-soft)]">
                  {subtitle}
                </p>
              </div>

              <div className="mt-4 sm:mt-5">{children}</div>

              {footer ? (
                <div className="mt-3 text-center text-sm font-semibold text-[var(--sea-ink-soft)] sm:mt-4">
                  {footer}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
