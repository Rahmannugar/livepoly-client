import { ArrowLeftIcon, SignOutIcon, SpinnerGapIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { APP_NAME } from '#/config/app.constants'

export function GamePageHeader({
  roomCode,
  gameId,
  canLeave = false,
  isLeaving = false,
  onLeave,
}: {
  roomCode?: string | null
  gameId: string
  canLeave?: boolean
  isLeaving?: boolean
  onLeave?: () => void
}) {
  return (
    <header className="flex items-center justify-between gap-2 min-[420px]:gap-3">
      <div className="flex min-w-0 items-center gap-2 min-[420px]:gap-3">
        <Link
          to="/"
          aria-label="Back home"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] transition hover:translate-y-[-1px] min-[420px]:h-9 min-[420px]:w-9 sm:h-10 sm:w-10"
        >
          <ArrowLeftIcon weight="bold" className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </Link>
        <div className="min-w-0">
          <p className="display-title truncate text-2xl font-semibold leading-none text-[var(--sea-ink)] min-[420px]:text-3xl sm:text-4xl">
            {APP_NAME}
          </p>
          <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
            Game {roomCode ?? gameId.slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 min-[420px]:gap-2">
        {canLeave ? (
          <button
            type="button"
            disabled={isLeaving}
            aria-label="Exit game"
            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 min-[420px]:h-9 min-[420px]:w-9 sm:h-10 sm:w-10"
            onClick={onLeave}
          >
            {isLeaving ? (
              <SpinnerGapIcon weight="bold" className="h-4.5 w-4.5 animate-spin sm:h-5 sm:w-5" />
            ) : (
              <SignOutIcon weight="bold" className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            )}
          </button>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  )
}
