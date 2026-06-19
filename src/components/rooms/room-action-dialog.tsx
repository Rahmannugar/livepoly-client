import { XIcon } from '@phosphor-icons/react'
import {
  DEFAULT_ROOM_DURATION_MINUTES,
  ROOM_DURATIONS,
} from '#/lib/rooms/rooms.constants'
import type { RoomDurationMinutes } from '#/lib/rooms/rooms.types'

type RoomActionDialogMode = 'create' | 'join'

type RoomActionDialogProps = {
  mode: RoomActionDialogMode | null
  durationMinutes: RoomDurationMinutes
  roomCode: string
  isCreating: boolean
  isJoining: boolean
  onClose: () => void
  onCreate: () => void
  onJoin: () => void
  onDurationChange: (duration: RoomDurationMinutes) => void
  onRoomCodeChange: (code: string) => void
}

export function RoomActionDialog({
  mode,
  durationMinutes,
  roomCode,
  isCreating,
  isJoining,
  onClose,
  onCreate,
  onJoin,
  onDurationChange,
  onRoomCodeChange,
}: RoomActionDialogProps) {
  if (!mode) {
    return null
  }

  const isCreateMode = mode === 'create'

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center pt-12 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-action-title"
    >
      <button
        type="button"
        aria-label="Close room action"
        className="dialog-backdrop-enter absolute inset-0 cursor-default bg-[rgba(4,12,15,0.62)] backdrop-blur-md"
        onClick={onClose}
      />

      <section className="dialog-panel-enter relative w-full max-w-md rounded-t-[24px] border border-b-0 border-[var(--line)] bg-[var(--bg-base)] p-4 shadow-[0_28px_90px_rgba(4,12,15,0.32)] sm:rounded-[30px] sm:border sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="app-kicker">
              {isCreateMode ? 'New game' : 'Room code'}
            </p>
            <h2
              id="room-action-title"
              className="display-title mt-2 text-2xl font-semibold text-[var(--sea-ink)] sm:mt-3 sm:text-3xl"
            >
              {isCreateMode ? 'Create a room.' : 'Join a room.'}
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

        {isCreateMode ? (
          <div className="mt-5">
            <p className="text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
              Pick a casual match length, then share the room code with friends.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5">
              {ROOM_DURATIONS.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  className={[
                    'h-10 rounded-2xl border text-sm font-black transition hover:translate-y-[-1px] sm:h-11',
                    durationMinutes === duration
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)]',
                  ].join(' ')}
                  onClick={() => onDurationChange(duration)}
                >
                  {duration}m
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={isCreating}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-5 sm:h-11"
              onClick={onCreate}
            >
              {isCreating ? 'Creating room...' : 'Create room'}
            </button>
          </div>
        ) : (
          <div className="mt-4 sm:mt-5">
            <p className="text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
              Enter the code from your host and take a seat at the table.
            </p>

            <label className="mt-4 grid gap-2 sm:mt-5">
              <span className="text-sm font-bold text-[var(--sea-ink)]">
                Room code
              </span>
              <input
                type="text"
                value={roomCode}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className="h-11 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 text-center text-lg font-black tracking-[0.18em] text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)] sm:h-12"
                onChange={(event) => onRoomCodeChange(event.target.value)}
              />
            </label>

            <button
              type="button"
              disabled={isJoining}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-5 sm:h-11"
              onClick={onJoin}
            >
              {isJoining ? 'Joining room...' : 'Join room'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export function getInitialRoomDuration(): RoomDurationMinutes {
  return DEFAULT_ROOM_DURATION_MINUTES
}
