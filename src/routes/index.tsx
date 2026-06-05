import { ListIcon, XIcon } from '@phosphor-icons/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { APP_NAME } from '#/config/app.constants'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    document.body.classList.add('landing-page')

    return () => {
      document.body.classList.remove('landing-page')
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="relative z-20 flex items-center justify-between gap-5">
          <Link
            to="/"
            className="display-title text-3xl font-semibold text-[var(--sea-ink)] sm:text-4xl"
          >
            {APP_NAME}
          </Link>

          <div className="hidden items-center gap-5 sm:flex">
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/auth/login" className="app-link">
                Login
              </Link>
              <Link to="/auth/register" className="app-link">
                Create account
              </Link>
            </nav>
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            className="relative z-30 grid h-11 w-11 place-items-center text-[var(--sea-ink)] transition hover:scale-[1.05] sm:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? (
              <XIcon weight="bold" className="h-7 w-7" />
            ) : (
              <ListIcon weight="bold" className="h-7 w-7" />
            )}
          </button>
        </header>

        <div
          className={[
            'fixed inset-0 z-10 flex flex-col px-5 py-6 transition sm:hidden',
            isMenuOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0',
          ].join(' ')}
          aria-hidden={!isMenuOpen}
        >
          <div
            className={[
              'absolute inset-0 bg-[color-mix(in_oklab,var(--bg-base)_90%,transparent)] backdrop-blur-xl transition duration-500',
              isMenuOpen ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          />

          <div
            className={[
              'relative mt-24 flex flex-1 flex-col justify-between transition duration-500 ease-out',
              isMenuOpen
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0',
            ].join(' ')}
          >
            <nav className="flex flex-col gap-5">
              <Link
                to="/auth/login"
                className="display-title text-5xl font-semibold text-[var(--sea-ink)]"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="display-title text-5xl font-semibold text-[var(--sea-ink)]"
                onClick={() => setIsMenuOpen(false)}
              >
                Create account
              </Link>
            </nav>

            <div className="mb-6 flex items-center justify-between border-t border-[var(--line)] pt-6">
              <span className="text-sm font-bold text-[var(--sea-ink-soft)]">
                Day / night
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="max-w-3xl pt-28 sm:pt-32 md:pt-40">
          <p className="app-kicker">Online monopoly-style board game</p>
          <h1 className="display-title mt-4 text-5xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl md:text-7xl">
            Roll, buy, build, and outlast the table.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--sea-ink-soft)]">
            Play property-trading matches with friends, manage your money, make
            sharp moves, and climb the leaderboard one room at a time.
          </p>
        </div>
      </section>
    </main>
  )
}
