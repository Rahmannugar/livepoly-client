import { SpinnerGapIcon } from '@phosphor-icons/react'
import { formatCash } from '#/lib/game/game-board'
import type { GamePlayer } from '#/lib/game/game.types'
import { StatePill } from './game-primitives'

export function JailActions({
  player,
  commandPending,
  onRoll,
  onPayFine,
}: {
  player: GamePlayer | null
  commandPending: boolean
  onRoll: () => void
  onPayFine: () => void
}) {
  const canPayFine = Boolean(player && player.cash >= 50)

  return (
    <div className="game-jail-panel grid gap-4">
      <div>
        <p className="app-kicker">Jail</p>
        <h3 className="display-title mt-2 text-3xl font-semibold text-[var(--sea-ink)]">
          Roll doubles or pay {formatCash(50)}.
        </h3>
        <p className="mt-2 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          You can try rolling doubles. After three failed attempts, the fine is
          forced if you can afford it.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatePill
          label="Attempts"
          value={`${player?.jailTurnCount ?? 0}/3`}
        />
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
        <button
          type="button"
          disabled={!canPayFine || commandPending}
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
          onClick={onPayFine}
        >
          Pay {formatCash(50)} fine
        </button>
      </div>

      {!canPayFine ? (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          You need {formatCash(50)} cash to pay the fine.
        </p>
      ) : null}
    </div>
  )
}
