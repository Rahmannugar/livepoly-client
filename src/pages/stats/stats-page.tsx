import {
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  MedalIcon,
  TrophyIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { AppPageHeader } from '#/components/common/app-page-header'
import { useCurrentUserProfile, useUserMatches } from '#/lib/users/useUsers'

function formatDelta(value: number | null) {
  if (value == null || value === 0) {
    return 'No change'
  }

  return value > 0 ? `+${value}` : String(value)
}

function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60))
  return `${minutes}m`
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
    <main className="min-h-screen px-4 py-4 sm:px-8 sm:py-6">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl content-start gap-4 sm:min-h-[calc(100vh-3rem)] sm:content-center sm:gap-7">
        <AppPageHeader />

        <div className="max-w-3xl">
          <p className="app-kicker">Stats</p>
          <h1 className="display-title mt-1 text-2xl font-semibold leading-tight text-[var(--sea-ink)] sm:mt-2 sm:text-6xl">
            Track your run.
          </h1>
          <p className="mt-1.5 text-sm font-semibold leading-5 text-[var(--sea-ink-soft)] sm:mt-4 sm:text-lg sm:leading-8">
            Wins, placements, rating movement, and the games behind them.
          </p>
        </div>

        <section className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
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

        <section className="rounded-[20px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-3 shadow-[0_16px_40px_rgba(8,28,32,0.09)] backdrop-blur-xl sm:rounded-[30px] sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="app-kicker">Recent form</p>
              <h2 className="display-title mt-1 text-2xl font-semibold text-[var(--sea-ink)] sm:text-4xl">
                Latest results.
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {recentMatches.slice(0, 5).map((match) => (
              <article
                key={match.gameId}
                className="group relative grid gap-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--primary)] focus-within:border-[var(--primary)] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-3 sm:rounded-[22px] sm:p-4"
              >
                <Link
                  to="/matches/$gameId"
                  params={{ gameId: match.gameId }}
                  aria-label={`Open match details for room ${match.roomCode}`}
                  className="absolute inset-0 rounded-[inherit] focus:outline-none"
                />
                <div className="pointer-events-none min-w-0">
                  <p className="truncate text-base font-black text-[var(--sea-ink)]">
                    Room {match.roomCode}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs font-bold text-[var(--sea-ink-soft)]">
                    <span>Placed {match.placement} of {match.playerCount}</span>
                    <span>{formatMatchDate(match.completedAt)}</span>
                    <span>{formatDuration(match.durationSeconds)}</span>
                    <span>{match.endReason.replaceAll('_', ' ')}</span>
                  </div>
                </div>
                <p className="pointer-events-none text-sm font-black text-[var(--sea-ink)]">
                  W{match.finalNetWorth.toLocaleString()}
                </p>
                <p
                  className={
                    match.ratingDelta && match.ratingDelta > 0
                      ? 'pointer-events-none text-sm font-black text-[var(--primary)]'
                      : 'pointer-events-none text-sm font-black text-[var(--sea-ink-soft)]'
                  }
                >
                  {formatDelta(match.ratingDelta)}
                </p>
              </article>
            ))}

            {!recentMatches.length ? (
              <p className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3 text-sm font-bold text-[var(--sea-ink-soft)] sm:rounded-[22px] sm:p-4">
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
    <article className="rounded-[18px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-2.5 shadow-[0_12px_28px_rgba(8,28,32,0.08)] backdrop-blur-xl sm:rounded-[26px] sm:p-5">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--surface)] text-[var(--sea-ink)] sm:h-11 sm:w-11 sm:rounded-2xl">
        <Icon weight="bold" className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
      </span>
      <p className="app-kicker mt-2 sm:mt-5">{label}</p>
      <p className="mt-0.5 truncate text-xl font-black text-[var(--sea-ink)] sm:mt-1 sm:text-3xl">
        {value}
      </p>
    </article>
  )
}
