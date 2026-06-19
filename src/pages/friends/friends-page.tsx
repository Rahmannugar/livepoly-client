import {
  CheckIcon,
  MagnifyingGlassIcon,
  UserIcon,
  UserMinusIcon,
  UserPlusIcon,
  XIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { AppPageHeader } from '#/components/common/app-page-header'
import { useToast } from '#/components/common/toast'
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
  const relationshipByUsername = buildRelationshipByUsername({
    friends: friends.data?.items ?? [],
    incoming: requests.data?.incoming.items ?? [],
    outgoing: requests.data?.outgoing.items ?? [],
  })

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
    <main className="min-h-screen px-4 py-4 sm:px-8 sm:py-6">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl content-start gap-4 sm:min-h-[calc(100vh-3rem)] sm:content-center sm:gap-7">
        <AppPageHeader />

        <div className="max-w-3xl">
          <p className="app-kicker">Friends</p>
          <h1 className="display-title mt-2 text-3xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
            Find your table circle.
          </h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)] sm:mt-4 sm:text-lg sm:leading-8">
            Search usernames, send requests, and manage players you already know.
          </p>
        </div>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-5">
          <article className="rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-4 shadow-[0_18px_48px_rgba(8,28,32,0.1)] backdrop-blur-xl sm:rounded-[30px] sm:p-6">
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

            <div className="mt-4 grid gap-2 sm:mt-5 sm:gap-3">
              {search.data?.items.map((user) => (
                <SearchResultRow
                  key={user.id}
                  username={user.username}
                  relationship={relationshipByUsername.get(
                    user.username.toLowerCase(),
                  )}
                  isPending={
                    mutations.sendRequest.isPending &&
                    mutations.sendRequest.variables === user.username
                  }
                  isDisabled={mutations.sendRequest.isPending}
                  onAdd={() =>
                    handleMutation(
                      mutations.sendRequest,
                      user.username,
                      `Request sent to ${user.username}.`,
                    )
                  }
                />
              ))}

              {debouncedQuery.length >= 2 && !search.data?.items.length ? (
                <EmptyState text="No matching players found." />
              ) : null}

              {debouncedQuery.length < 2 ? (
                <EmptyState text="Type at least two characters to search." />
              ) : null}
            </div>
          </article>

          <div className="grid gap-4 sm:gap-5">
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
              mutatingFriendshipId={mutations.removeFriend.variables}
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
                    className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                    disabled={
                      mutations.acceptRequest.isPending ||
                      mutations.rejectRequest.isPending
                    }
                    onClick={() =>
                      handleMutation(
                        mutations.acceptRequest,
                        request.friendshipId,
                        'Friend request accepted.',
                      )
                    }
                  >
                    <CheckIcon weight="bold" className="h-4 w-4" />
                    {mutations.acceptRequest.isPending &&
                    mutations.acceptRequest.variables === request.friendshipId
                      ? 'Accepting...'
                      : 'Accept'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line)] px-4 text-sm font-black text-[var(--sea-ink)] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                    disabled={
                      mutations.acceptRequest.isPending ||
                      mutations.rejectRequest.isPending
                    }
                    onClick={() =>
                      handleMutation(
                        mutations.rejectRequest,
                        request.friendshipId,
                        'Friend request rejected.',
                      )
                    }
                  >
                    <XIcon weight="bold" className="h-4 w-4" />
                    {mutations.rejectRequest.isPending &&
                    mutations.rejectRequest.variables === request.friendshipId
                      ? 'Rejecting...'
                      : 'Reject'}
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
                  {mutations.cancelRequest.isPending &&
                  mutations.cancelRequest.variables === request.friendshipId
                    ? 'Cancelling...'
                    : 'Cancel'}
                </button>
              )}
            />
          </div>
        </section>
      </section>
    </main>
  )
}

