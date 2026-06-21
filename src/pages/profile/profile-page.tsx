import {
  CalendarDotsIcon,
  CameraIcon,
  CheckIcon,
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  MedalIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
  WarningIcon,
  XIcon,
} from '@phosphor-icons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { AppPageHeader } from '#/components/common/app-page-header'
import { useToast } from '#/components/common/toast'
import {
  USER_AVATAR_ALLOWED_TYPES,
  USER_AVATAR_MAX_BYTES,
} from '#/lib/users/users.constants'
import {
  useAvatarUpload,
  useCurrentUserProfile,
  useDeleteCurrentUser,
  useUpdateCurrentUserProfile,
  useUserMatches,
} from '#/lib/users/useUsers'
import type { AvatarContentType } from '#/lib/users/users.types'
import { useAuth } from '#/lib/auth/useAuth'

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
  const deleteUser = useDeleteCurrentUser()
  const auth = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  const [avatarPreviewFile, setAvatarPreviewFile] = useState<File | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const isAdmin = auth.currentUser.data?.role === 'admin'

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

  useEffect(() => {
    if (!isAdmin) {
      return
    }

    setIsDeleteDialogOpen(false)
    setDeleteConfirmation('')
  }, [isAdmin])

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
              error instanceof Error
                ? error.message
                : 'Could not update profile.',
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
    setAvatarPreviewFile(file)
  }

  function confirmAvatarUpload() {
    if (!avatarPreviewFile) {
      return
    }

    avatarUpload.mutate(avatarPreviewFile, {
      onSuccess: () => {
        setAvatarPreviewFile(null)
        showToast({
          kind: 'success',
          message: 'Profile picture updated.',
        })
      },
      onError: (error) => {
        clearAvatarPreview()
        showToast({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Could not upload avatar.',
        })
      },
    })
  }

  function clearAvatarPreview() {
    setAvatarPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl)
      }

      return null
    })
    setAvatarPreviewFile(null)
  }

  const displayedAvatarUrl = avatarPreviewUrl ?? user?.avatarUrl
  const avatarActionLabel = displayedAvatarUrl ? 'Change photo' : 'Add photo'
  const canDelete =
    !isAdmin && Boolean(user?.username) && deleteConfirmation === user?.username

  function handleDeleteAccount() {
    if (!canDelete) return

    deleteUser.mutate(undefined, {
      onSuccess: () => {
        auth.clearAuthSession()
        void navigate({ to: '/account-deleted', replace: true })
      },
      onError: (error) => {
        showToast({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Could not delete account.',
        })
      },
    })
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-8 sm:py-6">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl content-start gap-4 sm:min-h-[calc(100vh-3rem)] sm:content-center sm:gap-7">
        <AppPageHeader />

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-4 shadow-[0_18px_48px_rgba(8,28,32,0.1)] backdrop-blur-xl sm:rounded-[30px] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
              <div className="grid w-full justify-items-center gap-3 sm:w-44">
                <div className="relative rounded-full bg-[linear-gradient(145deg,color-mix(in_oklab,var(--primary)_68%,white),color-mix(in_oklab,var(--sea-ink)_48%,transparent))] p-1 shadow-[0_18px_45px_rgba(8,28,32,0.18)]">
                  <div className="rounded-full bg-[var(--surface-strong)] p-1">
                    <div className="relative grid h-[8.5rem] w-[8.5rem] place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_20%,color-mix(in_oklab,var(--primary)_24%,transparent),transparent_44%),var(--surface)] text-[var(--sea-ink)] sm:h-36 sm:w-36">
                      {displayedAvatarUrl ? (
                        <img
                          src={displayedAvatarUrl}
                          alt=""
                          className={`h-full w-full object-cover transition duration-300 ${
                            avatarUpload.isPending ? 'scale-105 blur-[1px]' : ''
                          }`}
                        />
                      ) : (
                        <UserIcon weight="bold" className="h-10 w-10" />
                      )}
                      {avatarUpload.isPending ? (
                        <span className="absolute inset-0 grid place-items-center bg-[rgba(8,28,32,0.5)] text-[0.7rem] font-black uppercase tracking-[0.18em] text-white">
                          Uploading
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={avatarActionLabel}
                    title={avatarActionLabel}
                    className="absolute bottom-2 right-2 grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_14px_28px_rgba(8,28,32,0.22)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={avatarUpload.isPending}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CameraIcon weight="bold" className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={avatarUpload.isPending}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-xs font-black text-[var(--sea-ink)] shadow-[0_10px_24px_rgba(8,28,32,0.08)] transition hover:translate-y-[-1px] hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CameraIcon weight="bold" className="h-4 w-4" />
                  {avatarActionLabel}
                </button>
                {avatarPreviewFile ? (
                  <div className="w-full rounded-[20px] border border-[color-mix(in_oklab,var(--primary)_55%,var(--line))] bg-[color-mix(in_oklab,var(--primary)_12%,var(--surface))] p-3">
                    <p className="text-center text-[0.7rem] font-black uppercase tracking-[0.14em] text-[var(--sea-ink)]">
                      New photo selected
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={avatarUpload.isPending}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--primary)] px-3 text-xs font-black text-[var(--primary-foreground)] shadow-[0_12px_26px_rgba(8,28,32,0.14)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={confirmAvatarUpload}
                      >
                        <CheckIcon weight="bold" className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        type="button"
                        disabled={avatarUpload.isPending}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-black text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={clearAvatarPreview}
                      >
                        <XIcon weight="bold" className="h-4 w-4" />
                        Undo
                      </button>
                    </div>
                  </div>
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
                    <h1 className="display-title mt-2 truncate text-2xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-3xl xl:text-4xl">
                      {user?.username ?? 'Loading...'}
                    </h1>
                  </div>
                  <button
                    type="button"
                    disabled={!user}
                    className="inline-flex h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-32"
                    onClick={() => setIsEditingProfile((value) => !value)}
                  >
                    {isEditingProfile ? 'Close editor' : 'Edit profile'}
                  </button>
                </div>
                <div className="mt-2 sm:mt-3">
                  <p className="app-kicker">Bio</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)] sm:text-base sm:leading-7">
                    {user?.bio ?? 'Ready to roll, buy, build, and climb.'}
                  </p>
                </div>
              </div>
            </div>

            {isEditingProfile ? (
              <div className="mt-5 grid gap-4 rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:mt-7 sm:rounded-[26px] sm:p-5">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-[var(--sea-ink)]">
                    Username
                  </span>
                  <input
                    value={username}
                    maxLength={24}
                    onChange={(event) => setUsername(event.target.value)}
                    className="h-11 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 text-base font-bold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)] sm:h-12"
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

                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <button
                    type="button"
                    disabled={
                      updateProfile.isPending || profile.isLoading || !user
                    }
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-black text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60 sm:h-12"
                    onClick={handleSaveProfile}
                  >
                    {updateProfile.isPending ? 'Saving...' : 'Save profile'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] px-5 text-sm font-black text-[var(--sea-ink)] transition hover:translate-y-[-1px] sm:h-12"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7">
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
                value={
                  user ? formatPlacement(user.stats.averagePlacement) : '...'
                }
                icon={CalendarDotsIcon}
              />
            </div>
          </article>

          <article className="rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-4 shadow-[0_18px_48px_rgba(8,28,32,0.1)] backdrop-blur-xl sm:rounded-[30px] sm:p-8">
            <p className="app-kicker">Latest activity</p>
            <h2 className="display-title mt-2 text-3xl font-semibold text-[var(--sea-ink)] sm:text-4xl">
              Your table record.
            </h2>

            <div className="mt-4 grid gap-2 sm:mt-6 sm:gap-3">
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
                  recentMatch
                    ? `W${recentMatch.finalNetWorth.toLocaleString()}`
                    : '...'
                }
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3 sm:mt-7">
              <Link
                to="/stats"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)]"
              >
                View stats
              </Link>
            </div>
          </article>
        </section>

        <section className="grid gap-5 border-y border-[var(--line)] py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:py-8">
          <div>
            <p className="app-kicker">Account controls</p>
            <h2 className="display-title mt-2 text-2xl font-semibold text-[var(--sea-ink)] sm:text-3xl">
              Manage your LivePoly account.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 sm:justify-end">
            {isAdmin ? (
              <Link
                to="/admin/users"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-black text-[var(--sea-ink)]"
              >
                <ShieldCheckIcon weight="bold" className="h-5 w-5" />
                Admin users
              </Link>
            ) : null}
            {!isAdmin ? (
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-400/40 bg-red-400/10 px-5 text-sm font-black text-red-700 dark:text-red-200"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <TrashIcon weight="bold" className="h-5 w-5" />
                Delete account
              </button>
            ) : null}
          </div>
        </section>
      </section>

      {!isAdmin && isDeleteDialogOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center pt-12 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <button
            type="button"
            aria-label="Close delete account dialog"
            className="absolute inset-0 cursor-default bg-[rgba(4,12,15,0.62)]"
            onClick={() => setIsDeleteDialogOpen(false)}
          />
          <section className="relative w-full max-w-md rounded-t-[24px] border border-b-0 border-[var(--line)] bg-[var(--bg-base)] p-5 shadow-[0_28px_90px_rgba(4,12,15,0.32)] sm:rounded-[24px] sm:border sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-500/15 text-red-600 dark:text-red-200">
                <WarningIcon weight="bold" className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  id="delete-account-title"
                  className="display-title text-2xl font-semibold text-[var(--sea-ink)]"
                >
                  Delete your account?
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                  You will be signed out everywhere. Only an administrator can
                  restore the account afterward.
                </p>
              </div>
            </div>

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-bold text-[var(--sea-ink)]">
                Type <strong>{user?.username}</strong> to confirm
              </span>
              <input
                value={deleteConfirmation}
                autoComplete="off"
                className="h-12 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 font-bold text-[var(--sea-ink)] outline-none focus:border-red-400"
                onChange={(event) => setDeleteConfirmation(event.target.value)}
              />
            </label>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--sea-ink)]"
                onClick={() => {
                  setDeleteConfirmation('')
                  setIsDeleteDialogOpen(false)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canDelete || deleteUser.isPending}
                className="h-11 rounded-full bg-red-600 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleDeleteAccount}
              >
                {deleteUser.isPending ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
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
    <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:rounded-[22px] sm:p-4">
      <Icon weight="bold" className="h-5 w-5 text-[var(--sea-ink-soft)]" />
      <p className="app-kicker mt-2 sm:mt-3">{label}</p>
      <p className="mt-1 truncate text-lg font-black text-[var(--sea-ink)] sm:text-xl">
        {value}
      </p>
    </div>
  )
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:rounded-[20px] sm:p-4">
      <p className="app-kicker">{label}</p>
      <p className="mt-1 text-base font-bold leading-6 text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}
