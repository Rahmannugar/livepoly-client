import { Link } from '@tanstack/react-router'
import { APP_NAME } from '#/config/app.constants'
import { APP_ROUTES } from '#/config/routes.constants'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center px-5 py-8 sm:px-8">
      <section className="mx-auto w-full max-w-3xl">
        <p className="app-kicker">Wrong square</p>
        <h1 className="display-title mt-4 text-5xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
          This space is not on the board.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--sea-ink-soft)]">
          The page you tried to open does not exist. Head back to {APP_NAME} and
          continue from the starting square.
        </p>
        <Link
          to={APP_ROUTES.home}
          className="mt-8 inline-flex h-11 items-center rounded-full bg-[var(--sea-ink)] px-5 text-sm font-bold text-[var(--foam)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px]"
        >
          Back to home
        </Link>
      </section>
    </main>
  )
}
