import { SpinnerGapIcon } from '@phosphor-icons/react'
import {
  findPlayer,
  formatCash,
  formatDebtReason,
  getPlayerName,
} from '#/lib/game/game-board'
import type { GameDebt, GamePlayer } from '#/lib/game/game.types'
import { StatePill } from './game-primitives'

export function DebtActions({
  debt,
  players,
  roomPlayerId,
  commandPending,
  onPayDebt,
  onDeclareBankruptcy,
}: {
  debt: GameDebt
  players: GamePlayer[]
  roomPlayerId: string | null
  commandPending: boolean
  onPayDebt: () => void
  onDeclareBankruptcy: () => void
}) {
  const debtor = findPlayer(players, debt.roomPlayerId)
  const creditor = findPlayer(players, debt.creditorRoomPlayerId)
  const isDebtor = roomPlayerId === debt.roomPlayerId
  const canPay = Boolean(isDebtor && debtor && debtor.cash >= debt.amount)
  const creditorName = creditor ? getPlayerName(creditor) : 'the bank'
  const shortfall = debtor ? Math.max(debt.amount - debtor.cash, 0) : 0

  return (
    <div className="game-debt-panel grid gap-4">
      <div>
        <p className="app-kicker">Debt</p>
        <h3 className="display-title mt-2 text-3xl font-semibold text-[var(--sea-ink)]">
          {formatCash(debt.amount)} due
        </h3>
        <p className="mt-2 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          {debtor ? getPlayerName(debtor) : 'A player'} owes {creditorName} for{' '}
          {formatDebtReason(debt.reason)}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatePill
          label="Cash"
          value={debtor ? formatCash(debtor.cash) : '...'}
        />
        <StatePill label="Due" value={formatCash(debt.amount)} />
        <StatePill label="Owed to" value={creditorName} />
        <StatePill
          label="Shortfall"
          value={shortfall > 0 ? formatCash(shortfall) : 'None'}
        />
      </div>

      <div className="grid gap-2">
        <button
          type="button"
          disabled={!canPay || commandPending}
          className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
            commandPending ? 'game-command-button--active' : ''
          }`}
          onClick={onPayDebt}
        >
          {commandPending ? (
            <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
          ) : null}
          Pay debt
        </button>
        <button
          type="button"
          disabled={!isDebtor || commandPending}
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-red-500/45 bg-red-500/10 px-5 text-sm font-bold text-red-500 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
          onClick={onDeclareBankruptcy}
        >
          Declare bankruptcy
        </button>
      </div>

      {!isDebtor ? (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          Waiting for {debtor ? getPlayerName(debtor) : 'the indebted player'}{' '}
          to resolve this.
        </p>
      ) : !canPay ? (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          You are short by {formatCash(shortfall)}. Mortgage a property or
          declare bankruptcy.
        </p>
      ) : (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          Pay the debt to continue the game.
        </p>
      )}
    </div>
  )
}
