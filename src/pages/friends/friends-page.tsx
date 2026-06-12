import {
  CheckIcon,
  MagnifyingGlassIcon,
  PaperPlaneTiltIcon,
  UserIcon,
  UserMinusIcon,
  XIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { useToast } from '#/components/common/toast'
import { APP_NAME } from '#/config/app.constants'
import {
  useFriendMutations,
  useFriendRequests,
  useFriends,
} from '#/lib/friends/useFriends'
import type {
  FriendRequestSummary,
  FriendSummary,
} from '#/lib/friends/friends.types'
import { useDebouncedValue } from '#/lib/common/useDebouncedValue'
import { useUserSearch } from '#/lib/users/useUsers'

export function FriendsPage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 250)
  const search = useUserSearch(debouncedQuery)
  const friends = useFriends()
  const requests = useFriendRequests()
  const mutations = useFriendMutations()
  const { showToast } = useToast()

  function handleMutation<T>(
    mutation: {
      mutate: (
        input: T,
        options: { onSuccess: () => void; onError: (error: Error) => void },
      ) => void
    },
    input: T,
    successMessage: string,
  ) {
    mutation.mutate(input, {
      onSuccess: () => showToast({ kind: 'success', message: successMessage }),
      onError: (error) =>
        showToast({
          kind: 'error',
          message: error.message,
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

        <div className="max-w-3xl">
          <p className="app-kicker">Friends</p>
          <h1 className="display-title mt-2 text-5xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
            Find your table circle.
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--sea-ink-soft)]">
            Search usernames, send requests, and manage players you already know.
          </p>
        </div>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-5 shadow-[0_22px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-6">
            <div className="relative">
              <MagnifyingGlassIcon
                weight="bold"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--sea-ink-soft)]"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search exact username"
                className="h-13 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] pl-12 pr-4 text-base font-bold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div className="mt-5 grid gap-3">
              {search.data?.items.map((user) => (
                <article
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-4"
                >
                  <UserSummary username={user.username} />
                  <button
                    type="button"
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)]"
                    disabled={mutations.sendRequest.isPending}
                    onClick={() =>
                      handleMutation(
                        mutations.sendRequest,
                        user.username,
                        `Request sent to ${user.username}.`,
                      )
                    }
                  >
                    <PaperPlaneTiltIcon weight="bold" className="h-4 w-4" />
                    Add
                  </button>
                </article>
              ))}

              {debouncedQuery.length >= 2 && !search.data?.items.length ? (
                <EmptyState text="No matching players found." />
              ) : null}

              {debouncedQuery.length < 2 ? (
                <EmptyState text="Type at least two characters to search." />
              ) : null}
            </div>
          </article>

          <div className="grid gap-5">
            <FriendsList
              friends={friends.data?.items ?? []}
              isLoading={friends.isLoading}
              onRemove={(friendshipId) =>
                handleMutation(
                  mutations.removeFriend,
                  friendshipId,
                  'Friend removed.',
                )
              }
              isMutating={mutations.removeFriend.isPending}
            />

            <RequestsList
              title="Incoming requests"
              requests={requests.data?.incoming.items ?? []}
              emptyText="No one is waiting on your response."
              renderName={(request) => request.requesterUsername}
              actions={(request) => (
                <>
                  <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]"
                    disabled={mutations.acceptRequest.isPending}
                    onClick={() =>
                      handleMutation(
                        mutations.acceptRequest,
                        request.friendshipId,
                        'Friend request accepted.',
                      )
                    }
                  >
                    <CheckIcon weight="bold" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] text-[var(--sea-ink)]"
                    disabled={mutations.rejectRequest.isPending}
                    onClick={() =>
                      handleMutation(
                        mutations.rejectRequest,
                        request.friendshipId,
                        'Friend request rejected.',
                      )
                    }
                  >
                    <XIcon weight="bold" className="h-4 w-4" />
                  </button>
                </>
              )}
            />

            <RequestsList
              title="Sent requests"
              requests={requests.data?.outgoing.items ?? []}
              emptyText="No pending requests from you."
              renderName={(request) => request.addresseeUsername}
              actions={(request) => (
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--line)] px-4 text-sm font-black text-[var(--sea-ink)]"
                  disabled={mutations.cancelRequest.isPending}
                  onClick={() =>
                    handleMutation(
                      mutations.cancelRequest,
                      request.friendshipId,
                      'Friend request canceled.',
                    )
                  }
                >
                  Cancel
                </button>
              )}
            />
          </div>
        </section>
      </section>
    </main>
  )
}

function FriendsList({
  friends,
  isLoading,
  isMutating,
  onRemove,
}: {
  friends: FriendSummary[]
  isLoading: boolean
  isMutating: boolean
  onRemove: (friendshipId: string) => void
}) {
  return (
    <article className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-5 shadow-[0_22px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-6">
      <p className="app-kicker">Your friends</p>
      <div className="mt-4 grid gap-3">
        {friends.map((friend) => (
          <article
            key={friend.friendshipId}
            className="flex items-center justify-between gap-3 rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-4"
          >
            <UserSummary username={friend.username} />
            <button
              type="button"
              aria-label={`Remove ${friend.username}`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] text-[var(--sea-ink)]"
              disabled={isMutating}
              onClick={() => onRemove(friend.friendshipId)}
            >
              <UserMinusIcon weight="bold" className="h-4 w-4" />
            </button>
          </article>
        ))}

        {!friends.length ? (
          <EmptyState
            text={isLoading ? 'Loading friends...' : 'No friends added yet.'}
          />
        ) : null}
      </div>
    </article>
  )
}

function RequestsList({
  title,
  requests,
  emptyText,
  renderName,
  actions,
}: {
  title: string
  requests: FriendRequestSummary[]
  emptyText: string
  renderName: (request: FriendRequestSummary) => string
  actions: (request: FriendRequestSummary) => ReactNode
}) {
  return (
    <article className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-5 shadow-[0_22px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-6">
      <p className="app-kicker">{title}</p>
      <div className="mt-4 grid gap-3">
        {requests.map((request) => (
          <article
            key={request.friendshipId}
            className="flex items-center justify-between gap-3 rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-4"
          >
            <UserSummary username={renderName(request)} />
            <div className="flex shrink-0 items-center gap-2">
              {actions(request)}
            </div>
          </article>
        ))}

        {!requests.length ? <EmptyState text={emptyText} /> : null}
      </div>
    </article>
  )
}

function UserSummary({ username }: { username: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--surface-strong)] text-[var(--sea-ink)]">
        <UserIcon weight="bold" className="h-5 w-5" />
      </span>
      <p className="truncate text-base font-black text-[var(--sea-ink)]">
        {username}
      </p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-bold text-[var(--sea-ink-soft)]">
      {text}
    </p>
  )
}
