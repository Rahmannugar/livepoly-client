import {
  ArrowLeftIcon,
  ClockIcon,
  CopyIcon,
  CrownIcon,
  SignOutIcon,
  UserIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { APP_NAME } from '#/config/app.constants'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { useToast } from '#/components/common/toast'
import { useAuth } from '#/lib/auth/useAuth'
import { useRoom, useRooms } from '#/lib/rooms/useRooms'
import type { RoomPlayer } from '#/lib/rooms/rooms.types'

type RoomPageProps = {
  code: string
}

export function RoomPage({ code }: RoomPageProps) {
  const auth = useAuth()
  const rooms = useRooms()
  const roomQuery = useRoom(code)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const user = auth.currentUser.data
  const room = roomQuery.data
  const isHost = Boolean(room && user?.id === room.hostUserId)

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

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="display-title min-w-0 text-[clamp(1.55rem,8vw,2.25rem)] font-semibold leading-none text-[var(--sea-ink)] sm:text-4xl"
          >
            {APP_NAME}
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/"
              aria-label="Back home"
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] transition hover:translate-y-[-1px] sm:h-10 sm:w-10"
            >
              <ArrowLeftIcon weight="bold" className="h-5 w-5" />
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid flex-1 content-center gap-5 py-10 sm:py-14">
          {roomQuery.isLoading ? (
            <p className="display-title text-3xl font-semibold text-[var(--sea-ink)]">
              Opening room...
            </p>
          ) : null}

          {roomQuery.isError ? (
            <section className="max-w-xl rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-6 shadow-[0_24px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl">
              <p className="app-kicker">Room not found</p>
              <h1 className="display-title mt-3 text-4xl font-semibold text-[var(--sea-ink)]">
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
              <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                <div className="rounded-[34px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-6 shadow-[0_24px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-7">
                  <p className="app-kicker">Room lobby</p>
                  <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h1 className="display-title text-5xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
                        Room {room.code}
                      </h1>
                      <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-[var(--sea-ink-soft)]">
                        Share the code, wait for seats to fill, then start the
                        match when the table is ready.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.1)] transition hover:translate-y-[-1px]"
                      onClick={copyRoomCode}
                    >
                      <CopyIcon weight="bold" className="h-4.5 w-4.5" />
                      Copy code
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <RoomStat
                    icon={UsersIcon}
                    label="Seats"
                    value={`${joinedPlayers(room.players).length}/${room.maxPlayers}`}
                  />
                  <RoomStat
                    icon={ClockIcon}
                    label="Duration"
                    value={`${room.durationMinutes}m`}
                  />
                  <RoomStat
                    icon={UserIcon}
                    label="Spectators"
                    value={String(room.spectatorCount)}
                  />
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                <div className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-5 shadow-[0_24px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="app-kicker">Players</p>
                      <h2 className="display-title mt-2 text-3xl font-semibold text-[var(--sea-ink)]">
                        Seats at the table.
                      </h2>
                    </div>
                    {isHost ? (
                      <span className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-black text-[var(--sea-ink)]">
                        <CrownIcon weight="bold" className="h-4 w-4" />
                        Host
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {buildSeats(room.players, room.maxPlayers).map((player) => (
                      <PlayerSeat key={player.key} player={player.player} />
                    ))}
                  </div>
                </div>

                <aside className="rounded-[30px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-5 shadow-[0_24px_70px_rgba(8,28,32,0.12)] backdrop-blur-xl sm:p-6">
                  <p className="app-kicker">Status</p>
                  <h2 className="display-title mt-2 text-3xl font-semibold capitalize text-[var(--sea-ink)]">
                    {room.status}
                  </h2>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                    Gameplay wiring comes next. For now, this lobby confirms
                    room creation, joining, seats, and leaving.
                  </p>

                  <button
                    type="button"
                    disabled={rooms.leaveRoom.isPending}
                    className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.1)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={leaveRoom}
                  >
                    <SignOutIcon weight="bold" className="h-4.5 w-4.5" />
                    {rooms.leaveRoom.isPending ? 'Leaving...' : 'Leave room'}
                  </button>
                </aside>
              </section>
            </>
          ) : null}
        </div>
      </section>
    </main>
  )
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

function PlayerSeat({ player }: { player: RoomPlayer | null }) {
  return (
    <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--bg-base)] text-[var(--sea-ink)]">
        <UserIcon weight="bold" className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-[var(--sea-ink)]">
          {player ? player.username ?? player.botName ?? 'Bot' : 'Open seat'}
        </p>
        <p className="mt-0.5 text-xs font-bold capitalize text-[var(--sea-ink-soft)]">
          {player ? player.playerType : 'Waiting'}
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
    <div className="rounded-[26px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-5 shadow-[0_18px_45px_rgba(8,28,32,0.1)] backdrop-blur-xl">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--sea-ink)]">
        <Icon weight="bold" className="h-5 w-5" />
      </span>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
        {label}
      </p>
      <p className="display-title mt-1 text-3xl font-semibold text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}
