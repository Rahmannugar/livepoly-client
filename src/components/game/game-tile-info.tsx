import { SpinnerGapIcon } from '@phosphor-icons/react'
import {
  formatCash,
  getTilePurchasePrice,
  type GameTile,
} from '#/lib/game/game-board'

type TileInfoPanelProps = {
  tile: GameTile | null
  label?: string
}

type PropertyDecisionControlsProps = {
  tile: GameTile | null
  commandPending: boolean
  onBuyProperty: () => void
  onDeclinePropertyPurchase: () => void
}

export function TileInfoPanel({ tile, label }: TileInfoPanelProps) {
  if (!tile) {
    return null
  }

  const purchasePrice = getTilePurchasePrice(tile)
  const details = [
    purchasePrice === null
      ? null
      : { label: 'Price', value: formatCash(purchasePrice) },
    tile.mortgageValue
      ? { label: 'Mortgage', value: formatCash(tile.mortgageValue) }
      : null,
    tile.houseCost ? { label: 'Build', value: formatCash(tile.houseCost) } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
        {label ?? getTileKindLabel(tile)}
      </p>
      <p className="mt-1 text-2xl font-black leading-tight text-[var(--sea-ink)]">
        {tile.name}
      </p>
      <p className="mt-2 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
        {getTileInfoCopy(tile)}
      </p>

      {details.length ? (
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black text-[var(--sea-ink)]">
          {details.map((detail) => (
            <span
              key={detail.label}
              className="rounded-2xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_78%,transparent)] px-3 py-2"
            >
              <span className="block text-[0.62rem] uppercase tracking-[0.12em] text-[var(--sea-ink-soft)]">
                {detail.label}
              </span>
              {detail.value}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function PropertyDecisionControls({
  tile,
  commandPending,
  onBuyProperty,
  onDeclinePropertyPurchase,
}: PropertyDecisionControlsProps) {
  const purchasePrice = getTilePurchasePrice(tile)

  return (
    <div className="grid gap-3">
      <button
        type="button"
        disabled={commandPending}
        className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
          commandPending ? 'game-command-button--active' : ''
        }`}
        onClick={onBuyProperty}
      >
        {commandPending ? (
          <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
        ) : null}
        {purchasePrice === null
          ? 'Buy property'
          : `Buy for ${formatCash(purchasePrice)}`}
      </button>
      <button
        type="button"
        disabled={commandPending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
        onClick={onDeclinePropertyPurchase}
      >
        Send to auction
      </button>
    </div>
  )
}

export function PropertyDecisionActions(props: PropertyDecisionControlsProps) {
  return (
    <div className="grid gap-3">
      <TileInfoPanel tile={props.tile} />
      <PropertyDecisionControls {...props} />
    </div>
  )
}

export function MobilePropertyDecisionSheet({
  open,
  ...props
}: PropertyDecisionControlsProps & {
  open: boolean
}) {
  if (!open || !props.tile) {
    return null
  }

  return (
    <div className="md:hidden" aria-live="polite">
      <div className="game-decision-backdrop fixed inset-0 z-40 bg-[rgba(4,12,15,0.42)] backdrop-blur-sm" />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Decision for ${props.tile.name}`}
        className="game-decision-sheet fixed inset-x-3 bottom-3 z-50 grid gap-3 rounded-[28px] border border-[var(--line)] bg-[var(--bg-base)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_28px_90px_rgba(4,12,15,0.34)]"
      >
        <TileInfoPanel tile={props.tile} />
        <PropertyDecisionControls {...props} />
      </section>
    </div>
  )
}

function getTileKindLabel(tile: GameTile) {
  const labels: Record<string, string> = {
    property: 'Property',
    airport: 'Airport',
    utility: 'Utility',
    tax: 'Tax',
    chance: 'Chance',
    world_fund: 'World fund',
    go: 'Start square',
    jail: 'Jail',
    go_to_jail: 'Penalty square',
    free_parking: 'Free parking',
  }

  return labels[tile.kind] ?? 'Tile'
}

function getTileInfoCopy(tile: GameTile) {
  if (tile.kind === 'property') {
    return 'Buy it to collect rent, then build when you own the set.'
  }

  if (tile.kind === 'airport') {
    return 'Airports collect rent based on how many routes you control.'
  }

  if (tile.kind === 'utility') {
    return 'Utilities scale with dice rolls when another player lands here.'
  }

  return 'Resolve the square and keep the game moving.'
}
