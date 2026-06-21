import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  ProhibitIcon,
  UserGearIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { AppPageHeader } from '#/components/common/app-page-header'
import { useToast } from '#/components/common/toast'
import {
  useRestoreDeletedUser,
  useUpdateUserStatus,
} from '#/lib/admin/useAdmin'

export function AdminUsersPage() {
  const [statusUsername, setStatusUsername] = useState('')
  const [deletedUsername, setDeletedUsername] = useState('')
  const updateStatus = useUpdateUserStatus()
  const restoreUser = useRestoreDeletedUser()
  const { showToast } = useToast()

  function handleStatusChange(status: 'active' | 'suspended') {
    const normalizedUsername = statusUsername.trim().toLowerCase()

    if (!normalizedUsername) {
      showToast({ kind: 'error', message: 'Enter a username.' })
      return
    }

    updateStatus.mutate(
      { username: normalizedUsername, status },
      {
        onSuccess: ({ user }) => {
          setStatusUsername('')
          showToast({
            kind: 'success',
            message:
              user.status === 'suspended'
                ? `${user.username}'s account has been suspended.`
                : `${user.username}'s account is active again.`,
          })
        },
        onError: (error) => {
          showToast({
            kind: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Could not update user status.',
          })
        },
      },
    )
  }

  function handleRestore() {
    const normalizedUsername = deletedUsername.trim().toLowerCase()

    if (!normalizedUsername) {
      showToast({ kind: 'error', message: 'Enter a username.' })
      return
    }

    restoreUser.mutate(normalizedUsername, {
      onSuccess: ({ user }) => {
        setDeletedUsername('')
        showToast({
          kind: 'success',
          message: `${user.username}'s account has been restored.`,
        })
      },
      onError: (error) => {
        showToast({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Could not restore user.',
        })
      },
    })
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-8 sm:py-6">
      <section className="mx-auto grid w-full max-w-4xl gap-5">
        <AppPageHeader />

        <section className="border-y border-[var(--line)] py-8 sm:py-12">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
              <UserGearIcon weight="bold" className="h-6 w-6" />
            </span>
            <div>
              <p className="app-kicker">User administration</p>
              <h1 className="display-title mt-2 text-3xl font-semibold text-[var(--sea-ink)] sm:text-4xl">
                Manage player access.
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--sea-ink-soft)] sm:text-base">
                Suspend an active player, reactivate them, or recover a deleted
                account. You cannot change your own admin account here.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            <label className="grid gap-2">
              <span className="text-sm font-black text-[var(--sea-ink)]">
                Active username
              </span>
              <input
                value={statusUsername}
                autoComplete="off"
                className="h-12 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 text-base font-bold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
                onChange={(event) => setStatusUsername(event.target.value)}
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={updateStatus.isPending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-red-400/40 bg-red-400/10 px-5 text-sm font-black text-red-700 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-200"
                onClick={() => handleStatusChange('suspended')}
              >
                <ProhibitIcon weight="bold" className="h-5 w-5" />
                Suspend account
              </button>
              <button
                type="button"
                disabled={updateStatus.isPending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-black text-[var(--sea-ink)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleStatusChange('active')}
              >
                <CheckCircleIcon weight="bold" className="h-5 w-5" />
                Reactivate account
              </button>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--line)] py-8 sm:py-12">
          <p className="app-kicker">Deleted accounts</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--sea-ink)]">
            Restore a player.
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
            Restoration reactivates the account, but does not restore old
            sessions. The player must sign in again.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="grid gap-2">
              <span className="text-sm font-black text-[var(--sea-ink)]">
                Deleted username
              </span>
              <input
                value={deletedUsername}
                autoComplete="off"
                className="h-12 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 text-base font-bold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
                onChange={(event) => setDeletedUsername(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleRestore()
                }}
              />
            </label>
            <button
              type="button"
              disabled={restoreUser.isPending}
              className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-black text-[var(--primary-foreground)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleRestore}
            >
              <ArrowCounterClockwiseIcon weight="bold" className="h-5 w-5" />
              {restoreUser.isPending ? 'Restoring...' : 'Restore account'}
            </button>
          </div>
        </section>
      </section>
    </main>
  )
}
