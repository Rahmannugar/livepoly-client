import {
  ArrowRightIcon,
  DoorOpenIcon,
  EyeIcon,
  SpinnerGapIcon,
  UsersIcon,
  XIcon,
} from '@phosphor-icons/react'
import type { Room } from '#/lib/rooms/rooms.types'

type LiveRoomsDialogProps = {
  isOpen: boolean
  rooms: Room[]
  isLoading: boolean
  isJoining: boolean
  isSpectating: boolean
  onClose: () => void
  onJoin: (code: string) => void
  onSpectate: (code: string) => void
  onOpenRoom: (code: string) => void
}

export function LiveRoomsDialog({
  isOpen,
  rooms,
  isLoading,
  isJoining,
  isSpectating,
  onClose,
  onJoin,
  onSpectate,
  onOpenRoom,
}: LiveRoomsDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center px-4 pb-4 pt-16 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-rooms-title"
    >
      <button
        type="button"
        aria-label="Close live rooms"
        className="dialog-backdrop-enter absolute inset-0 cursor-default bg-[rgba(4,12,15,0.62)] backdrop-blur-md"
        onClick={onClose}
      />

      <section className="dialog-panel-enter relative w-full max-w-2xl rounded-[30px] border border-[var(--line)] bg-[var(--bg-base)] p-5 shadow-[0_28px_90px_rgba(4,12,15,0.32)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="app-kicker">Live rooms</p>
            <h2
              id="live-rooms-title"
              className="display-title mt-3 text-3xl font-semibold text-[var(--sea-ink)]"
            >
              Find a table.
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
              Join open rooms or watch matches already in progress.
            </p>
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

        <div className="mt-5 max-h-[min(64vh,32rem)] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="grid min-h-44 place-items-center rounded-3xl border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink-soft)]">
              <SpinnerGapIcon weight="bold" className="h-7 w-7 animate-spin" />
            </div>
          ) : null}

          {!isLoading && rooms.length === 0 ? (
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="text-base font-black text-[var(--sea-ink)]">
                No open tables right now.
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                Create a room and be the first host on the board.
              </p>
            </div>
          ) : null}

          <div className="grid gap-3">
            {rooms.map((room) => {
              const joinedPlayers = room.players.filter(
                (player) => player.status === 'joined',
              )
              const isWaiting = room.status === 'waiting'
              const isCurrentPlayer = room.currentUserAccess === 'player'
              const isCurrentSpectator = room.currentUserAccess === 'spectator'
              const shouldOpenRoom = isCurrentPlayer || isCurrentSpectator
              const actionLabel = isCurrentPlayer
                ? 'Join room'
                : isCurrentSpectator
                  ? 'Open room'
                  : isWaiting
                    ? 'Join room'
                    : 'Spectate'
              const ActionIcon =
                isCurrentPlayer || isWaiting ? DoorOpenIcon : EyeIcon
              const isBusy = shouldOpenRoom
                ? false
                : isWaiting
                  ? isJoining
                  : isSpectating

              return (
                <article
                  key={room.id}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      className="min-w-0 text-left"
                      onClick={() => onOpenRoom(room.code)}
                    >
                      <span className="app-kicker">
                        {room.status === 'waiting'
                          ? 'Waiting room'
                          : 'Live match'}
                      </span>
                      <span className="display-title mt-2 block text-3xl font-semibold text-[var(--sea-ink)]">
                        Room {room.code}
                      </span>
                      <span className="mt-2 flex flex-wrap items-center gap-3 text-sm font-bold text-[var(--sea-ink-soft)]">
                        <span className="inline-flex items-center gap-1.5">
                          <UsersIcon weight="bold" className="h-4 w-4" />
                          {joinedPlayers.length}/{room.maxPlayers}
                        </span>
                        <span>{room.durationMinutes}m</span>
                        <span>{room.spectatorCount} watching</span>
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() =>
                        shouldOpenRoom
                          ? onOpenRoom(room.code)
                          : isWaiting
                            ? onJoin(room.code)
                            : onSpectate(room.code)
                      }
                    >
                      <ActionIcon weight="bold" className="h-4.5 w-4.5" />
                      {isBusy ? 'Opening...' : actionLabel}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px]"
          onClick={onClose}
        >
          Close
          <ArrowRightIcon weight="bold" className="h-4.5 w-4.5" />
        </button>
      </section>
    </div>
  )
}
