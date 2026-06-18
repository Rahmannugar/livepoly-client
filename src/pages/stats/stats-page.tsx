import {
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  MedalIcon,
  TrophyIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { APP_NAME } from '#/config/app.constants'
import { useCurrentUserProfile, useUserMatches } from '#/lib/users/useUsers'

function formatDelta(value: number | null) {
  if (value == null) {
    return 'No change'
  }

  return value > 0 ? `+${value}` : String(value)
}

export function StatsPage() {
  const profile = useCurrentUserProfile()
  const user = profile.data
  const matches = useUserMatches(user?.username)
  const recentMatches = matches.data?.items ?? []
  const winRate =
    user && user.stats.gamesPlayed > 0
      ? Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100)
      : 0

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl content-center gap-7">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="display-title text-3xl font-semibold text-[var(--sea-ink)] sm:text-4xl"
          >
            {APP_NAME}
          </Link>
          <Link to="/" className="app-link text-sm">
            Home
          </Link>
        </header>

        <div className="max-w-3xl">
          <p className="app-kicker">Stats</p>
          <h1 className="display-title mt-2 text-5xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
            Track your run.
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--sea-ink-soft)]">
            Wins, placements, rating movement, and the games behind them.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Rating"
            value={user ? String(user.stats.rating) : '...'}
            icon={ChartLineUpIcon}
          />
          <StatCard
            label="Win rate"
            value={`${winRate}%`}
            icon={TrophyIcon}
          />
          <StatCard
            label="Games played"
            value={user ? String(user.stats.gamesPlayed) : '...'}
            icon={ClockCounterClockwiseIcon}
          />
          <StatCard
            label="Average place"
            value={
              user?.stats.averagePlacement == null
                ? 'No games'
                : user.stats.averagePlacement.toFixed(1)
            }
            icon={MedalIcon}
          />
        </section>

        <section className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-5 shadow-[0_22px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="app-kicker">Recent form</p>
              <h2 className="display-title mt-1 text-4xl font-semibold text-[var(--sea-ink)]">
                Latest results.
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {recentMatches.slice(0, 5).map((match) => (
              <article
                key={match.gameId}
                className="grid gap-3 rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-4 sm:grid-cols-[1fr_auto_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-black text-[var(--sea-ink)]">
                    Room {match.roomCode}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--sea-ink-soft)]">
                    Placed {match.placement} of {match.playerCount}
                  </p>
                </div>
                <p className="text-sm font-black text-[var(--sea-ink)]">
                  W{match.finalNetWorth.toLocaleString()}
                </p>
                <p
                  className={
                    match.ratingDelta && match.ratingDelta > 0
                      ? 'text-sm font-black text-[var(--primary)]'
                      : 'text-sm font-black text-[var(--sea-ink-soft)]'
                  }
                >
                  {formatDelta(match.ratingDelta)}
                </p>
              </article>
            ))}

            {!recentMatches.length ? (
              <p className="rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-bold text-[var(--sea-ink-soft)]">
                Complete a game and your results will appear here.
              </p>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  )
}

type StatCardProps = {
  label: string
  value: string
  icon: typeof ChartLineUpIcon
}

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <article className="rounded-[26px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-5 shadow-[0_18px_45px_rgba(8,28,32,0.1)] backdrop-blur-xl">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--sea-ink)]">
        <Icon weight="bold" className="h-5 w-5" />
      </span>
      <p className="app-kicker mt-5">{label}</p>
      <p className="mt-1 truncate text-3xl font-black text-[var(--sea-ink)]">
        {value}
      </p>
    </article>
  )
}