function SearchResultRow({
  username,
  relationship,
  isPending,
  isDisabled,
  onAdd,
}: {
  username: string
  relationship?: UserRelationshipState
  isPending: boolean
  isDisabled: boolean
  onAdd: () => void
}) {
  const relationshipLabel = getRelationshipLabel(relationship)

  return (
    <article className="flex items-center justify-between gap-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:rounded-[22px] sm:p-4">
      <UserSummary username={username} />
      {relationshipLabel ? (
        <span className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 text-xs font-black text-[var(--sea-ink-soft)] sm:h-10 sm:px-4 sm:text-sm">
          {relationshipLabel}
        </span>
      ) : (
        <button
          type="button"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-3 text-xs font-black text-[var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:px-4 sm:text-sm"
          disabled={isDisabled}
          onClick={onAdd}
        >
          <UserPlusIcon weight="bold" className="h-4 w-4" />
          {isPending ? 'Adding...' : 'Add'}
        </button>
      )}
    </article>
  )
}

function FriendsList({
  friends,
  isLoading,
  isMutating,
  mutatingFriendshipId,
  onRemove,
}: {
  friends: FriendSummary[]
  isLoading: boolean
  isMutating: boolean
  mutatingFriendshipId?: string
  onRemove: (friendshipId: string) => void
}) {
  return (
    <article className="rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-4 shadow-[0_18px_48px_rgba(8,28,32,0.1)] backdrop-blur-xl sm:rounded-[30px] sm:p-6">
      <p className="app-kicker">Your friends</p>
      <div className="mt-3 grid gap-2 sm:mt-4 sm:gap-3">
        {friends.map((friend) => {
          const isRemoving =
            isMutating && mutatingFriendshipId === friend.friendshipId

          return (
            <article
              key={friend.friendshipId}
              className="flex items-center justify-between gap-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:rounded-[22px] sm:p-4"
            >
              <UserSummary username={friend.username} />
              <button
                type="button"
                aria-label={`Remove ${friend.username}`}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--line)] px-3 text-xs font-black text-[var(--sea-ink)] disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:px-4 sm:text-sm"
                disabled={isMutating}
                onClick={() => onRemove(friend.friendshipId)}
              >
                <UserMinusIcon weight="bold" className="h-4 w-4" />
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </article>
          )
        })}

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
    <article className="rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-4 shadow-[0_18px_48px_rgba(8,28,32,0.1)] backdrop-blur-xl sm:rounded-[30px] sm:p-6">
      <p className="app-kicker">{title}</p>
      <div className="mt-3 grid gap-2 sm:mt-4 sm:gap-3">
        {requests.map((request) => (
          <article
            key={request.friendshipId}
            className="flex flex-col gap-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between sm:rounded-[22px] sm:p-4"
          >
            <UserSummary username={renderName(request)} />
            <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:shrink-0">
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
    <Link
      to="/users/$username"
      params={{ username }}
      className="flex min-w-0 items-center gap-2.5 rounded-2xl outline-none transition hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-[var(--primary)] sm:gap-3"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-strong)] text-[var(--sea-ink)] sm:h-11 sm:w-11 sm:rounded-2xl">
        <UserIcon weight="bold" className="h-5 w-5" />
      </span>
      <p className="truncate text-base font-black text-[var(--sea-ink)]">
        {username}
      </p>
    </Link>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3 text-sm font-bold text-[var(--sea-ink-soft)] sm:rounded-[20px] sm:p-4">
      {text}
    </p>
  )
}

type UserRelationshipState =
  | { status: 'friends'; friendshipId: string }
  | { status: 'incoming'; friendshipId: string }
  | { status: 'outgoing'; friendshipId: string }

function buildRelationshipByUsername({
  friends,
  incoming,
  outgoing,
}: {
  friends: FriendSummary[]
  incoming: FriendRequestSummary[]
  outgoing: FriendRequestSummary[]
}) {
  const relationships = new Map<string, UserRelationshipState>()

  for (const friend of friends) {
    relationships.set(friend.username.toLowerCase(), {
      status: 'friends',
      friendshipId: friend.friendshipId,
    })
  }

  for (const request of incoming) {
    relationships.set(request.requesterUsername.toLowerCase(), {
      status: 'incoming',
      friendshipId: request.friendshipId,
    })
  }

  for (const request of outgoing) {
    relationships.set(request.addresseeUsername.toLowerCase(), {
      status: 'outgoing',
      friendshipId: request.friendshipId,
    })
  }

  return relationships
}

function getRelationshipLabel(relationship?: UserRelationshipState) {
  if (!relationship) {
    return null
  }

  if (relationship.status === 'friends') {
    return 'Friends'
  }

  if (relationship.status === 'incoming') {
    return 'Respond'
  }

  return 'Requested'
}
