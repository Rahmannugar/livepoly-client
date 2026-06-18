import {
  BellIcon,
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  DoorOpenIcon,
  EyeIcon,
  GameControllerIcon,
  MedalIcon,
  PlusIcon,
  SignOutIcon,
  UserIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState, type ComponentType } from 'react'
import {
  getInitialRoomDuration,
  RoomActionDialog,
} from '#/components/rooms/room-action-dialog'
import { LiveRoomsDialog } from '#/components/rooms/live-rooms-dialog'
import { RouteTransitionOverlay } from '#/components/common/route-transition-overlay'
import { APP_NAME } from '#/config/app.constants'
import { useToast } from '#/components/common/toast'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { useAuth } from '#/lib/auth/useAuth'
import { useUnreadNotificationCount } from '#/lib/notifications/useNotifications'
import { useCurrentRoom, useLiveRooms, useRooms } from '#/lib/rooms/useRooms'
import { useCurrentUserProfile } from '#/lib/users/useUsers'
import type { RoomDurationMinutes } from '#/lib/rooms/rooms.types'

type RoomActionMode = 'create' | 'join'
type HomeDialogMode = RoomActionMode | 'liveRooms'

type HomeAction = {
  title: string
  description: string
  icon: ComponentType<{ weight?: 'bold'; className?: string }>
  dialog?: HomeDialogMode
  to?: '/friends' | '/stats' | '/leaderboard' | '/matches' | '/notifications'
}

const homeActions: HomeAction[] = [
  {
    title: 'Create room',
    description: 'Start a table and invite friends to play.',
    icon: PlusIcon,
    dialog: 'create',
  },
  {
    title: 'Join room',
    description: 'Enter a room code and jump into a match.',
    icon: DoorOpenIcon,
    dialog: 'join',
  },
  {
    title: 'Live rooms',
    description: 'Browse open tables and matches in progress.',
    icon: EyeIcon,
    dialog: 'liveRooms',
  },
  {
    title: 'Friends',
    description: 'Find players, manage requests, and build your table circle.',
    icon: UsersIcon,
    to: '/friends',
  },
  {
    title: 'Stats',
    description: 'Track wins, placements, rating, and your match history.',
    icon: ChartLineUpIcon,
    to: '/stats',
  },
  {
    title: 'Leaderboard',
    description: 'See how your current rating stacks up.',
    icon: MedalIcon,
    to: '/leaderboard',
  },
  {
    title: 'Recent matches',
    description: 'Review finished games and results.',
    icon: ClockCounterClockwiseIcon,
    to: '/matches',
  },
]

