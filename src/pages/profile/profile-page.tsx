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
  USER_AVATAR_ALLOWED_TYPES,
  USER_AVATAR_MAX_BYTES,
} from '#/lib/users/users.constants'
import {
  useAvatarUpload,
  useCurrentUserProfile,
  useUpdateCurrentUserProfile,
  useUserMatches,
} from '#/lib/users/useUsers'
import type { AvatarContentType } from '#/lib/users/users.types'

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

function isAvatarContentType(value: string): value is AvatarContentType {
  return USER_AVATAR_ALLOWED_TYPES.includes(value as AvatarContentType)
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
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      return
    }

    setUsername(user.username)
    setBio(user.bio ?? '')
  }, [user])

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl)
      }
    }
  }, [avatarPreviewUrl])

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
        onSuccess: () => {
          setIsEditingProfile(false)
          showToast({ kind: 'success', message: 'Profile updated.' })
        },
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

    if (!isAvatarContentType(file.type)) {
      showToast({ kind: 'error', message: 'Use a WebP, PNG, or JPG image.' })
      return
    }

    if (file.size > USER_AVATAR_MAX_BYTES) {
      showToast({
        kind: 'error',
        message: 'Avatar image must be 10MB or smaller.',
      })
      return
    }

    const nextPreviewUrl = URL.createObjectURL(file)
    setAvatarPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl)
      }

      return nextPreviewUrl
    })

    avatarUpload.mutate(file, {
      onSuccess: () =>
        showToast({
          kind: 'success',
          message: 'Profile picture updated.',
        }),
      onError: (error) => {
        setAvatarPreviewUrl(null)
        showToast({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Could not upload avatar.',
        })
      },
    })
  }

  const displayedAvatarUrl = avatarPreviewUrl ?? user?.avatarUrl

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
              <div className="grid w-fit justify-items-center gap-3">
                <button
                  type="button"
                  aria-label="Upload profile avatar"
                  className="group relative grid h-32 w-32 shrink-0 place-items-center overflow-hidden rounded-[34px] border border-[var(--line)] bg-[radial-gradient(circle_at_35%_20%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_42%),var(--surface)] text-[var(--sea-ink)] shadow-[0_18px_45px_rgba(8,28,32,0.14)] transition duration-300 hover:translate-y-[-2px] hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-70 sm:h-36 sm:w-36"
                  disabled={avatarUpload.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {displayedAvatarUrl ? (
                    <img
                      src={displayedAvatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon weight="bold" className="h-9 w-9" />
                  )}
                  {avatarUpload.isPending ? (
                    <span className="absolute inset-0 grid place-items-center bg-[rgba(8,28,32,0.48)] text-xs font-black uppercase tracking-[0.18em] text-white">
                      Uploading
                    </span>
                  ) : null}
                  <span className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--surface-strong)] px-3 py-2 text-[0.7rem] font-black text-[var(--sea-ink)] shadow-[0_12px_26px_rgba(8,28,32,0.14)] transition duration-300 sm:opacity-0 sm:group-hover:opacity-100">
                    <ImageSquareIcon weight="bold" className="h-4 w-4" />
                    Choose image
                  </span>
                </button>
                <button
                  type="button"
                  disabled={avatarUpload.isPending || !user}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-xs font-black text-[var(--sea-ink)] shadow-[0_10px_24px_rgba(8,28,32,0.08)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageSquareIcon weight="bold" className="h-4 w-4" />
                  {avatarUpload.isPending ? 'Uploading...' : 'Upload avatar'}
                </button>
                {!avatarPreviewUrl ? (
                  <p className="max-w-32 text-center text-[0.7rem] font-bold leading-5 text-[var(--sea-ink-soft)]">
                    WebP, PNG, or JPG
                  </p>
                ) : null}
              </div>
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
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="app-kicker">Player profile</p>
                    <h1 className="display-title mt-2 truncate text-3xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-4xl xl:text-[3.25rem]">
                      {user?.username ?? 'Loading...'}
                    </h1>
                  </div>
                  <button
                    type="button"
                    disabled={!user}
                    className="inline-flex h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[var(--primary)] px-5 text-sm font-black text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-36"
                    onClick={() => setIsEditingProfile((value) => !value)}
                  >
                    {isEditingProfile ? 'Close editor' : 'Edit profile'}
                  </button>
                </div>
                <p className="mt-3 text-base font-semibold leading-7 text-[var(--sea-ink-soft)]">
                  {user?.bio ?? 'Ready to roll, buy, build, and climb.'}
                </p>
              </div>
            </div>

            {isEditingProfile ? (
              <div className="mt-7 grid gap-4 rounded-[26px] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-[var(--sea-ink)]">
                    Username
                  </span>
                  <input
                    value={username}
                    maxLength={24}
                    onChange={(event) => setUsername(event.target.value)}
                    className="h-12 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 text-base font-bold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
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
                    className="resize-none rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-base font-semibold leading-7 text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
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
                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] px-5 text-sm font-black text-[var(--sea-ink)] transition hover:translate-y-[-1px]"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

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
