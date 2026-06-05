import { Link } from '@tanstack/react-router'
import { APP_NAME } from '#/config/app.constants'
import { useAuth } from '#/lib/auth/useAuth'

export function AppHomePage() {
  const auth = useAuth()
  const user = auth.currentUser.data

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-5">
          <Link
            to="/"
            className="display-title text-3xl font-semibold text-[var(--sea-ink)] sm:text-4xl"
          >
            {APP_NAME}
          </Link>
        </header>

        <div className="flex flex-1 items-center py-16">
          <div className="max-w-3xl">
            <p className="app-kicker">Game lobby</p>
            <h1 className="display-title mt-4 text-5xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
              Welcome{user?.username ? `, ${user.username}` : ''}.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--sea-ink-soft)]">
              Your rooms, friends, match history, and live games will start
              here.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
