import { DiceRollDisplay } from './game-primitives'
import { formatDice } from '#/lib/game/game-board'

export function GameBoardCenter({
  roomCode,
  dice,
  access,
  isCurrentTurn,
  isRollingDice,
}: {
  roomCode?: string
  dice?: readonly [number, number] | null
  access: string | null
  isCurrentTurn: boolean
  isRollingDice: boolean
}) {
  return (
    <div className="col-start-2 col-end-11 row-start-2 row-end-11 grid place-items-center rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_82%,transparent)] p-5 text-center">
      <div>
        <p className="app-kicker">Room {roomCode ?? '...'}</p>
        <DiceRollDisplay dice={dice} isRolling={isRollingDice} />
        <p className="display-title mt-3 text-4xl font-semibold text-[var(--sea-ink)]">
          {isRollingDice ? 'Rolling...' : formatDice(dice)}
        </p>
        <p className="mt-3 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
          {access === 'spectator'
            ? 'Watching this game live.'
            : isCurrentTurn
              ? 'Your move.'
              : 'Waiting for the next move.'}
        </p>
      </div>
    </div>
  )
}
