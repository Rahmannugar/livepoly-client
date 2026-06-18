import { MapPinIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { formatDice, formatPhase, type GameTile } from '#/lib/game/game-board'
import { formatRemainingMatchTime } from '#/lib/game/game-time'
import type { GamePhase } from '#/lib/game/game.types'

export function GameTurnSummary({
  phase,
  dice,
  tile,
  consequence,
  remainingTurnTimeMs,
}: {
  phase: GamePhase | undefined
  dice?: readonly [number, number] | null
  tile: GameTile | null
  consequence: string
  remainingTurnTimeMs: number | null
}) {
  return (
    <section className="game-turn-summary mb-3 grid gap-3 rounded-[22px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_72%,transparent)] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
          {formatPhase(phase)}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-bold leading-6 text-[var(--sea-ink)]">
          {consequence}
        </p>
      </div>

      <div className="flex min-w-0 flex-wrap gap-2 sm:max-w-80 sm:justify-end">
        <SummaryPill
          ariaLabel="Turn time"
          value={formatRemainingMatchTime(remainingTurnTimeMs)}
        />
        {dice ? <SummaryPill ariaLabel="Dice" value={formatDice(dice)} /> : null}
        <SummaryPill
          ariaLabel="Square"
          value={tile?.name ?? 'No square yet'}
          icon={tile ? <MapPinIcon weight="bold" className="h-4 w-4" /> : null}
        />
      </div>
    </section>
  )
}

function SummaryPill({
  ariaLabel,
  value,
  icon,
}: {
  ariaLabel: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div
      className="flex min-w-0 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
      aria-label={`${ariaLabel}: ${value}`}
      title={`${ariaLabel}: ${value}`}
    >
      <span className="flex min-w-0 items-center gap-1.5 text-right text-sm font-black text-[var(--sea-ink)]">
        {icon}
        <span className="truncate">{value}</span>
      </span>
    </div>
  )
}
