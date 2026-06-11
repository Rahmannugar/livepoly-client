import {
  CalendarDotsIcon,
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  MedalIcon,
  UserIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { APP_NAME } from '#/config/app.constants'
import { useCurrentUserProfile, useUserMatches } from '#/lib/users/useUsers'

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function formatPlacement(value: number | null) {
  if (value == null) {
    return 'No games yet'
  }

  return value.toFixed(1)
}

export function ProfilePage() {
  const profile = useCurrentUserProfile()
  const user = profile.data
  const matches = useUserMatches(user?.username)
  const recentMatch = matches.data?.items[0]

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

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-6 shadow-[0_22px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-18 w-18 shrink-0 place-items-center overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)]">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon weight="bold" className="h-9 w-9" />
                )}
              </span>
              <div className="min-w-0">
                <p className="app-kicker">Player profile</p>
                <h1 className="display-title mt-2 truncate text-5xl font-semibold leading-tight text-[var(--sea-ink)]">
                  {user?.username ?? 'Loading...'}
                </h1>
                <p className="mt-3 text-base font-semibold leading-7 text-[var(--sea-ink-soft)]">
                  {user?.bio ?? 'Ready to roll, buy, build, and climb.'}
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <ProfileStat
                label="Rating"
                value={user ? String(user.stats.rating) : '...'}
                icon={ChartLineUpIcon}
              />
              <ProfileStat
                label="Wins"
                value={user ? String(user.stats.gamesWon) : '...'}
                icon={MedalIcon}
              />
              <ProfileStat
                label="Games"
                value={user ? String(user.stats.gamesPlayed) : '...'}
                icon={ClockCounterClockwiseIcon}
              />
              <ProfileStat
                label="Avg. place"
                value={user ? formatPlacement(user.stats.averagePlacement) : '...'}
                icon={CalendarDotsIcon}
              />
            </div>
          </article>

          <article className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-6 shadow-[0_22px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-8">
            <p className="app-kicker">Latest activity</p>
            <h2 className="display-title mt-2 text-4xl font-semibold text-[var(--sea-ink)]">
              Your table record.
            </h2>

            <div className="mt-6 grid gap-3">
              <ProfileDetail
                label="Joined"
                value={user ? formatJoinedDate(user.createdAt) : '...'}
              />
              <ProfileDetail
                label="Last match"
                value={
                  recentMatch
                    ? `${recentMatch.won ? 'Won' : `Placed ${recentMatch.placement}`} in room ${recentMatch.roomCode}`
                    : 'No completed matches yet'
                }
              />
              <ProfileDetail
                label="Net worth"
                value={
                  recentMatch ? `W${recentMatch.finalNetWorth.toLocaleString()}` : '...'
                }
              />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/stats"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)]"
              >
                View stats
              </Link>
              <Link
                to="/matches"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] px-5 text-sm font-bold text-[var(--sea-ink)]"
              >
                Match history
              </Link>
            </div>
          </article>
        </section>
      </section>
    </main>
  )
}

type ProfileStatProps = {
  label: string
  value: string
  icon: typeof ChartLineUpIcon
}

function ProfileStat({ label, value, icon: Icon }: ProfileStatProps) {
  return (
    <div className="rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-4">
      <Icon weight="bold" className="h-5 w-5 text-[var(--sea-ink-soft)]" />
      <p className="app-kicker mt-3">{label}</p>
      <p className="mt-1 truncate text-xl font-black text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="app-kicker">{label}</p>
      <p className="mt-1 text-base font-bold leading-6 text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}
