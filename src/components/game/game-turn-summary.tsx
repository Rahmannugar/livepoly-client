import { MapPinIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import {
  formatDice,
  formatPhase,
  getPlayerName,
  type GameTile,
} from '#/lib/game/game-board'
import type { GamePhase, GamePlayer } from '#/lib/game/game.types'

export function GameTurnSummary({
  player,
  phase,
  dice,
  tile,
  consequence,
  isCurrentTurn,
}: {
  player: GamePlayer | null
  phase: GamePhase | undefined
  dice?: readonly [number, number] | null
  tile: GameTile | null
  consequence: string
  isCurrentTurn: boolean
}) {
  return (
    <section className="game-turn-summary mb-4 grid gap-3 rounded-[26px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_78%,transparent)] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
          {formatPhase(phase)}
        </p>
        <p className="mt-1 truncate text-xl font-black text-[var(--sea-ink)] sm:text-2xl">
          {player
            ? `${getPlayerName(player)} ${isCurrentTurn ? 'is making your move.' : 'is taking a turn.'}`
            : 'Opening the game.'}
        </p>
        <p className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          {consequence}
        </p>
      </div>

      <div className="grid gap-2 sm:min-w-56">
        <SummaryPill label="Dice" value={formatDice(dice)} />
        <SummaryPill
          label={tile ? 'Square' : 'Square'}
          value={tile?.name ?? 'Waiting for movement'}
          icon={tile ? <MapPinIcon weight="bold" className="h-4 w-4" /> : null}
        />
      </div>
    </section>
  )
}

function SummaryPill({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
      <span className="shrink-0 text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
        {label}
      </span>
      <span className="flex min-w-0 items-center gap-1.5 text-right text-sm font-black text-[var(--sea-ink)]">
        {icon}
        <span className="truncate">{value}</span>
      </span>
    </div>
  )
}
