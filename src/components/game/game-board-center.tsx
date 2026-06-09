import { DiceRollDisplay } from './game-primitives'
import { formatDice } from '#/lib/game/game-board'
import { APP_NAME } from '#/config/app.constants'
import type { GamePhase } from '#/lib/game/game.types'

export function GameBoardCenter({
  dice,
  access,
  isCurrentTurn,
  isRollingDice,
  phase,
}: {
  dice?: readonly [number, number] | null
  access: string | null
  isCurrentTurn: boolean
  isRollingDice: boolean
  phase: GamePhase | undefined
}) {
  const gameClosed = phase === 'finished' || phase === 'cancelled'
  const title = gameClosed
    ? phase === 'cancelled'
      ? 'Game cancelled'
      : 'Game over'
    : isRollingDice
      ? 'Rolling...'
      : formatDice(dice)
  const copy = gameClosed
    ? phase === 'cancelled'
      ? 'This game was cancelled.'
      : 'Final results are being saved.'
    : access === 'spectator'
      ? 'Watching this game live.'
      : isCurrentTurn
        ? 'Your move.'
        : 'Waiting for the next move.'

  return (
    <div className="col-start-2 col-end-11 row-start-2 row-end-11 grid place-items-center rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_82%,transparent)] p-5 text-center">
      <div>
        <p className="display-title text-3xl font-semibold text-[var(--sea-ink)] sm:text-4xl">
          {APP_NAME}
        </p>
        <DiceRollDisplay dice={dice} isRolling={!gameClosed && isRollingDice} />
        <p className="display-title mt-3 text-4xl font-semibold text-[var(--sea-ink)]">
          {title}
        </p>
        <p className="mt-3 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
          {copy}
        </p>
      </div>
    </div>
  )
}
