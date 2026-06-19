import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  CopyIcon,
  CrownIcon,
  PaperPlaneTiltIcon,
  PlayIcon,
  SignOutIcon,
  UserIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { RoomInviteDialog } from '#/components/rooms/room-invite-dialog'
import { GlobalNotificationButton } from '#/components/common/global-notification-button'
import { RouteTransitionOverlay } from '#/components/common/route-transition-overlay'
import { APP_NAME } from '#/config/app.constants'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { useToast } from '#/components/common/toast'
import { useAuth } from '#/lib/auth/useAuth'
import { useDebouncedValue } from '#/lib/common/useDebouncedValue'
import { useFriends } from '#/lib/friends/useFriends'
import type { FriendSummary } from '#/lib/friends/friends.types'
import {
  BOT_DIFFICULTIES,
  DEFAULT_BOT_DIFFICULTY,
} from '#/lib/rooms/rooms.constants'
import { useRoomStream, type RoomStreamEvent } from '#/lib/rooms/rooms-stream'
import { useRoom, useRooms } from '#/lib/rooms/useRooms'
import { useUserSearch } from '#/lib/users/useUsers'
import type { BotDifficulty, RoomPlayer } from '#/lib/rooms/rooms.types'

type RoomPageProps = {
  code: string
}

