import {
  MagnifyingGlassIcon,
  PaperPlaneTiltIcon,
  UserIcon,
  XIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { USER_SEARCH_MIN_LENGTH } from '#/lib/users/users.constants'

type RoomInviteCandidate = {
  id: string
  username: string
  avatarUrl: string | null
}

type RoomInviteDialogProps = {
  isOpen: boolean
  query: string
  selectedUsername: string
  friends: RoomInviteCandidate[]
  results: RoomInviteCandidate[]
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
  friends,
  results,
  isSearching,
  isSending,
  onClose,
  onQueryChange,
  onSelectUser,
  onInvite,
}: RoomInviteDialogProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'search'>('friends')

  if (!isOpen) {
    return null
  }

  const normalizedQuery = query.trim()
  const canSearch = normalizedQuery.length >= USER_SEARCH_MIN_LENGTH
  const visibleResults = activeTab === 'friends' ? friends : results

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center pt-16 sm:items-center sm:p-6"
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

      <section className="dialog-panel-enter relative w-full max-w-md rounded-t-[26px] border border-[var(--line)] bg-[var(--bg-base)] p-4 shadow-[0_24px_72px_rgba(4,12,15,0.32)] sm:rounded-[26px] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="app-kicker">Invite player</p>
            <h2
              id="room-invite-title"
              className="display-title mt-2 text-2xl font-semibold text-[var(--sea-ink)]"
            >
              Bring a friend in.
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] transition hover:translate-y-[-1px]"
            onClick={onClose}
          >
            <XIcon weight="bold" className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1">
          {(['friends', 'search'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={[
                'h-9 rounded-full text-sm font-black capitalize transition',
                activeTab === tab
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_10px_24px_rgba(23,58,64,0.16)]'
                  : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]',
              ].join(' ')}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'search' ? (
          <label className="mt-3 grid gap-2">
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
                className="h-10 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] pl-12 pr-4 text-base font-bold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
                placeholder="Search username"
                onChange={(event) => onQueryChange(event.target.value)}
              />
            </span>
          </label>
        ) : null}

        <div className="mt-3 max-h-44 overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2">
          {activeTab === 'friends' && friends.length === 0 ? (
            <p className="px-3 py-4 text-sm font-semibold text-[var(--sea-ink-soft)]">
              No inviteable friends.
            </p>
          ) : null}

          {activeTab === 'search' && !canSearch ? (
            <p className="px-3 py-4 text-sm font-semibold text-[var(--sea-ink-soft)]">
              Type at least {USER_SEARCH_MIN_LENGTH} characters.
            </p>
          ) : null}

          {activeTab === 'search' && canSearch && isSearching ? (
            <p className="px-3 py-4 text-sm font-semibold text-[var(--sea-ink-soft)]">
              Finding players...
            </p>
          ) : null}

          {activeTab === 'search' && canSearch && !isSearching && results.length === 0 ? (
            <p className="px-3 py-4 text-sm font-semibold text-[var(--sea-ink-soft)]">
              No players found.
            </p>
          ) : null}

          {visibleResults.map((user) => {
            const isSelected = selectedUsername === user.username

            return (
              <button
                key={user.id}
                type="button"
                className={[
                  'flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-[var(--bg-base)]',
                  isSelected ? 'bg-[var(--bg-base)]' : '',
                ].join(' ')}
                onClick={() => onSelectUser(user.username)}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--bg-base)] text-[var(--sea-ink)]">
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
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onInvite}
        >
          <PaperPlaneTiltIcon weight="bold" className="h-4.5 w-4.5" />
          {isSending ? 'Sending invite...' : 'Send invite'}
        </button>
      </section>
    </div>
  )
}
