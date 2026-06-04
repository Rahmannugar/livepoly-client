import { createFileRoute, Link } from '@tanstack/react-router'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { APP_NAME } from '#/config/app.constants'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-between">
        <header className="flex items-center justify-between gap-5">
          <Link
            to="/"
            className="display-title text-3xl font-semibold text-[var(--sea-ink)]"
          >
            {APP_NAME}
          </Link>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/login" className="app-link">
                Login
              </Link>
              <Link to="/register" className="app-link">
                Create account
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </header>

        <div className="max-w-3xl py-16 sm:py-24">
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
