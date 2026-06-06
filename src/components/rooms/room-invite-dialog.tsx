import {
  MagnifyingGlassIcon,
  PaperPlaneTiltIcon,
  UserIcon,
  XIcon,
} from '@phosphor-icons/react'
import { USER_SEARCH_MIN_LENGTH } from '#/lib/users/users.constants'
import type { UserSearchItem } from '#/lib/users/users.types'

type RoomInviteDialogProps = {
  isOpen: boolean
  query: string
  selectedUsername: string
  results: UserSearchItem[]
  isSearching: boolean
  isSending: boolean
  onClose: () => void
  onQueryChange: (query: string) => void
  onSelectUser: (username: string) => void
  onInvite: () => void
}

export function RoomInviteDialog({
  isOpen,
  query,
  selectedUsername,
  results,
  isSearching,
  isSending,
  onClose,
  onQueryChange,
  onSelectUser,
  onInvite,
}: RoomInviteDialogProps) {
  if (!isOpen) {
    return null
  }

  const normalizedQuery = query.trim()
  const canSearch = normalizedQuery.length >= USER_SEARCH_MIN_LENGTH

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center px-4 pb-4 pt-16 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-invite-title"
    >
      <button
        type="button"
        aria-label="Close invite dialog"
        className="dialog-backdrop-enter absolute inset-0 cursor-default bg-[rgba(4,12,15,0.62)] backdrop-blur-md"
        onClick={onClose}
      />

      <section className="dialog-panel-enter relative w-full max-w-md rounded-[30px] border border-[var(--line)] bg-[var(--bg-base)] p-5 shadow-[0_28px_90px_rgba(4,12,15,0.32)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="app-kicker">Invite player</p>
            <h2
              id="room-invite-title"
              className="display-title mt-3 text-3xl font-semibold text-[var(--sea-ink)]"
            >
              Bring a friend in.
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] transition hover:translate-y-[-1px]"
            onClick={onClose}
          >
            <XIcon weight="bold" className="h-5 w-5" />
          </button>
        </div>

        <label className="mt-5 grid gap-2">
          <span className="text-sm font-bold text-[var(--sea-ink)]">
            Username
          </span>
          <span className="relative block">
            <MagnifyingGlassIcon
              weight="bold"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--sea-ink-soft)]"
            />
            <input
              type="search"
              value={query}
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              className="h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] pl-12 pr-4 text-base font-bold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
              placeholder="Search username"
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </span>
        </label>

        <div className="mt-4 max-h-56 overflow-y-auto rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-2">
          {!canSearch ? (
            <p className="px-3 py-4 text-sm font-semibold text-[var(--sea-ink-soft)]">
              Type at least {USER_SEARCH_MIN_LENGTH} characters.
            </p>
          ) : null}

          {canSearch && isSearching ? (
            <p className="px-3 py-4 text-sm font-semibold text-[var(--sea-ink-soft)]">
              Finding players...
            </p>
          ) : null}

          {canSearch && !isSearching && results.length === 0 ? (
            <p className="px-3 py-4 text-sm font-semibold text-[var(--sea-ink-soft)]">
              No players found.
            </p>
          ) : null}

          {results.map((user) => {
            const isSelected = selectedUsername === user.username

            return (
              <button
                key={user.id}
                type="button"
                className={[
                  'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-[var(--bg-base)]',
                  isSelected ? 'bg-[var(--bg-base)]' : '',
                ].join(' ')}
                onClick={() => onSelectUser(user.username)}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--bg-base)] text-[var(--sea-ink)]">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon weight="bold" className="h-5 w-5" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-black text-[var(--sea-ink)]">
                  {user.username}
                </span>
                {isSelected ? (
                  <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-black text-[var(--primary-foreground)]">
                    Selected
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          disabled={!selectedUsername || isSending}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onInvite}
        >
          <PaperPlaneTiltIcon weight="bold" className="h-4.5 w-4.5" />
          {isSending ? 'Sending invite...' : 'Send invite'}
        </button>
      </section>
    </div>
  )
}
