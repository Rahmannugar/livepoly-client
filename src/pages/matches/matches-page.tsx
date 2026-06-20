import {
  ClockCounterClockwiseIcon,
  CrownIcon,
  GameControllerIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { AppPageHeader } from '#/components/common/app-page-header'
import { useCurrentUserProfile, useUserMatches } from '#/lib/users/useUsers'

function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60))
  return `${minutes}m`
}

function formatRatingDelta(value: number | null) {
  if (value == null || value === 0) {
    return 'No change'
  }

  return value > 0 ? `+${value}` : String(value)
}

export function MatchesPage() {
  const profile = useCurrentUserProfile()
  const matches = useUserMatches(profile.data?.username)
  const items = matches.data?.items ?? []

  return (
    <main className="min-h-screen px-4 py-4 sm:px-8 sm:py-6">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-5xl content-start gap-4 sm:min-h-[calc(100vh-3rem)] sm:content-center sm:gap-7">
        <AppPageHeader />

        <div className="max-w-3xl">
          <p className="app-kicker">Recent matches</p>
          <h1 className="display-title mt-2 text-3xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
            Games you finished.
          </h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)] sm:mt-4 sm:text-lg sm:leading-8">
            Review placements, net worth, rating changes, and match length.
          </p>
        </div>

        <section className="grid gap-3">
          {items.map((match) => (
            <article
              key={match.gameId}
              className="group relative rounded-[22px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-3 text-left shadow-[0_14px_34px_rgba(8,28,32,0.09)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--primary)] focus-within:border-[var(--primary)] sm:rounded-[28px] sm:p-5"
            >
              <Link
                to="/matches/$gameId"
                params={{ gameId: match.gameId }}
                aria-label={`Open match details for room ${match.roomCode}`}
                className="absolute inset-0 rounded-[inherit] focus:outline-none"
              />
              <div className="pointer-events-none grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center lg:gap-4">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--sea-ink)] sm:h-11 sm:w-11 sm:rounded-2xl">
                      {match.won ? (
                        <CrownIcon weight="bold" className="h-5 w-5" />
                      ) : (
                        <GameControllerIcon weight="bold" className="h-5 w-5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black text-[var(--sea-ink)]">
                        Room {match.roomCode}
                      </p>
                      <p className="text-sm font-semibold text-[var(--sea-ink-soft)]">
                        {formatMatchDate(match.completedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <MatchValue
                  label="Placement"
                  value={`${match.placement}/${match.playerCount}`}
                />
                <MatchValue
                  label="Net worth"
                  value={`W${match.finalNetWorth.toLocaleString()}`}
                />
                <MatchValue
                  label="Rating"
                  value={formatRatingDelta(match.ratingDelta)}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-[var(--sea-ink-soft)] sm:mt-4">
                <span className="rounded-full border border-[var(--line)] px-3 py-1.5">
                  {match.mode}
                </span>
                <span className="rounded-full border border-[var(--line)] px-3 py-1.5">
                  {formatDuration(match.durationSeconds)}
                </span>
                <span className="rounded-full border border-[var(--line)] px-3 py-1.5">
                  {match.endReason.replaceAll('_', ' ')}
                </span>
              </div>
            </article>
          ))}

          {!items.length ? (
            <article className="rounded-[22px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-4 text-center shadow-[0_14px_34px_rgba(8,28,32,0.09)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
              <ClockCounterClockwiseIcon
                weight="bold"
                className="mx-auto h-8 w-8 text-[var(--sea-ink-soft)]"
              />
              <p className="mt-4 text-base font-black text-[var(--sea-ink)]">
                No completed games yet.
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--sea-ink-soft)]">
                Finish a game and your result history will show here.
              </p>
            </article>
          ) : null}
        </section>
      </section>
    </main>
  )
}

function MatchValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-2.5 sm:min-w-28 sm:rounded-[18px] sm:p-3">
      <p className="app-kicker">{label}</p>
      <p className="mt-1 truncate text-base font-black text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}
