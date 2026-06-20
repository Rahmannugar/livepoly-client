import { TrophyIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { AppPageHeader } from '#/components/common/app-page-header'
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
    <main className="min-h-screen px-4 py-4 sm:px-8 sm:py-6">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-5xl content-start gap-4 sm:min-h-[calc(100vh-3rem)] sm:content-center sm:gap-7">
        <AppPageHeader />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div className="max-w-3xl">
            <p className="app-kicker">Leaderboard</p>
            <h1 className="display-title mt-2 text-3xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
              The current table.
            </h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)] sm:mt-4 sm:text-lg sm:leading-8">
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
                    ? 'h-9 rounded-full bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)] sm:h-10 sm:px-5'
                    : 'h-9 rounded-full px-4 text-sm font-black text-[var(--sea-ink-soft)] sm:h-10 sm:px-5'
                }
                onClick={() => setPeriod(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <section className="rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-3 shadow-[0_18px_48px_rgba(8,28,32,0.1)] backdrop-blur-xl sm:rounded-[30px] sm:p-6">
          <div className="grid gap-2 sm:gap-3">
            {entries.map((entry) => (
              <article
                key={entry.userId}
                className="grid grid-cols-[auto_1fr] gap-3 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-4 sm:rounded-[24px] sm:p-4"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] text-base font-black text-[var(--sea-ink)] sm:h-12 sm:w-12 sm:rounded-2xl sm:text-lg">
                  {entry.rank <= 3 ? (
                    <TrophyIcon weight="bold" className="h-6 w-6" />
                  ) : (
                    entry.rank
                  )}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-base font-black text-[var(--sea-ink)] sm:text-lg">
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
              <p className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3 text-sm font-bold text-[var(--sea-ink-soft)] sm:rounded-[22px] sm:p-5">
                No leaderboard entries yet.
              </p>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  )
}
