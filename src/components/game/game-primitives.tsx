import { CaretDownIcon, SpinnerGapIcon, type Icon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import gsap from 'gsap'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
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
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--sea-ink)] sm:h-9 sm:w-9 sm:rounded-2xl">
        <IconComponent weight="bold" className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>
      <h2 className="display-title min-w-0 flex-1 truncate text-xl font-semibold text-[var(--sea-ink)] sm:text-2xl">
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
    <section className="rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-3 shadow-[0_18px_55px_rgba(4,12,15,0.12)] backdrop-blur-xl sm:rounded-2xl sm:p-4">
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
      <div
        className={`game-collapsible ${isCollapsed ? '' : 'game-collapsible--open'}`}
      >
        <div className="pt-4">{children}</div>
      </div>
    </section>
  )
}

export function StatePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2.5 sm:rounded-2xl sm:p-3">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.14em]">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-black capitalize text-[var(--sea-ink)] sm:text-sm">
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
  const tokenClassName = `player-token ${isActive ? 'player-token--active' : ''} ${
    compact
      ? 'grid h-2 w-2 place-items-center rounded-full text-[0.28rem] font-black text-white shadow-sm sm:h-3.5 sm:w-3.5 sm:text-[0.48rem] xl:h-4 xl:w-4 xl:text-[0.54rem] 2xl:h-5 2xl:w-5 2xl:text-[0.62rem]'
      : 'grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black text-white shadow-sm sm:h-9 sm:w-9 sm:text-sm'
  }`
  const style = { backgroundColor: getPlayerColor(player.seatNumber) }

  if (compact) {
    return (
      <motion.span
        layoutId={`board-token-${player.roomPlayerId}`}
        className={tokenClassName}
        style={style}
        transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.75 }}
      >
        {player.seatNumber}
      </motion.span>
    )
  }

  return (
    <span
      className={tokenClassName}
      style={style}
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
  const diceRef = useRef<HTMLDivElement | null>(null)
  const diceKey = dice ? `${dice[0]}-${dice[1]}` : null

  useEffect(() => {
    if (!diceKey || isRolling || !diceRef.current) {
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const faces = diceRef.current.querySelectorAll('.dice-face')
    gsap.fromTo(
      faces,
      { y: -12, rotate: -8, scale: 0.88 },
      {
        y: 0,
        rotate: 0,
        scale: 1,
        duration: 0.62,
        stagger: 0.08,
        ease: 'elastic.out(1, 0.64)',
        overwrite: 'auto',
      },
    )
  }, [diceKey, isRolling])

  if (!dice && !isRolling) {
    return null
  }

  const values = dice ?? ([1, 1] as const)

  return (
    <div
      ref={diceRef}
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