export function RoomPage({ code }: RoomPageProps) {
  const auth = useAuth()
  const rooms = useRooms()
  const roomQuery = useRoom(code)
  const friends = useFriends()
  const refetchRoom = roomQuery.refetch
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteQuery, setInviteQuery] = useState('')
  const [selectedInviteUsername, setSelectedInviteUsername] = useState('')
  const [routeTransitionLabel, setRouteTransitionLabel] = useState<string | null>(
    null,
  )
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>(
    DEFAULT_BOT_DIFFICULTY,
  )
  const debouncedInviteQuery = useDebouncedValue(inviteQuery, 250)
  const user = auth.currentUser.data
  const room = roomQuery.data
  const isHost = Boolean(room && user?.id === room.hostUserId)
  const playersAtTable = room ? joinedPlayers(room.players) : []
  const displayedRoomPlayers = room ? getDisplayedRoomPlayers(room) : []
  const canInvite = Boolean(
    room &&
      user &&
      room.status === 'waiting' &&
      room.currentUserAccess === 'player',
  )
  const userSearch = useUserSearch(debouncedInviteQuery, isInviteOpen)
  const inviteFriends = room
    ? filterInviteResults({
        currentUsername: user?.username,
        players: playersAtTable,
        results: friendsToInviteCandidates(friends.data?.items ?? []),
      })
    : []
  const inviteResults = room
    ? filterInviteResults({
        currentUsername: user?.username,
        players: playersAtTable,
        results: userSearch.data?.items ?? [],
      })
    : []
  const canStartRoom = Boolean(
    room && isHost && room.status === 'waiting' && playersAtTable.length > 0,
  )
  const canJoinRoom = Boolean(
    room &&
      room.status === 'waiting' &&
      room.currentUserAccess === 'none' &&
      playersAtTable.length < room.maxPlayers,
  )
  const willFillOpenSeats = Boolean(
    room &&
      isHost &&
      room.status === 'waiting' &&
      playersAtTable.length > 0 &&
      playersAtTable.length < room.maxPlayers,
  )
  const exitActionLabel = getExitActionLabel({
    access: room?.currentUserAccess,
    isHost,
    status: room?.status,
  })
  const exitPendingLabel = getExitPendingLabel({
    access: room?.currentUserAccess,
    isHost,
    status: room?.status,
  })
  const exitIsPending =
    rooms.leaveRoom.isPending || rooms.stopSpectatingRoom.isPending

  const handleRoomUpdated = useCallback(
    async (event: RoomStreamEvent) => {
      const result = await refetchRoom()
      const nextRoom = result.data
      const roomEvent = event.data?.event ?? event.event

      if (
        roomEvent === 'room.started' &&
        nextRoom?.activeGameId &&
        nextRoom.currentUserAccess !== 'none'
      ) {
        setRouteTransitionLabel('Opening game...')
        navigate({
          to: '/games/$gameId',
          params: { gameId: nextRoom.activeGameId },
        })
      }
    },
    [navigate, refetchRoom],
  )

  useRoomStream({
    code,
    enabled: Boolean(user),
    onRoomUpdated: handleRoomUpdated,
  })

  function copyRoomCode() {
    if (!room?.code) {
      return
    }

    navigator.clipboard
      .writeText(room.code)
      .then(() => showToast({ kind: 'success', message: 'Room code copied.' }))
      .catch(() =>
        showToast({ kind: 'error', message: 'Could not copy room code.' }),
      )
  }

  function leaveRoom() {
    if (!room?.code) {
      return
    }

    rooms.leaveRoom.mutate(room.code, {
      onSuccess: (response) => {
        setRouteTransitionLabel('Opening home...')
        showToast({
          kind: 'success',
          message: response.message ?? 'Left room.',
        })
        navigate({ to: '/' })
      },
      onError: (error) => {
        showToast({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Could not leave room.',
        })
      },
    })
  }

  function stopSpectatingRoom() {
    if (!room?.code) {
      return
    }

    rooms.stopSpectatingRoom.mutate(room.code, {
      onSuccess: (response) => {
        setRouteTransitionLabel('Opening home...')
        showToast({
          kind: 'success',
          message: response.message ?? 'Stopped spectating room.',
        })
        navigate({ to: '/' })
      },
      onError: (error) => {
        showToast({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Could not stop spectating.',
        })
      },
    })
  }

  function joinRoom() {
    if (!room?.code) {
      return
    }

    rooms.joinRoom.mutate(room.code, {
      onSuccess: (response) => {
        showToast({
          kind: 'success',
          message: `Joined room ${response.code}.`,
        })
      },
      onError: (error) => {
        showToast({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Could not join room.',
        })
      },
    })
  }

  function exitRoom() {
    if (room?.currentUserAccess === 'spectator') {
      stopSpectatingRoom()
      return
    }

    leaveRoom()
  }

  function startRoom() {
    if (!room?.code) {
      return
    }

    rooms.startRoom.mutate(
      {
        code: room.code,
        botDifficulty: willFillOpenSeats ? botDifficulty : undefined,
      },
      {
        onSuccess: (response) => {
          setRouteTransitionLabel('Opening game...')
          showToast({
            kind: 'success',
            message: 'Room started.',
          })
          navigate({
            to: '/games/$gameId',
            params: { gameId: response.game.id },
          })
        },
        onError: (error) => {
          showToast({
            kind: 'error',
            message:
              error instanceof Error ? error.message : 'Could not start room.',
          })
        },
      },
    )
  }

  function enterGame() {
    if (!room?.activeGameId) {
      showToast({
        kind: 'error',
        message: 'Game is not ready yet.',
      })
      return
    }

    setRouteTransitionLabel('Opening game...')
    navigate({
      to: '/games/$gameId',
      params: { gameId: room.activeGameId },
    })
  }

  function closeInviteDialog() {
    setIsInviteOpen(false)
    setInviteQuery('')
    setSelectedInviteUsername('')
  }

  function updateInviteQuery(query: string) {
    setInviteQuery(query)
    setSelectedInviteUsername('')
  }

  function inviteFriend() {
    if (!room?.code || !selectedInviteUsername) {
      return
    }

    rooms.inviteToRoom.mutate(
      { code: room.code, username: selectedInviteUsername },
      {
        onSuccess: (response) => {
          showToast({
            kind: 'success',
            message: response.message ?? 'Invite sent.',
          })
          closeInviteDialog()
        },
        onError: (error) => {
          showToast({
            kind: 'error',
            message:
              error instanceof Error ? error.message : 'Could not send invite.',
          })
        },
      },
    )
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-8 sm:py-6">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="display-title min-w-0 text-2xl font-semibold leading-none text-[var(--sea-ink)] min-[420px]:text-3xl sm:text-4xl"
          >
            {APP_NAME}
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <GlobalNotificationButton />
            <Link
              to="/"
              aria-label="Back home"
              className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] transition hover:translate-y-[-1px] min-[420px]:h-9 min-[420px]:w-9 sm:h-10 sm:w-10"
            >
              <ArrowLeftIcon weight="bold" className="h-5 w-5" />
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid flex-1 content-center gap-5 py-6 sm:py-14">
          {roomQuery.isLoading ? (
            <p className="display-title text-3xl font-semibold text-[var(--sea-ink)]">
              Opening room...
            </p>
          ) : null}

          {roomQuery.isError ? (
            <section className="max-w-xl rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-6 shadow-[0_24px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl">
              <p className="app-kicker">Room not found</p>
              <h1 className="display-title mt-3 text-3xl font-semibold text-[var(--sea-ink)] sm:text-4xl">
                This table is not available.
              </h1>
              <p className="mt-3 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                Check the room code and try joining again.
              </p>
              <Link
                to="/"
                className="mt-5 inline-flex h-11 items-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px]"
              >
                Back home
              </Link>
            </section>
          ) : null}

          {room ? (
            <>
              <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
                <div className="rounded-[28px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-4 shadow-[0_20px_56px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-5">
                  <p className="app-kicker">Room lobby</p>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h1 className="display-title text-3xl font-semibold leading-tight text-[var(--sea-ink)] min-[420px]:text-4xl sm:text-5xl">
                        Room {room.code}
                      </h1>
                      <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                        Share the code, fill the seats, and start when ready.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--sea-ink)] shadow-[0_10px_24px_rgba(8,28,32,0.1)] transition hover:translate-y-[-1px]"
                      onClick={copyRoomCode}
                    >
                      <CopyIcon weight="bold" className="h-4.5 w-4.5" />
                      Copy code
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <RoomStat
                      icon={UsersIcon}
                      label="Seats"
                      value={`${playersAtTable.length}/${room.maxPlayers}`}
                    />
                    <RoomStat
                      icon={ClockIcon}
                      label="Time"
                      value={`${room.durationMinutes}m`}
                    />
                    <RoomStat
                      icon={UserIcon}
                      label="Watching"
                      value={String(room.spectatorCount)}
                    />
                  </div>
                </div>

                <aside className="rounded-[28px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-4 shadow-[0_20px_56px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="app-kicker">Status</p>
                      <h2 className="display-title mt-1 text-2xl font-semibold capitalize text-[var(--sea-ink)]">
                        {room.status}
                      </h2>
                    </div>
                    {isHost ? (
                      <span className="inline-flex h-8 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-black text-[var(--sea-ink)]">
                        <CrownIcon weight="bold" className="h-4 w-4" />
                        Host
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                    {getRoomStatusCopy({
                      access: room.currentUserAccess,
                      isHost,
                      status: room.status,
                      playersAtTable: playersAtTable.length,
                    })}
                  </p>

                  {isHost && room.status === 'waiting' ? (
                    <>
                      {willFillOpenSeats ? (
                        <div className="mt-4 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
                                Bot fill
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {BOT_DIFFICULTIES.map((difficulty) => (
                              <button
                                key={difficulty}
                                type="button"
                                className={`h-10 rounded-full border px-3 text-sm font-black capitalize transition hover:translate-y-[-1px] ${
                                  botDifficulty === difficulty
                                    ? 'border-transparent bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_12px_26px_rgba(23,58,64,0.16)]'
                                    : 'border-[var(--line)] bg-[var(--bg-base)] text-[var(--sea-ink)]'
                                }`}
                                onClick={() => setBotDifficulty(difficulty)}
                              >
                                {difficulty}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <button
                        type="button"
                        disabled={!canStartRoom || rooms.startRoom.isPending}
                        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={startRoom}
                      >
                        <PlayIcon weight="bold" className="h-4.5 w-4.5" />
                        {rooms.startRoom.isPending
                          ? 'Starting...'
                          : 'Start room'}
                      </button>
                    </>
                  ) : null}

                  {canInvite ? (
                    <button
                      type="button"
                      className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.1)] transition hover:translate-y-[-1px]"
                      onClick={() => setIsInviteOpen(true)}
                    >
                      <PaperPlaneTiltIcon
                        weight="bold"
                        className="h-4.5 w-4.5"
                      />
                      Invite friend
                    </button>
                  ) : null}

                  {canJoinRoom ? (
                    <button
                      type="button"
                      disabled={rooms.joinRoom.isPending}
                      className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={joinRoom}
                    >
                      <UsersIcon weight="bold" className="h-4.5 w-4.5" />
                      {rooms.joinRoom.isPending ? 'Joining...' : 'Join room'}
                    </button>
                  ) : null}

                  {room.status === 'active' && room.activeGameId ? (
                    <button
                      type="button"
                      className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px]"
                      onClick={enterGame}
                    >
                      <ArrowRightIcon weight="bold" className="h-4.5 w-4.5" />
                      {room.currentUserAccess === 'spectator'
                        ? 'Watch game'
                        : 'Enter game'}
                    </button>
                  ) : null}

                  {exitActionLabel ? (
                    <button
                      type="button"
                      disabled={exitIsPending}
                      className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.1)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={exitRoom}
                    >
                      <SignOutIcon weight="bold" className="h-4.5 w-4.5" />
                      {exitIsPending ? exitPendingLabel : exitActionLabel}
                    </button>
                  ) : null}
                </aside>
              </section>

              <section className="rounded-[28px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-4 shadow-[0_20px_56px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="app-kicker">Players</p>
                    <h2 className="display-title mt-1 text-2xl font-semibold text-[var(--sea-ink)]">
                      Seats
                    </h2>
                  </div>
                  <span className="text-sm font-black text-[var(--sea-ink-soft)]">
                    {displayedRoomPlayers.length}/{room.maxPlayers}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {displayedRoomPlayers.map((player) => (
                    <PlayerSeat
                      key={player.key}
                      player={player.player}
                      showStatus={room.status !== 'waiting'}
                    />
                  ))}
                </div>
              </section>

              <RoomInviteDialog
                isOpen={isInviteOpen}
                query={inviteQuery}
                selectedUsername={selectedInviteUsername}
                friends={inviteFriends}
                results={inviteResults}
                isSearching={userSearch.isFetching}
                isSending={rooms.inviteToRoom.isPending}
                onClose={closeInviteDialog}
                onQueryChange={updateInviteQuery}
                onSelectUser={setSelectedInviteUsername}
                onInvite={inviteFriend}
              />
            </>
          ) : null}
        </div>
      </section>
      {routeTransitionLabel ? (
        <RouteTransitionOverlay label={routeTransitionLabel} />
      ) : null}
    </main>
  )
}

