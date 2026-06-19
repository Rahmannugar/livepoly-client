import { SpinnerGapIcon } from '@phosphor-icons/react'
import { useState } from 'react'
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
  onManageProperties,
  onDeclareBankruptcy,
}: {
  debt: GameDebt
  players: GamePlayer[]
  roomPlayerId: string | null
  commandPending: boolean
  onPayDebt: () => void
  onManageProperties: () => void
  onDeclareBankruptcy: () => void
}) {
  const [confirmingBankruptcy, setConfirmingBankruptcy] = useState(false)
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
        <h3 className="display-title mt-1 text-2xl font-semibold text-[var(--sea-ink)] sm:text-3xl">
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
        {isDebtor && shortfall > 0 ? (
          <button
            type="button"
            disabled={commandPending}
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
            onClick={onManageProperties}
          >
            Manage properties
          </button>
        ) : null}
        {confirmingBankruptcy ? (
          <div className="grid gap-2 rounded-xl border border-red-500/35 bg-red-500/10 p-3">
            <p className="text-sm font-black text-red-300">
              Bankruptcy removes you from this game.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!isDebtor || commandPending}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-500 px-3 text-sm font-bold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
                onClick={onDeclareBankruptcy}
              >
                Confirm
              </button>
              <button
                type="button"
                disabled={commandPending}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--sea-ink)]"
                onClick={() => setConfirmingBankruptcy(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={!isDebtor || commandPending}
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-red-500/45 bg-red-500/10 px-5 text-sm font-bold text-red-400 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => setConfirmingBankruptcy(true)}
          >
            Declare bankruptcy
          </button>
        )}
      </div>

      {!isDebtor ? (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          {debtor ? getPlayerName(debtor) : 'The indebted player'} must settle
          this.
        </p>
      ) : !canPay ? (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          You are short by {formatCash(shortfall)}.
        </p>
      ) : (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          Pay the debt to continue the game.
        </p>
      )}
    </div>
  )
}
