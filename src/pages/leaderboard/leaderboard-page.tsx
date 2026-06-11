import { TrophyIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { APP_NAME } from '#/config/app.constants'
import type { LeaderboardPeriod } from '#/lib/leaderboards/leaderboards.constants'
import { useLeaderboard } from '#/lib/leaderboards/useLeaderboards'

const periods: Array<{ label: string; value: LeaderboardPeriod }> = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

export function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly')
  const leaderboard = useLeaderboard(period)
  const entries = leaderboard.data?.entries ?? []

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-5xl content-center gap-7">
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

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="app-kicker">Leaderboard</p>
            <h1 className="display-title mt-2 text-5xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
              The current table.
            </h1>
            <p className="mt-4 text-lg leading-8 text-[var(--sea-ink-soft)]">
              Ratings, wins, and placements across LivePoly games.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1">
            {periods.map((item) => (
              <button
                key={item.value}
                type="button"
                className={
                  item.value === period
                    ? 'h-10 rounded-full bg-[var(--primary)] px-5 text-sm font-black text-[var(--primary-foreground)]'
                    : 'h-10 rounded-full px-5 text-sm font-black text-[var(--sea-ink-soft)]'
                }
                onClick={() => setPeriod(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <section className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-4 shadow-[0_22px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-6">
          <div className="grid gap-3">
            {entries.map((entry) => (
              <article
                key={entry.userId}
                className="grid gap-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 sm:grid-cols-[auto_1fr_auto_auto]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] text-lg font-black text-[var(--sea-ink)]">
                  {entry.rank <= 3 ? (
                    <TrophyIcon weight="bold" className="h-6 w-6" />
                  ) : (
                    entry.rank
                  )}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-[var(--sea-ink)]">
                    {entry.username}
                  </p>
                  <p className="text-sm font-semibold text-[var(--sea-ink-soft)]">
                    {entry.gamesPlayed} games • {entry.wins} wins
                  </p>
                </div>

                <div>
                  <p className="app-kicker">Rating</p>
                  <p className="text-lg font-black text-[var(--sea-ink)]">
                    {entry.rating}
                  </p>
                </div>

                <div>
                  <p className="app-kicker">Avg. place</p>
                  <p className="text-lg font-black text-[var(--sea-ink)]">
                    {entry.averagePlacement == null
                      ? '...'
                      : entry.averagePlacement.toFixed(1)}
                  </p>
                </div>
              </article>
            ))}

            {!entries.length ? (
              <p className="rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 text-sm font-bold text-[var(--sea-ink-soft)]">
                No leaderboard entries yet.
              </p>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  )
}