function getExitActionLabel({
  access,
  isHost,
  status,
}: {
  access?: string
  isHost: boolean
  status?: string
}) {
  if (access === 'spectator') {
    return 'Stop spectating'
  }

  if (access !== 'player') {
    return null
  }

  return isHost && status === 'waiting' ? 'Cancel room' : 'Leave room'
}

function getExitPendingLabel({
  access,
  isHost,
  status,
}: {
  access?: string
  isHost: boolean
  status?: string
}) {
  if (access === 'spectator') {
    return 'Stopping...'
  }

  return isHost && status === 'waiting' ? 'Cancelling...' : 'Leaving...'
}

function getRoomStatusCopy({
  access,
  isHost,
  status,
  playersAtTable,
}: {
  access?: string
  isHost: boolean
  status: string
  playersAtTable: number
}) {
  if (status === 'active') {
    return access === 'spectator'
      ? 'You are watching this table.'
      : 'Your table is live.'
  }

  if (status !== 'waiting') {
    return 'This room is no longer waiting for players.'
  }

  if (isHost) {
    return playersAtTable > 0
      ? 'Start when the table is ready. Empty seats can be filled by bots.'
      : 'Waiting for at least one player to take a seat.'
  }

  if (access === 'none') {
    return 'Join the room to take an open seat.'
  }

  return 'Waiting for the host to start the room.'
}

