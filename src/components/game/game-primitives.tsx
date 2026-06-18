import { CaretDownIcon, SpinnerGapIcon, type Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { GamePlayer } from '#/lib/game/game.types'
import { getPlayerColor } from '#/lib/game/game-board'

export function GamePanel({
  title,
  icon: IconComponent,
  children,
  defaultCollapsed = false,
  collapsible = true,
}: {
  title: string
  icon: Icon
  children: ReactNode
  defaultCollapsed?: boolean
  collapsible?: boolean
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const isCollapsed = collapsible && collapsed
  const headerContent = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--sea-ink)]">
        <IconComponent weight="bold" className="h-5 w-5" />
      </span>
      <h2 className="display-title min-w-0 flex-1 truncate text-2xl font-semibold text-[var(--sea-ink)]">
        {title}
      </h2>
      {collapsible ? (
        <CaretDownIcon
          weight="bold"
          className={`h-5 w-5 shrink-0 text-[var(--sea-ink-soft)] transition duration-300 ${
            isCollapsed ? '' : 'rotate-180'
          }`}
        />
      ) : null}
    </>
  )

  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-4 shadow-[0_18px_55px_rgba(4,12,15,0.12)] backdrop-blur-xl">
      {collapsible ? (
        <button
          type="button"
          aria-expanded={!isCollapsed}
          className="flex w-full min-w-0 items-center gap-2 text-left"
          onClick={() => setCollapsed((value) => !value)}
        >
          {headerContent}
        </button>
      ) : (
        <div className="flex w-full min-w-0 items-center gap-2 text-left">
          {headerContent}
        </div>
      )}
      <div className={`game-collapsible ${isCollapsed ? '' : 'game-collapsible--open'}`}>
        <div className="pt-4">{children}</div>
      </div>
    </section>
  )
}

export function StatePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.14em]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black capitalize text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm font-bold text-[var(--sea-ink-soft)]">
      <SpinnerGapIcon weight="bold" className="h-5 w-5 animate-spin" />
      {label}
    </div>
  )
}

export function PlayerToken({
  player,
  compact = false,
  isActive = false,
}: {
  player: GamePlayer
  compact?: boolean
  isActive?: boolean
}) {
  return (
    <span
      className={`player-token ${isActive ? 'player-token--active' : ''} ${
        compact
          ? 'grid h-2 w-2 place-items-center rounded-full text-[0.28rem] font-black text-white shadow-sm sm:h-3.5 sm:w-3.5 sm:text-[0.48rem] xl:h-4 xl:w-4 xl:text-[0.54rem] 2xl:h-5 2xl:w-5 2xl:text-[0.62rem]'
          : 'grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black text-white shadow-sm'
      }`}
      style={{ backgroundColor: getPlayerColor(player.seatNumber) }}
    >
      {player.seatNumber}
    </span>
  )
}

export function DiceRollDisplay({
  dice,
  isRolling,
}: {
  dice?: readonly [number, number] | null
  isRolling: boolean
}) {
  if (!dice && !isRolling) {
    return null
  }

  const values = dice ?? ([1, 1] as const)

  return (
    <div
      className="dice-display"
      aria-live="polite"
      aria-label={
        isRolling
          ? 'Rolling dice'
          : dice
            ? `Dice rolled ${dice[0]} and ${dice[1]}`
            : 'Dice'
      }
    >
      <DieFace value={isRolling ? null : values[0]} isRolling={isRolling} />
      <DieFace value={isRolling ? null : values[1]} isRolling={isRolling} />
    </div>
  )
}

const diePipsByValue: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

function DieFace({
  value,
  isRolling,
}: {
  value: number | null
  isRolling: boolean
}) {
  const filledPips = value ? diePipsByValue[value] : []

  return (
    <span className={`dice-face ${isRolling ? 'dice-face--rolling' : ''}`}>
      {Array.from({ length: 9 }).map((_, index) => (
        <span
          key={index}
          className={`dice-pip ${
            filledPips.includes(index) ? 'dice-pip--filled' : ''
          }`}
        />
      ))}
    </span>
  )
}
