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
    <div className="game-card-reveal fixed inset-0 z-50 grid place-items-center bg-[rgba(4,12,15,0.48)] p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${deckName} card: ${card.title}`}
        className="game-card-reveal__card relative grid w-full max-w-sm gap-5 rounded-[30px] border border-[var(--line)] bg-[var(--bg-base)] p-6 text-center shadow-[0_30px_100px_rgba(4,12,15,0.38)]"
      >
        <button
          type="button"
          aria-label="Close card"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] transition hover:translate-y-[-1px]"
          onClick={onClose}
        >
          <XIcon weight="bold" className="h-4 w-4" />
        </button>

        <div className="mx-auto grid h-24 w-20 place-items-center rounded-[18px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--primary)_18%,var(--surface))] shadow-[0_18px_42px_rgba(4,12,15,0.2)]">
          <span className="text-3xl font-black text-[var(--sea-ink)]">
            {deckName[0]}
          </span>
        </div>

        <div>
          <p className="app-kicker">{deckName}</p>
          <h2 className="display-title mt-2 text-4xl font-semibold leading-tight text-[var(--sea-ink)]">
            {card.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-base font-bold leading-7 text-[var(--sea-ink-soft)]">
            {card.copy}
          </p>
        </div>
      </section>
    </div>
  )
}
