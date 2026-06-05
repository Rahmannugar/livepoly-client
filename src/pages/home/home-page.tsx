import {
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  DoorOpenIcon,
  MedalIcon,
  PlusIcon,
  SignOutIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { APP_NAME } from '#/config/app.constants'
import { useToast } from '#/components/common/toast'
import { useAuth } from '#/lib/auth/useAuth'

const homeActions = [
  {
    title: 'Create room',
    description: 'Start a table and invite friends to play.',
    icon: PlusIcon,
  },
  {
    title: 'Join room',
    description: 'Enter a room code and jump into a match.',
    icon: DoorOpenIcon,
  },
  {
    title: 'Friends',
    description: 'Find players, manage requests, and build your table circle.',
    icon: UsersIcon,
  },
  {
    title: 'Stats',
    description: 'Track wins, placements, rating, and your match history.',
    icon: ChartLineUpIcon,
  },
  {
    title: 'Leaderboard',
    description: 'See how your current rating stacks up.',
    icon: MedalIcon,
  },
  {
    title: 'Recent matches',
    description: 'Review finished games and results.',
    icon: ClockCounterClockwiseIcon,
  },
] as const

export function HomePage() {
  const auth = useAuth()
  const { showToast } = useToast()
  const user = auth.currentUser.data
  const displayName = user?.username ?? 'player'

  function handleLogout() {
    auth.logout.mutate(undefined, {
      onSuccess: () => {
        showToast({ kind: 'success', message: 'You have signed out.' })
      },
      onError: (error) => {
        showToast({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Could not sign you out.',
        })
      },
    })
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="display-title text-3xl font-semibold text-[var(--sea-ink)] sm:text-4xl"
          >
            {APP_NAME}
          </Link>

          <div className="flex items-center gap-3 pr-16 sm:pr-20">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[var(--sea-ink)]">
                {displayName}
              </p>
              <p className="text-xs font-semibold text-[var(--sea-ink-soft)]">
                Player
              </p>
            </div>

            <div
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-sm font-black uppercase text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)]"
            >
              {displayName.slice(0, 1)}
            </div>

            <button
              type="button"
              aria-label="Sign out"
              disabled={auth.logout.isPending}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleLogout}
            >
              <SignOutIcon weight="bold" className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="grid flex-1 content-center gap-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <h1 className="display-title text-5xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
              Welcome back, {displayName}.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--sea-ink-soft)]">
              Create a room, join a table, or check how your last games played
              out.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {homeActions.map((action) => (
              <button
                key={action.title}
                type="button"
                className="group min-h-32 rounded-[26px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-5 text-left shadow-[0_18px_45px_rgba(8,28,32,0.1)] backdrop-blur-xl transition hover:translate-y-[-2px] hover:border-[var(--primary)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_10px_24px_rgba(8,28,32,0.1)] transition group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)]">
                  <action.icon weight="bold" className="h-5 w-5" />
                </span>
                <span className="mt-4 block text-base font-black text-[var(--sea-ink)]">
                  {action.title}
                </span>
                <span className="mt-1 block text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                  {action.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
