import { formatRemainingMatchTime } from '#/lib/game/game-time'

export function GameMatchTimer({
  remainingMatchTimeMs,
}: {
  remainingMatchTimeMs: number | null
}) {
  const remainingTime = formatRemainingMatchTime(remainingMatchTimeMs)

  return (
    <div className="flex w-full justify-center">
      <div className="inline-flex min-w-44 items-center justify-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-center shadow-[0_18px_45px_rgba(4,12,15,0.14)]">
        <span className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
          Time
        </span>
        <span
          className="min-w-16 text-center text-lg font-black text-[var(--sea-ink)]"
          title={remainingTime}
        >
          {remainingTime}
        </span>
      </div>
    </div>
  )
}