function filterInviteResults({
  currentUsername,
  players,
  results,
}: {
  currentUsername?: string
  players: RoomPlayer[]
  results: Array<{ id: string; username: string; avatarUrl: string | null }>
}) {
  const unavailableUsernames = new Set(
    players
      .map((player) => player.username)
      .filter((username): username is string => Boolean(username))
      .map((username) => username.toLowerCase()),
  )

  if (currentUsername) {
    unavailableUsernames.add(currentUsername.toLowerCase())
  }

  return results.filter(
    (user) => !unavailableUsernames.has(user.username.toLowerCase()),
  )
}

function friendsToInviteCandidates(friends: FriendSummary[]) {
  return friends.map((friend) => ({
    id: friend.userId,
    username: friend.username,
    avatarUrl: null,
  }))
}

function joinedPlayers(players: RoomPlayer[]) {
  return players.filter((player) => player.status === 'joined')
}

function buildSeats(players: RoomPlayer[], maxPlayers: number) {
  const joined = joinedPlayers(players)

  return Array.from({ length: maxPlayers }, (_, index) => {
    const seatNumber = index + 1
    const player = joined.find((item) => item.seatNumber === seatNumber) ?? null

    return {
      key: player?.id ?? `empty-${seatNumber}`,
      player,
    }
  })
}

function getDisplayedRoomPlayers(room: {
  players: RoomPlayer[]
  maxPlayers: number
  status: string
}) {
  if (room.status === 'waiting') {
    return buildSeats(room.players, room.maxPlayers)
  }

  return room.players
    .filter((player) => player.status !== 'kicked')
    .sort((first, second) => first.seatNumber - second.seatNumber)
    .map((player) => ({
      key: player.id,
      player,
    }))
}

function PlayerSeat({
  player,
  showStatus = false,
}: {
  player: RoomPlayer | null
  showStatus?: boolean
}) {
  const playerName = player ? player.username ?? player.botName ?? 'Bot' : 'Open seat'
  const playerMeta = player
    ? showStatus && player.status !== 'joined'
      ? `${player.playerType} - ${player.status}`
      : player.playerType
    : 'Waiting'

  return (
    <div className="flex min-h-14 items-center gap-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--bg-base)] text-[var(--sea-ink)]">
        <UserIcon weight="bold" className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        {player?.username ? (
          <Link
            to="/users/$username"
            params={{ username: player.username }}
            className="block truncate text-sm font-black leading-5 text-[var(--sea-ink)] outline-none transition hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {playerName}
          </Link>
        ) : (
          <p className="truncate text-sm font-black leading-5 text-[var(--sea-ink)]">
            {playerName}
          </p>
        )}
        <p className="text-xs font-bold capitalize leading-4 text-[var(--sea-ink-soft)]">
          {playerMeta}
        </p>
      </div>
    </div>
  )
}

function RoomStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--bg-base)] text-[var(--sea-ink)]">
        <Icon weight="bold" className="h-4 w-4" />
      </span>
      <p className="mt-2 truncate text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--sea-ink-soft)]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-base font-black text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}
