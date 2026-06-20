import {
  CalendarDotsIcon,
  CheckIcon,
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  MedalIcon,
  UserIcon,
  UserMinusIcon,
  UserPlusIcon,
  XIcon,
} from '@phosphor-icons/react'
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
import { useAuth } from '#/lib/auth/useAuth'
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
  if (!value) {
    return 'No change'
  }

  return value > 0 ? `+${value}` : String(value)
}

export function PublicUserProfilePage({
  username,
}: PublicUserProfilePageProps) {
  const auth = useAuth()
  const { showToast } = useToast()
  const profile = useUserProfile(username)
  const friends = useFriends()
  const requests = useFriendRequests()
  const mutations = useFriendMutations()
  const user = profile.data
  const matches = useUserMatches(user?.username)
  const recentMatches = matches.data?.items ?? []
  const relationship = user
    ? getRelationshipForUsername({
        username: user.username,
        friends: friends.data?.items ?? [],
        incoming: requests.data?.incoming.items ?? [],
        outgoing: requests.data?.outgoing.items ?? [],
      })
    : null
  const isOwnProfile = Boolean(
    auth.currentUser.data?.username.toLowerCase() === username.toLowerCase(),
  )

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

        {profile.isLoading ? <StatePanel title="Loading player..." /> : null}

        {profile.isError ? (
          <StatePanel
            title="Player not found."
            detail="Check the username and try again."
          />
        ) : null}

        {user ? (
          <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-4 shadow-[0_18px_48px_rgba(8,28,32,0.1)] backdrop-blur-xl sm:rounded-[30px] sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
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
                  <h1 className="display-title mt-2 truncate text-3xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-5xl">
                    {user.username}
                  </h1>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)] sm:mt-3 sm:text-base sm:leading-7">
                    {user.bio ?? 'Ready to roll, buy, build, and climb.'}
                  </p>
                  {!isOwnProfile ? (
                    <ProfileFriendActions
                      username={user.username}
                      relationship={relationship}
                      mutations={mutations}
                      onSendRequest={() =>
                        handleMutation(
                          mutations.sendRequest,
                          user.username,
                          `Request sent to ${user.username}.`,
                        )
                      }
                      onAcceptRequest={(friendshipId) =>
                        handleMutation(
                          mutations.acceptRequest,
                          friendshipId,
                          'Friend request accepted.',
                        )
                      }
                      onRejectRequest={(friendshipId) =>
                        handleMutation(
                          mutations.rejectRequest,
                          friendshipId,
                          'Friend request rejected.',
                        )
                      }
                      onCancelRequest={(friendshipId) =>
                        handleMutation(
                          mutations.cancelRequest,
                          friendshipId,
                          'Friend request canceled.',
                        )
                      }
                      onRemoveFriend={(friendshipId) =>
                        handleMutation(
                          mutations.removeFriend,
                          friendshipId,
                          'Friend removed.',
                        )
                      }
                    />
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7">
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

            <article className="rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-4 shadow-[0_18px_48px_rgba(8,28,32,0.1)] backdrop-blur-xl sm:rounded-[30px] sm:p-8">
              <p className="app-kicker">Table record</p>
              <h2 className="display-title mt-2 text-3xl font-semibold text-[var(--sea-ink)] sm:text-4xl">
                Latest results.
              </h2>

              <div className="mt-4 grid gap-2 sm:mt-6 sm:gap-3">
                <ProfileDetail
                  label="Joined"
                  value={formatJoinedDate(user.createdAt)}
                />
                {recentMatches.slice(0, 4).map((match) => (
                  <article
                    key={match.gameId}
                    className="grid gap-2 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:grid-cols-[1fr_auto] sm:rounded-[20px] sm:p-4"
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
                  <ProfileDetail
                    label="Matches"
                    value="No completed matches yet"
                  />
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

function StatePanel({ title, detail }: { title: string; detail?: string }) {
  return (
    <section className="rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-4 text-center shadow-[0_18px_48px_rgba(8,28,32,0.1)] backdrop-blur-xl sm:rounded-[30px] sm:p-6">
      <h1 className="display-title text-3xl font-semibold text-[var(--sea-ink)] sm:text-4xl">
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

type UserRelationshipState =
  | { status: 'friends'; friendshipId: string }
  | { status: 'incoming'; friendshipId: string }
  | { status: 'outgoing'; friendshipId: string }

type FriendMutations = ReturnType<typeof useFriendMutations>

function ProfileFriendActions({
  username,
  relationship,
  mutations,
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
  onRemoveFriend,
}: {
  username: string
  relationship: UserRelationshipState | null
  mutations: FriendMutations
  onSendRequest: () => void
  onAcceptRequest: (friendshipId: string) => void
  onRejectRequest: (friendshipId: string) => void
  onCancelRequest: (friendshipId: string) => void
  onRemoveFriend: (friendshipId: string) => void
}) {
  if (relationship?.status === 'friends') {
    const isRemoving =
      mutations.removeFriend.isPending &&
      mutations.removeFriend.variables === relationship.friendshipId

    return (
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 text-sm font-black text-[var(--sea-ink)]">
          Friends
        </span>
        <button
          type="button"
          aria-label={`Remove ${username}`}
          disabled={mutations.removeFriend.isPending}
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onRemoveFriend(relationship.friendshipId)}
        >
          {isRemoving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--sea-ink)]" />
          ) : (
            <UserMinusIcon weight="bold" className="h-4 w-4" />
          )}
        </button>
      </div>
    )
  }

  if (relationship?.status === 'outgoing') {
    const isCancelling =
      mutations.cancelRequest.isPending &&
      mutations.cancelRequest.variables === relationship.friendshipId

    return (
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 text-sm font-black text-[var(--sea-ink-soft)]">
          Requested
        </span>
        <button
          type="button"
          disabled={mutations.cancelRequest.isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onCancelRequest(relationship.friendshipId)}
        >
          <XIcon weight="bold" className="h-4 w-4" />
          {isCancelling ? 'Cancelling...' : 'Cancel'}
        </button>
      </div>
    )
  }

  if (relationship?.status === 'incoming') {
    const isAccepting =
      mutations.acceptRequest.isPending &&
      mutations.acceptRequest.variables === relationship.friendshipId
    const isRejecting =
      mutations.rejectRequest.isPending &&
      mutations.rejectRequest.variables === relationship.friendshipId

    return (
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={
            mutations.acceptRequest.isPending ||
            mutations.rejectRequest.isPending
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onAcceptRequest(relationship.friendshipId)}
        >
          <CheckIcon weight="bold" className="h-4 w-4" />
          {isAccepting ? 'Accepting...' : 'Accept'}
        </button>
        <button
          type="button"
          disabled={
            mutations.acceptRequest.isPending ||
            mutations.rejectRequest.isPending
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onRejectRequest(relationship.friendshipId)}
        >
          <XIcon weight="bold" className="h-4 w-4" />
          {isRejecting ? 'Rejecting...' : 'Reject'}
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      disabled={mutations.sendRequest.isPending}
      className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
      onClick={onSendRequest}
    >
      <UserPlusIcon weight="bold" className="h-4 w-4" />
      {mutations.sendRequest.isPending &&
      mutations.sendRequest.variables === username
        ? 'Adding...'
        : 'Add'}
    </button>
  )
}

function getRelationshipForUsername({
  username,
  friends,
  incoming,
  outgoing,
}: {
  username: string
  friends: FriendSummary[]
  incoming: FriendRequestSummary[]
  outgoing: FriendRequestSummary[]
}): UserRelationshipState | null {
  const normalizedUsername = username.toLowerCase()
  const friend = friends.find(
    (item) => item.username.toLowerCase() === normalizedUsername,
  )

  if (friend) {
    return { status: 'friends', friendshipId: friend.friendshipId }
  }

  const incomingRequest = incoming.find(
    (request) => request.requesterUsername.toLowerCase() === normalizedUsername,
  )

  if (incomingRequest) {
    return { status: 'incoming', friendshipId: incomingRequest.friendshipId }
  }

  const outgoingRequest = outgoing.find(
    (request) => request.addresseeUsername.toLowerCase() === normalizedUsername,
  )

  if (outgoingRequest) {
    return { status: 'outgoing', friendshipId: outgoingRequest.friendshipId }
  }

  return null
}
