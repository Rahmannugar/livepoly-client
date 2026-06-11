import { ArrowLeftIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { APP_NAME } from '#/config/app.constants'

export function GamePageHeader({
  roomCode,
  gameId,
}: {
  roomCode?: string | null
  gameId: string
}) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to="/"
          aria-label="Back home"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] transition hover:translate-y-[-1px]"
        >
          <ArrowLeftIcon weight="bold" className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <p className="display-title truncate text-3xl font-semibold leading-none text-[var(--sea-ink)] sm:text-4xl">
            {APP_NAME}
          </p>
          <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
            Game {roomCode ?? gameId.slice(0, 8)}
          </p>
        </div>
      </div>

      <ThemeToggle />
    </header>
  )
}
