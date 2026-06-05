import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { APP_NAME } from '#/config/app.constants'

type AuthLayoutProps = {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

export function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen px-5 py-5 sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center">
          <Link
            to="/"
            className="display-title text-2xl font-semibold text-[var(--sea-ink)] sm:text-3xl"
          >
            {APP_NAME}
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="grid w-full max-w-4xl overflow-hidden rounded-[32px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] shadow-[0_28px_80px_rgba(8,28,32,0.16)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
            <div className="hidden border-r border-[var(--line)] p-8 lg:flex lg:flex-col lg:justify-between">
              <div>
                <h1 className="display-title text-5xl font-semibold leading-tight text-[var(--sea-ink)]">
                  Roll in. Build up. Stay in the game.
                </h1>
                <p className="mt-5 text-base leading-7 text-[var(--sea-ink-soft)]">
                  Join rooms, make your moves, grow your net worth, and outlast
                  the table.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
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

            <div className="p-5 sm:p-7">
              <div className="text-center">
                <h2 className="display-title text-4xl font-semibold leading-tight text-[var(--sea-ink)]">
                  {title}
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--sea-ink-soft)]">
                  {subtitle}
                </p>
              </div>

              <div className="mt-5">{children}</div>

              <div className="mt-4 text-center text-sm font-semibold text-[var(--sea-ink-soft)]">
                {footer}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
