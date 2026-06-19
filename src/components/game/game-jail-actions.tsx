import { SpinnerGapIcon } from '@phosphor-icons/react'
import { formatCash } from '#/lib/game/game-board'
import type { GamePlayer } from '#/lib/game/game.types'
import { StatePill } from './game-primitives'

export function JailActions({
  player,
  commandPending,
  onRoll,
  onPayFine,
  onUseCard,
}: {
  player: GamePlayer | null
  commandPending: boolean
  onRoll: () => void
  onPayFine: () => void
  onUseCard: () => void
}) {
  const canPayFine = Boolean(player && player.cash >= 50)
  const cardCount = player?.getOutOfJailFreeCards ?? 0
  const canUseCard = cardCount > 0

  return (
    <div className="game-jail-panel grid gap-4">
      <div>
        <p className="app-kicker">Jail</p>
        <h3 className="display-title mt-1 text-2xl font-semibold text-[var(--sea-ink)] sm:text-3xl">
          Choose your move.
        </h3>
        <p className="mt-2 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          Roll doubles, pay {formatCash(50)}, or use a card.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatePill label="Attempts" value={`${player?.jailTurnCount ?? 0}/3`} />
        <StatePill label="Cards" value={`${cardCount}`} />
        <StatePill
          label="Cash"
          value={player ? formatCash(player.cash) : '...'}
        />
      </div>

      <div className="grid gap-2">
        <button
          type="button"
          disabled={commandPending}
          className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
            commandPending ? 'game-command-button--active' : ''
          }`}
          onClick={onRoll}
        >
          {commandPending ? (
            <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
          ) : null}
          Roll for doubles
        </button>
        <div className={`grid gap-2 ${canUseCard ? 'sm:grid-cols-2' : ''}`}>
          <button
            type="button"
            disabled={!canPayFine || commandPending}
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
            onClick={onPayFine}
          >
            Pay {formatCash(50)}
          </button>
          {canUseCard ? (
            <button
              type="button"
              disabled={commandPending}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-bold leading-4 text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
              onClick={onUseCard}
            >
              Use jail card
            </button>
          ) : null}
        </div>
      </div>

      {!canPayFine ? (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          You need {formatCash(50)} cash to pay the fine.
        </p>
      ) : null}
    </div>
  )
}
