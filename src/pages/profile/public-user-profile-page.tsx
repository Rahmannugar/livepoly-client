import {
  CalendarDotsIcon,
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  MedalIcon,
  UserIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { APP_NAME } from '#/config/app.constants'
import { useUserMatches, useUserProfile } from '#/lib/users/useUsers'

type PublicUserProfilePageProps = {
  username: string
}

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

function formatDelta(value: number | null) {
  if (value == null) {
    return 'No change'
  }

  return value > 0 ? `+${value}` : String(value)
}

export function PublicUserProfilePage({ username }: PublicUserProfilePageProps) {
  const profile = useUserProfile(username)
  const user = profile.data
  const matches = useUserMatches(user?.username)
  const recentMatches = matches.data?.items ?? []

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

        {profile.isLoading ? (
          <StatePanel title="Loading player..." />
        ) : null}

        {profile.isError ? (
          <StatePanel title="Player not found." detail="Check the username and try again." />
        ) : null}

        {user ? (
          <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-6 shadow-[0_22px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="grid justify-items-center gap-3">
                  <div className="relative rounded-full bg-[linear-gradient(145deg,color-mix(in_oklab,var(--primary)_68%,white),color-mix(in_oklab,var(--sea-ink)_48%,transparent))] p-1 shadow-[0_18px_45px_rgba(8,28,32,0.18)]">
                    <div className="rounded-full bg-[var(--surface-strong)] p-1">
                      <div className="grid h-[8.5rem] w-[8.5rem] place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_20%,color-mix(in_oklab,var(--primary)_24%,transparent),transparent_44%),var(--surface)] text-[var(--sea-ink)] sm:h-36 sm:w-36">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon weight="bold" className="h-10 w-10" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="app-kicker">Player profile</p>
                  <h1 className="display-title mt-2 truncate text-4xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-5xl">
                    {user.username}
                  </h1>
                  <p className="mt-3 text-base font-semibold leading-7 text-[var(--sea-ink-soft)]">
                    {user.bio ?? 'Ready to roll, buy, build, and climb.'}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <ProfileStat
                  label="Rating"
                  value={String(user.stats.rating)}
                  icon={ChartLineUpIcon}
                />
                <ProfileStat
                  label="Wins"
                  value={String(user.stats.gamesWon)}
                  icon={MedalIcon}
                />
                <ProfileStat
                  label="Games"
                  value={String(user.stats.gamesPlayed)}
                  icon={ClockCounterClockwiseIcon}
                />
                <ProfileStat
                  label="Avg. place"
                  value={formatPlacement(user.stats.averagePlacement)}
                  icon={CalendarDotsIcon}
                />
              </div>
            </article>

            <article className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-6 shadow-[0_22px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-8">
              <p className="app-kicker">Table record</p>
              <h2 className="display-title mt-2 text-4xl font-semibold text-[var(--sea-ink)]">
                Latest results.
              </h2>

              <div className="mt-6 grid gap-3">
                <ProfileDetail label="Joined" value={formatJoinedDate(user.createdAt)} />
                {recentMatches.slice(0, 4).map((match) => (
                  <article
                    key={match.gameId}
                    className="grid gap-2 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4 sm:grid-cols-[1fr_auto]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-[var(--sea-ink)]">
                        Room {match.roomCode}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--sea-ink-soft)]">
                        Placed {match.placement} of {match.playerCount}
                      </p>
                    </div>
                    <div className="text-sm font-black text-[var(--sea-ink)] sm:text-right">
                      <p>W{match.finalNetWorth.toLocaleString()}</p>
                      <p className="text-[var(--sea-ink-soft)]">
                        {formatDelta(match.ratingDelta)}
                      </p>
                    </div>
                  </article>
                ))}
                {!recentMatches.length ? (
                  <ProfileDetail label="Matches" value="No completed matches yet" />
                ) : null}
              </div>
            </article>
          </section>
        ) : null}
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

function StatePanel({ title, detail }: { title: string; detail?: string }) {
  return (
    <section className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-6 text-center shadow-[0_22px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl">
      <h1 className="display-title text-4xl font-semibold text-[var(--sea-ink)]">
        {title}
      </h1>
      {detail ? (
        <p className="mt-3 text-base font-semibold text-[var(--sea-ink-soft)]">
          {detail}
        </p>
      ) : null}
    </section>
  )
}
