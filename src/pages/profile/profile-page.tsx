import {
  CalendarDotsIcon,
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  ImageSquareIcon,
  MedalIcon,
  UserIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '#/components/common/toast'
import { APP_NAME } from '#/config/app.constants'
import {
  useAvatarUpload,
  useCurrentUserProfile,
  useUpdateCurrentUserProfile,
  useUserMatches,
} from '#/lib/users/useUsers'

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
  const updateProfile = useUpdateCurrentUserProfile()
  const avatarUpload = useAvatarUpload()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (!user) {
      return
    }

    setUsername(user.username)
    setBio(user.bio ?? '')
  }, [user])

  function handleSaveProfile() {
    const normalizedUsername = username.trim().toLowerCase()
    const normalizedBio = bio.trim()

    if (!normalizedUsername) {
      showToast({ kind: 'error', message: 'Username is required.' })
      return
    }

    updateProfile.mutate(
      {
        username: normalizedUsername,
        bio: normalizedBio || null,
      },
      {
        onSuccess: () =>
          showToast({ kind: 'success', message: 'Profile updated.' }),
        onError: (error) =>
          showToast({
            kind: 'error',
            message:
              error instanceof Error ? error.message : 'Could not update profile.',
          }),
      },
    )
  }

  function handleAvatarFile(file: File | undefined) {
    if (!file) {
      return
    }

    avatarUpload.mutate(file, {
      onSuccess: () =>
        showToast({
          kind: 'success',
          message: 'Avatar uploaded. Verification will finish shortly.',
        }),
      onError: (error) =>
        showToast({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Could not upload avatar.',
        }),
    })
  }

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
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <button
                type="button"
                className="group relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)]"
                disabled={avatarUpload.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon weight="bold" className="h-9 w-9" />
                )}
                <span className="absolute inset-x-2 bottom-2 inline-flex items-center justify-center gap-1 rounded-full bg-[var(--surface-strong)] px-2 py-1 text-[0.65rem] font-black text-[var(--sea-ink)] opacity-0 transition group-hover:opacity-100">
                  <ImageSquareIcon weight="bold" className="h-3.5 w-3.5" />
                  Change
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/webp,image/jpeg,image/png"
                className="hidden"
                onChange={(event) => {
                  handleAvatarFile(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
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

            <div className="mt-7 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-black text-[var(--sea-ink)]">
                  Username
                </span>
                <input
                  value={username}
                  maxLength={24}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-12 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 text-base font-bold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-[var(--sea-ink)]">
                  Bio
                </span>
                <textarea
                  value={bio}
                  maxLength={160}
                  rows={4}
                  onChange={(event) => setBio(event.target.value)}
                  className="resize-none rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-base font-semibold leading-7 text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
                />
              </label>

              <button
                type="button"
                disabled={
                  updateProfile.isPending || profile.isLoading || !user
                }
                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-black text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSaveProfile}
              >
                {updateProfile.isPending ? 'Saving...' : 'Save profile'}
              </button>
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