export function HomePage() {
  const auth = useAuth()
  const rooms = useRooms()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const user = auth.currentUser.data
  const profile = useCurrentUserProfile(Boolean(user))
  const displayName = user?.username ?? 'player'
  const avatarUrl = profile.data?.avatarUrl
  const [activeDialog, setActiveDialog] = useState<HomeDialogMode | null>(null)
  const [durationMinutes, setDurationMinutes] =
    useState<RoomDurationMinutes>(getInitialRoomDuration)
  const [roomCode, setRoomCode] = useState('')
  const [routeTransitionLabel, setRouteTransitionLabel] = useState<string | null>(
    null,
  )
  const currentRoom = useCurrentRoom(Boolean(user))
  const liveRooms = useLiveRooms(activeDialog === 'liveRooms')
  const unreadNotifications = useUnreadNotificationCount()
  const activeRoomAction =
    activeDialog === 'create' || activeDialog === 'join' ? activeDialog : null

  function handleLogout() {
    auth.logout.mutate(undefined, {
      onSuccess: () => {
        showToast({ kind: 'success', message: 'Signed out successfully.' })
        navigate({ to: '/auth/login' })
      },
      onError: (error) => {
        showToast({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Could not sign you out.',
        })
      },
    })
  }

  function handleCreateRoom() {
    rooms.createRoom.mutate(
      { durationMinutes },
      {
        onSuccess: (room) => {
          setRouteTransitionLabel('Opening room...')
          showToast({ kind: 'success', message: `Room ${room.code} created.` })
          setActiveDialog(null)
          navigate({ to: '/rooms/$code', params: { code: room.code } })
        },
        onError: (error) => {
          showToast({
            kind: 'error',
            message:
              error instanceof Error ? error.message : 'Could not create room.',
          })
        },
      },
    )
  }

  function handleJoinRoom() {
    const normalizedCode = roomCode.trim()

    if (!normalizedCode) {
      showToast({ kind: 'error', message: 'Enter a room code first.' })
      return
    }

    rooms.joinRoom.mutate(normalizedCode, {
      onSuccess: (room) => {
        setRouteTransitionLabel('Opening room...')
        showToast({ kind: 'success', message: `Joined room ${room.code}.` })
        setActiveDialog(null)
        navigate({ to: '/rooms/$code', params: { code: room.code } })
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

  function handleSpectateRoom(code: string) {
    rooms.spectateRoom.mutate(code, {
      onSuccess: () => {
        setRouteTransitionLabel('Opening room...')
        showToast({ kind: 'success', message: `Spectating room ${code}.` })
        setActiveDialog(null)
        navigate({ to: '/rooms/$code', params: { code } })
      },
      onError: (error) => {
        showToast({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Could not spectate room.',
        })
      },
    })
  }

  function openRoom(code: string) {
    setRouteTransitionLabel('Opening room...')
    setActiveDialog(null)
    navigate({ to: '/rooms/$code', params: { code } })
  }

  function resumeCurrentRoom() {
    const room = currentRoom.data

    if (!room) {
      return
    }

    if (room.activeGameId) {
      setRouteTransitionLabel('Opening game...')
      navigate({ to: '/games/$gameId', params: { gameId: room.activeGameId } })
      return
    }

    setRouteTransitionLabel('Opening room...')
    navigate({ to: '/rooms/$code', params: { code: room.code } })
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="grid grid-cols-[1fr_auto] items-center gap-3 sm:flex sm:justify-between">
          <Link
            to="/"
            className="display-title min-w-0 text-[clamp(1.55rem,9vw,2.25rem)] font-semibold leading-none text-[var(--sea-ink)] sm:text-4xl"
          >
            {APP_NAME}
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[var(--sea-ink)]">
                {displayName}
              </p>
              <p className="text-xs font-semibold text-[var(--sea-ink-soft)]">
                Player
              </p>
            </div>

            <Link
              to="/profile"
              aria-label="Open profile"
              className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] sm:h-10 sm:w-10"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon weight="bold" className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              )}
            </Link>

            <Link
              to="/notifications"
              aria-label="Open notifications"
              className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] sm:h-10 sm:w-10"
            >
              <BellIcon weight="bold" className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              {unreadNotifications.count ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--primary)] px-1 text-[0.65rem] font-black text-[var(--primary-foreground)]">
                  {unreadNotifications.count > 9
                    ? '9+'
                    : unreadNotifications.count}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              aria-label="Sign out"
              disabled={auth.logout.isPending}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:w-10"
              onClick={handleLogout}
            >
              <SignOutIcon weight="bold" className="h-5 w-5" />
            </button>

            <ThemeToggle />
          </div>
        </header>

        <div className="grid flex-1 content-center gap-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <h1 className="display-title text-5xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
              Welcome back, {displayName}.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--sea-ink-soft)]">
              Create a room, join a game, or check your stats and leaderboard.
            </p>
          </div>

          {currentRoom.data ? (
            <article className="flex flex-col gap-4 rounded-[28px] border border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_12%,var(--bg-base))] p-5 shadow-[0_22px_60px_rgba(8,28,32,0.14)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--sea-ink)]">
                  <GameControllerIcon weight="bold" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="app-kicker">
                    {currentRoom.data.status === 'waiting'
                      ? 'Room waiting'
                      : 'Game in progress'}
                  </p>
                  <h2 className="display-title mt-1 truncate text-3xl font-semibold text-[var(--sea-ink)]">
                    Room {currentRoom.data.code}
                  </h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                    Rejoin your room and continue from where you stopped.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px]"
                onClick={resumeCurrentRoom}
              >
                {currentRoom.data.activeGameId ? 'Rejoin game' : 'Open room'}
              </button>
            </article>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {homeActions.map((action) => (
              <button
                key={action.title}
                type="button"
                className="group min-h-32 rounded-[26px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-5 text-left shadow-[0_18px_45px_rgba(8,28,32,0.1)] backdrop-blur-xl transition hover:translate-y-[-2px] hover:border-[var(--primary)]"
                onClick={() => {
                  if (action.dialog) {
                    setActiveDialog(action.dialog)
                    return
                  }

                  if (action.to) {
                    navigate({ to: action.to })
                    return
                  }

                  showToast({
                    kind: 'info',
                    message: `${action.title} comes next.`,
                  })
                }}
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_10px_24px_rgba(8,28,32,0.1)] transition group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)]">
                  <action.icon weight="bold" className="h-5 w-5" />
                </span>
                <span className="mt-4 block text-base font-black text-[var(--sea-ink)]">
                  {action.title}
                </span>
                <span className="mt-1 block text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                  {action.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <RoomActionDialog
        mode={activeRoomAction}
        durationMinutes={durationMinutes}
        roomCode={roomCode}
        isCreating={rooms.createRoom.isPending}
        isJoining={rooms.joinRoom.isPending}
        onClose={() => setActiveDialog(null)}
        onCreate={handleCreateRoom}
        onJoin={handleJoinRoom}
        onDurationChange={setDurationMinutes}
        onRoomCodeChange={setRoomCode}
      />

      <LiveRoomsDialog
        isOpen={activeDialog === 'liveRooms'}
        rooms={liveRooms.data ?? []}
        isLoading={liveRooms.isLoading || liveRooms.isFetching}
        isJoining={rooms.joinRoom.isPending}
        isSpectating={rooms.spectateRoom.isPending}
        onClose={() => setActiveDialog(null)}
        onJoin={(code) => {
          rooms.joinRoom.mutate(code, {
            onSuccess: (room) => {
              setRouteTransitionLabel('Opening room...')
              showToast({
                kind: 'success',
                message: `Joined room ${room.code}.`,
              })
              setActiveDialog(null)
              navigate({ to: '/rooms/$code', params: { code: room.code } })
            },
            onError: (error) => {
              showToast({
                kind: 'error',
                message:
                  error instanceof Error
                    ? error.message
                    : 'Could not join room.',
              })
            },
          })
        }}
        onSpectate={handleSpectateRoom}
        onOpenRoom={openRoom}
      />
      {routeTransitionLabel ? (
        <RouteTransitionOverlay label={routeTransitionLabel} />
      ) : null}
    </main>
  )
}
