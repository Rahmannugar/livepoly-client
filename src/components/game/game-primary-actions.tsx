import { SpinnerGapIcon } from '@phosphor-icons/react'
import { formatCash, getTilePurchasePrice, type GameTile } from '#/lib/game/game-board'

export type PrimaryGameAction = {
  command: 'roll' | 'endTurn' | 'propertyDecision' | null
  enabled: boolean
  label: string
  copy: string
}

export function PropertyDecisionActions({
  tile,
  commandPending,
  onBuyProperty,
  onDeclinePropertyPurchase,
}: {
  tile: GameTile | null
  commandPending: boolean
  onBuyProperty: () => void
  onDeclinePropertyPurchase: () => void
}) {
  const purchasePrice = getTilePurchasePrice(tile)

  return (
    <div className="grid gap-3">
      {tile ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
            Landed on
          </p>
          <p className="mt-1 text-lg font-black text-[var(--sea-ink)]">
            {tile.name}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black text-[var(--sea-ink)]">
            {purchasePrice !== null ? (
              <span className="rounded-full border border-[var(--line)] px-3 py-2">
                Price {formatCash(purchasePrice)}
              </span>
            ) : null}
            {tile.mortgageValue ? (
              <span className="rounded-full border border-[var(--line)] px-3 py-2">
                Mortgage {formatCash(tile.mortgageValue)}
              </span>
            ) : null}
            {tile.houseCost ? (
              <span className="rounded-full border border-[var(--line)] px-3 py-2">
                Build {formatCash(tile.houseCost)}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
      <button
        type="button"
        disabled={commandPending}
        className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
          commandPending ? 'game-command-button--active' : ''
        }`}
        onClick={onBuyProperty}
      >
        {commandPending ? (
          <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
        ) : null}
        Buy property
      </button>
      <button
        type="button"
        disabled={commandPending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
        onClick={onDeclinePropertyPurchase}
      >
        Start auction
      </button>
    </div>
  )
}

export function PrimaryActionButton({
  primaryAction,
  commandPending,
  onRollAndMove,
  onEndTurn,
}: {
  primaryAction: PrimaryGameAction
  commandPending: boolean
  onRollAndMove: () => void
  onEndTurn: () => void
}) {
  return (
    <button
      type="button"
      disabled={!primaryAction.enabled || commandPending}
      className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-bold shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed ${
        primaryAction.enabled
          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
          : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)]'
      } ${commandPending ? 'game-command-button--active' : ''}`}
      onClick={() => {
        if (primaryAction.command === 'roll') {
          onRollAndMove()
          return
        }

        if (primaryAction.command === 'endTurn') {
          onEndTurn()
        }
      }}
    >
      {commandPending ? (
        <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
      ) : null}
      {commandPending ? 'Sending...' : primaryAction.label}
    </button>
  )
}
