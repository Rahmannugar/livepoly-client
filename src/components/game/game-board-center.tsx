import { DiceRollDisplay } from './game-primitives'
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
      : dice
        ? `${dice[0]} + ${dice[1]}`
        : null
  const copy = gameClosed
    ? phase === 'cancelled'
      ? 'This game was cancelled.'
      : 'Final results appear below.'
    : access === 'spectator'
      ? 'Watching live.'
      : isCurrentTurn
        ? 'Your move.'
        : null

  return (
    <div className="col-start-2 col-end-11 row-start-2 row-end-11 grid place-items-center rounded-[14px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_82%,transparent)] p-2 text-center sm:rounded-[24px] sm:p-5">
      <div className="grid w-full place-items-center gap-2 sm:gap-5">
        <div className="grid w-full max-w-md grid-cols-2 gap-2 sm:gap-3">
          <DeckCard label="Chance" tone="chance" />
          <DeckCard label="World Fund" tone="fund" />
        </div>

        <div>
          <p className="display-title text-xl font-semibold text-[var(--sea-ink)] sm:text-4xl">
            {APP_NAME}
          </p>
          <DiceRollDisplay
            dice={dice}
            isRolling={!gameClosed && isRollingDice}
          />
          {title ? (
            <p className="display-title mt-1 text-2xl font-semibold text-[var(--sea-ink)] sm:mt-3 sm:text-4xl">
              {title}
            </p>
          ) : null}
          {copy ? (
            <p className="mt-1 text-xs font-semibold leading-5 text-[var(--sea-ink-soft)] sm:mt-3 sm:text-sm sm:leading-6">
              {copy}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function DeckCard({ label, tone }: { label: string; tone: 'chance' | 'fund' }) {
  return (
    <div className="game-deck-card-stack relative min-h-11 sm:min-h-20">
      <span
        aria-hidden="true"
        className="game-deck-card-layer game-deck-card-layer--back"
      />
      <span
        aria-hidden="true"
        className="game-deck-card-layer game-deck-card-layer--middle"
      />
      <div
        className={`game-deck-card game-deck-card--${tone} relative z-10 grid h-full min-h-11 place-items-center rounded-lg border border-[var(--line)] px-2 py-2 shadow-[0_18px_44px_rgba(4,12,15,0.16)] sm:min-h-20 sm:rounded-xl sm:px-3 sm:py-4`}
      >
        <span className="text-center text-[0.42rem] font-black uppercase tracking-[0.08em] text-[var(--sea-ink)] sm:text-[0.62rem] sm:tracking-[0.12em]">
          {label}
        </span>
      </div>
    </div>
  )
}
