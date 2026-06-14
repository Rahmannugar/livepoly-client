import { formatRemainingMatchTime } from '#/lib/game/game-time'

export function GameMatchTimer({
  remainingMatchTimeMs,
}: {
  remainingMatchTimeMs: number | null
}) {
  return (
    <div className="flex w-full justify-center">
      <div className="grid min-w-44 grid-cols-[auto_minmax(5rem,1fr)] items-center justify-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-center shadow-[0_18px_45px_rgba(4,12,15,0.14)]">
        <span className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
          Time
        </span>
        <span className="text-center text-lg font-black text-[var(--sea-ink)]">
          {formatRemainingMatchTime(remainingMatchTimeMs)}
        </span>
      </div>
    </div>
  )
}
