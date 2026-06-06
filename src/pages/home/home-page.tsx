import {
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  DoorOpenIcon,
  MedalIcon,
  PlusIcon,
  SignOutIcon,
  UserIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState, type ComponentType } from 'react'
import { APP_NAME } from '#/config/app.constants'
import { useToast } from '#/components/common/toast'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { useAuth } from '#/lib/auth/useAuth'
import {
  DEFAULT_ROOM_DURATION_MINUTES,
  ROOM_DURATIONS,
} from '#/lib/rooms/rooms.constants'
import { useRooms } from '#/lib/rooms/useRooms'
import type { RoomDurationMinutes } from '#/lib/rooms/rooms.types'

type HomePanel = 'create' | 'join'

type HomeAction = {
  title: string
  description: string
  icon: ComponentType<{ weight?: 'bold'; className?: string }>
  panel?: HomePanel
}

const homeActions: HomeAction[] = [
  {
    title: 'Create room',
    description: 'Start a table and invite friends to play.',
    icon: PlusIcon,
    panel: 'create',
  },
  {
    title: 'Join room',
    description: 'Enter a room code and jump into a match.',
    icon: DoorOpenIcon,
    panel: 'join',
  },
  {
    title: 'Friends',
    description: 'Find players, manage requests, and build your table circle.',
    icon: UsersIcon,
  },
  {
    title: 'Stats',
    description: 'Track wins, placements, rating, and your match history.',
    icon: ChartLineUpIcon,
  },
  {
    title: 'Leaderboard',
    description: 'See how your current rating stacks up.',
    icon: MedalIcon,
  },
  {
    title: 'Recent matches',
    description: 'Review finished games and results.',
    icon: ClockCounterClockwiseIcon,
  },
]

export function HomePage() {
  const auth = useAuth()
  const rooms = useRooms()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const user = auth.currentUser.data
  const displayName = user?.username ?? 'player'
  const [activePanel, setActivePanel] = useState<HomePanel>('create')
  const [durationMinutes, setDurationMinutes] =
    useState<RoomDurationMinutes>(DEFAULT_ROOM_DURATION_MINUTES)
  const [roomCode, setRoomCode] = useState('')

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
          showToast({ kind: 'success', message: `Room ${room.code} created.` })
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
        showToast({ kind: 'success', message: `Joined room ${room.code}.` })
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

            <div
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] sm:h-10 sm:w-10"
            >
              <UserIcon weight="bold" className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>

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
              Create a room, join a table, or check how your last games played
              out.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_1.15fr]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {homeActions.map((action) => (
              <button
                key={action.title}
                type="button"
                className={[
                  'group min-h-32 rounded-[26px] border bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-5 text-left shadow-[0_18px_45px_rgba(8,28,32,0.1)] backdrop-blur-xl transition hover:translate-y-[-2px] hover:border-[var(--primary)]',
                  action.panel === activePanel
                    ? 'border-[var(--primary)]'
                    : 'border-[var(--line)]',
                ].join(' ')}
                onClick={() => {
                  if (action.panel) {
                    setActivePanel(action.panel)
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

            <section className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-5 shadow-[0_24px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-6">
              {activePanel === 'create' ? (
                <div>
                  <p className="app-kicker">New table</p>
                  <h2 className="display-title mt-3 text-3xl font-semibold text-[var(--sea-ink)]">
                    Create a room.
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                    Pick a match length, then share the room code with friends.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {ROOM_DURATIONS.map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        className={[
                          'h-11 rounded-2xl border text-sm font-black transition hover:translate-y-[-1px]',
                          durationMinutes === duration
                            ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                            : 'border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)]',
                        ].join(' ')}
                        onClick={() => setDurationMinutes(duration)}
                      >
                        {duration}m
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={rooms.createRoom.isPending}
                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleCreateRoom}
                  >
                    {rooms.createRoom.isPending ? 'Creating room...' : 'Create room'}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="app-kicker">Room code</p>
                  <h2 className="display-title mt-3 text-3xl font-semibold text-[var(--sea-ink)]">
                    Join a room.
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                    Enter the code from your host and take a seat at the table.
                  </p>

                  <label className="mt-5 grid gap-2">
                    <span className="text-sm font-bold text-[var(--sea-ink)]">
                      Room code
                    </span>
                    <input
                      type="text"
                      value={roomCode}
                      autoCapitalize="characters"
                      autoComplete="off"
                      spellCheck={false}
                      className="h-12 rounded-2xl border border-[var(--line)] bg-[var(--bg-base)] px-4 text-center text-lg font-black tracking-[0.18em] text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
                      onChange={(event) =>
                        setRoomCode(event.target.value.trim())
                      }
                    />
                  </label>

                  <button
                    type="button"
                    disabled={rooms.joinRoom.isPending}
                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleJoinRoom}
                  >
                    {rooms.joinRoom.isPending ? 'Joining room...' : 'Join room'}
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
