import {
  ClockCounterClockwiseIcon,
  CrownIcon,
  GameControllerIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { APP_NAME } from '#/config/app.constants'
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

export function MatchesPage() {
  const profile = useCurrentUserProfile()
  const matches = useUserMatches(profile.data?.username)
  const items = matches.data?.items ?? []

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

        <div className="max-w-3xl">
          <p className="app-kicker">Recent matches</p>
          <h1 className="display-title mt-2 text-5xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
            Games you finished.
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--sea-ink-soft)]">
            Review placements, net worth, rating changes, and match length.
          </p>
        </div>

        <section className="grid gap-3">
          {items.map((match) => (
            <article
              key={match.gameId}
              className="rounded-[28px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-5 shadow-[0_18px_45px_rgba(8,28,32,0.1)] backdrop-blur-xl"
            >
              <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--sea-ink)]">
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
                  value={
                    match.ratingDelta == null
                      ? 'No change'
                      : match.ratingDelta > 0
                        ? `+${match.ratingDelta}`
                        : String(match.ratingDelta)
                  }
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-[var(--sea-ink-soft)]">
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
            <article className="rounded-[28px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-6 text-center shadow-[0_18px_45px_rgba(8,28,32,0.1)] backdrop-blur-xl">
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
    <div className="min-w-28 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3">
      <p className="app-kicker">{label}</p>
      <p className="mt-1 truncate text-base font-black text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}
