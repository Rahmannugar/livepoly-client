import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { APP_NAME } from '#/config/app.constants'

export function NotFoundPage() {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-8 sm:py-6">
      <header className="mx-auto flex w-full max-w-3xl justify-end">
        <ThemeToggle />
      </header>

      <div className="flex min-h-[calc(100vh-4.5rem)] items-center sm:min-h-[calc(100vh-5.5rem)]">
        <section className="mx-auto w-full max-w-3xl">
          <p className="app-kicker">Wrong square</p>

          <h1 className="display-title mt-3 text-3xl font-semibold leading-tight text-[var(--sea-ink)] sm:mt-4 sm:text-6xl">
            This space is not on the board.
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--sea-ink-soft)] sm:mt-6 sm:text-lg sm:leading-8">
            The page you tried to open does not exist. Head back to {APP_NAME} and
            continue from the starting square.
          </p>

          <Link
            to="/"
            className="mt-5 inline-flex h-10 items-center rounded-full bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] sm:mt-8 sm:h-11 sm:px-5"
          >
            Back to home
          </Link>
        </section>
      </div>
    </main>
  )
}
