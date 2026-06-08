import { SpinnerGapIcon } from '@phosphor-icons/react'
export { PropertyDecisionActions } from './game-tile-info'

export type PrimaryGameAction = {
  command: 'roll' | 'endTurn' | 'propertyDecision' | null
  enabled: boolean
  label: string
  copy: string
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
