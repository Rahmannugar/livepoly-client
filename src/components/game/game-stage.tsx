import { SpinnerGapIcon } from '@phosphor-icons/react'
import { GameBoard } from './game-board'
import { GameTurnSummary } from './game-turn-summary'
import { getPlayerName, type GameTile } from '#/lib/game/game-board'
import type { GamePhase, GamePlayer, GameState } from '#/lib/game/game.types'

export function GameStage({
  state,
  access,
  status,
  currentTurnPlayer,
  activeTile,
  turnConsequence,
  isCurrentTurn,
  isRollingDice,
  remainingTurnTimeMs,
  onSelectTile,
}: {
  state: GameState | null
  access: string | null
  status: string
  currentTurnPlayer: GamePlayer | null
  activeTile: GameTile | null
  turnConsequence: string
  isCurrentTurn: boolean
  isRollingDice: boolean
  remainingTurnTimeMs: number | null
  onSelectTile: (tile: GameTile) => void
}) {
  const gameClosed = state?.phase === 'finished' || state?.phase === 'cancelled'

  return (
    <section className="order-1 rounded-lg border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_78%,transparent)] p-2.5 shadow-[0_28px_90px_rgba(4,12,15,0.18)] backdrop-blur-xl sm:rounded-xl sm:p-3 xl:order-2 xl:p-4">
      <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <GameStageTitle
          phase={state?.phase}
          player={currentTurnPlayer}
          gameClosed={gameClosed}
        />
        <GameStatusBadge status={status} />
      </div>

      <GameTurnSummary
        phase={state?.phase}
        dice={state?.lastDiceRoll}
        tile={activeTile}
        consequence={turnConsequence}
        remainingTurnTimeMs={remainingTurnTimeMs}
      />

      <GameBoard
        state={state}
        access={access}
        isCurrentTurn={isCurrentTurn}
        isRollingDice={isRollingDice}
        onSelectTile={onSelectTile}
      />
    </section>
  )
}

function GameStageTitle({
  phase,
  player,
  gameClosed,
}: {
  phase: GamePhase | undefined
  player: GamePlayer | null
  gameClosed: boolean
}) {
  if (gameClosed) {
    return (
      <div className="min-w-0">
        <h1 className="display-title max-w-full truncate text-xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-2xl 2xl:text-3xl">
          {phase === 'cancelled' ? 'Game cancelled.' : 'Game over.'}
        </h1>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="min-w-0">
        <h1 className="display-title max-w-full truncate text-xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-2xl 2xl:text-3xl">
          Opening the game.
        </h1>
      </div>
    )
  }

  return (
    <div className="min-w-0">
      <h1 className="display-title flex max-w-full items-baseline gap-2 text-xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-2xl 2xl:text-3xl">
        <span className="min-w-0 truncate" title={getPlayerName(player)}>
          {getPlayerName(player)}
        </span>
        <span className="shrink-0">is up.</span>
      </h1>
    </div>
  )
}

function GameStatusBadge({ status }: { status: string }) {
  if (status === 'joined') {
    return null
  }

  return (
    <span className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-xs font-black capitalize text-[var(--sea-ink)]">
      {status === 'connecting' ? (
        <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
      ) : null}
      {status}
    </span>
  )
}
