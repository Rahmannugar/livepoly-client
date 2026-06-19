import { XIcon } from '@phosphor-icons/react'
import type { GameCardMetadata } from '#/lib/game/game-cards'

export function GameCardReveal({
  card,
  onClose,
}: {
  card: GameCardMetadata | null
  onClose: () => void
}) {
  if (!card) {
    return null
  }

  const deckName = card.deck === 'world_fund' ? 'World Fund' : 'Chance'

  return (
    <div className="game-card-reveal fixed inset-0 z-50 grid place-items-center bg-[rgba(4,12,15,0.48)] p-2 backdrop-blur-sm sm:p-4">
      <div className="game-card-reveal__stack relative w-[min(17rem,calc(100vw-2.5rem))] sm:w-full sm:max-w-sm">
        <span
          aria-hidden="true"
          className="game-card-reveal__layer game-card-reveal__layer--back"
        />
        <span
          aria-hidden="true"
          className="game-card-reveal__layer game-card-reveal__layer--middle"
        />
        <section
          role="dialog"
          aria-modal="true"
          aria-label={`${deckName} card: ${card.title}`}
          className="game-card-reveal__card relative z-10 grid w-full gap-4 rounded-lg border border-[var(--line)] bg-[var(--bg-base)] p-4 text-center shadow-[0_30px_100px_rgba(4,12,15,0.38)] sm:gap-5 sm:rounded-xl sm:p-6"
        >
          <button
            type="button"
            aria-label="Close card"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] transition hover:translate-y-[-1px] sm:right-4 sm:top-4"
            onClick={onClose}
          >
            <XIcon weight="bold" className="h-4 w-4" />
          </button>

          <div className="mx-auto grid h-16 w-12 place-items-center rounded-md border border-[var(--line)] bg-[color-mix(in_oklab,var(--primary)_18%,var(--surface))] shadow-[0_14px_32px_rgba(4,12,15,0.2)] sm:h-24 sm:w-20 sm:rounded-lg">
            <span className="text-2xl font-black text-[var(--sea-ink)] sm:text-3xl">
              {deckName[0]}
            </span>
          </div>

          <div>
            <p className="app-kicker">{deckName}</p>
            <h2 className="display-title mt-2 text-2xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-4xl">
              {card.title}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm font-bold leading-6 text-[var(--sea-ink-soft)] sm:mt-3 sm:text-base sm:leading-7">
              {card.copy}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
