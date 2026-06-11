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
      <div className="grid w-full place-items-center gap-5">
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          <DeckCard label="Chance" tone="chance" />
          <DeckCard label="World Fund" tone="fund" />
        </div>

        <div>
          <p className="display-title text-3xl font-semibold text-[var(--sea-ink)] sm:text-4xl">
            {APP_NAME}
          </p>
          <DiceRollDisplay
            dice={dice}
            isRolling={!gameClosed && isRollingDice}
          />
          <p className="display-title mt-3 text-4xl font-semibold text-[var(--sea-ink)]">
            {title}
          </p>
          <p className="mt-3 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
            {copy}
          </p>
        </div>
      </div>
    </div>
  )
}

function DeckCard({
  label,
  tone,
}: {
  label: string
  tone: 'chance' | 'fund'
}) {
  return (
    <div
      className={`game-deck-card game-deck-card--${tone} grid min-h-20 place-items-center rounded-[18px] border border-[var(--line)] px-3 py-4 shadow-[0_18px_44px_rgba(4,12,15,0.16)]`}
    >
      <span className="text-center text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--sea-ink)]">
        {label}
      </span>
    </div>
  )
}
