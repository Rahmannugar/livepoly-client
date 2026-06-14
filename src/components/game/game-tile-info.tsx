import { CaretDownIcon, SpinnerGapIcon, XIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import {
  formatCash,
  formatMoney,
  getTilePurchasePrice,
  getPlayerName,
  type GameTile,
} from '#/lib/game/game-board'
import type { GamePlayer, GameProperty } from '#/lib/game/game.types'

type TileInfoPanelProps = {
  tile: GameTile | null
  label?: string
  property?: GameProperty | null
  owner?: GamePlayer | null
  defaultCollapsed?: boolean
}

type PropertyDecisionControlsProps = {
  tile: GameTile | null
  property?: GameProperty | null
  commandPending: boolean
  onBuyProperty: () => void
  onDeclinePropertyPurchase: () => void
}

export function TileInfoPanel({
  tile,
  label,
  property,
  owner,
  defaultCollapsed = false,
}: TileInfoPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  if (!tile) {
    return null
  }

  const purchasePrice = getTilePurchasePrice(tile)
  const rentRows = getRentRows(tile, property)
  const details = [
    { label: 'Type', value: getTileKindLabel(tile) },
    purchasePrice === null
      ? null
      : { label: 'Price', value: formatCash(purchasePrice) },
    tile.mortgageValue
      ? { label: 'Mortgage', value: formatCash(tile.mortgageValue) }
      : null,
    tile.houseCost ? { label: 'Build', value: formatCash(tile.houseCost) } : null,
    owner ? { label: 'Owner', value: getPlayerName(owner) } : null,
    getTileStatus(tile, property, owner),
    tile.amount ? { label: 'Charge', value: formatCash(tile.amount) } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <button
        type="button"
        aria-expanded={!collapsed}
        className="flex w-full min-w-0 items-start gap-3 text-left"
        onClick={() => setCollapsed((value) => !value)}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
            {label ?? getTileKindLabel(tile)}
          </span>
          <span className="mt-1 block truncate text-2xl font-black leading-tight text-[var(--sea-ink)]">
            {tile.name}
          </span>
        </span>
        <CaretDownIcon
          weight="bold"
          className={`mt-1 h-5 w-5 shrink-0 text-[var(--sea-ink-soft)] transition duration-300 ${
            collapsed ? '' : 'rotate-180'
          }`}
        />
      </button>

      <div className={`game-collapsible ${collapsed ? '' : 'game-collapsible--open'}`}>
        <div className="pt-2">
          <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
            {getTileInfoCopy(tile)}
          </p>

          {details.length ? (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black text-[var(--sea-ink)] sm:grid-cols-3 xl:grid-cols-2">
              {details.map((detail) => (
                <span
                  key={detail.label}
                  className="min-w-0 rounded-2xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_78%,transparent)] px-3 py-2"
                >
                  <span className="block text-[0.62rem] uppercase tracking-[0.12em] text-[var(--sea-ink-soft)]">
                    {detail.label}
                  </span>
                  <span className="block break-words leading-5">
                    {detail.value}
                  </span>
                </span>
              ))}
            </div>
          ) : null}

          {rentRows.length ? (
            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_74%,transparent)] p-3">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
                Earnings
              </p>
              <div className="mt-2 grid gap-1.5">
                {rentRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex min-w-0 items-center justify-between gap-3 text-xs font-black text-[var(--sea-ink)]"
                  >
                    <span className="min-w-0 truncate text-[var(--sea-ink-soft)]">
                      {row.label}
                    </span>
                    <span className="shrink-0">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
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
      <TileInfoPanel
        tile={props.tile}
        property={props.property}
        defaultCollapsed
      />
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
        className="game-decision-sheet fixed inset-x-3 bottom-3 z-50 grid max-h-[min(82vh,42rem)] gap-3 overflow-y-auto rounded-[28px] border border-[var(--line)] bg-[var(--bg-base)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_28px_90px_rgba(4,12,15,0.34)]"
      >
        <span className="mx-auto h-1.5 w-12 rounded-full bg-[color-mix(in_oklab,var(--sea-ink-soft)_42%,transparent)]" />
        <TileInfoPanel
          tile={props.tile}
          property={props.property}
          defaultCollapsed
        />
        <PropertyDecisionControls {...props} />
      </section>
    </div>
  )
}

export function TileInfoSheet({
  open,
  tile,
  property,
  owner,
  onClose,
}: {
  open: boolean
  tile: GameTile | null
  property?: GameProperty | null
  owner?: GamePlayer | null
  onClose: () => void
}) {
  if (!open || !tile) {
    return null
  }

  return (
    <div aria-live="polite">
      <button
        type="button"
        aria-label="Close square details"
        className="game-decision-backdrop fixed inset-0 z-40 bg-[rgba(4,12,15,0.46)] backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${tile.name} details`}
        className="game-decision-sheet fixed inset-x-3 bottom-3 z-50 mx-auto grid max-h-[min(82vh,42rem)] w-auto max-w-xl gap-3 overflow-y-auto rounded-[28px] border border-[var(--line)] bg-[var(--bg-base)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_28px_90px_rgba(4,12,15,0.34)] md:inset-x-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="h-1.5 w-12 rounded-full bg-[color-mix(in_oklab,var(--sea-ink-soft)_42%,transparent)] md:hidden" />
          <p className="app-kicker hidden md:block">Square details</p>
          <button
            type="button"
            aria-label="Close square details"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] transition hover:translate-y-[-1px]"
            onClick={onClose}
          >
            <XIcon weight="bold" className="h-4 w-4" />
          </button>
        </div>
        <TileInfoPanel
          tile={tile}
          property={property}
          owner={owner}
          defaultCollapsed={false}
        />
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
    return 'Buy it to collect rent, then build when you control the full color set.'
  }

  if (tile.kind === 'airport') {
    return 'Airports collect rent based on how many routes you control.'
  }

  if (tile.kind === 'utility') {
    return 'Utilities scale with dice rolls when another player lands here.'
  }

  if (tile.kind === 'tax') {
    return 'Landing here charges the listed amount immediately.'
  }

  if (tile.kind === 'chance' || tile.kind === 'world_fund') {
    return 'Draw a card and resolve the instruction.'
  }

  if (tile.kind === 'go') {
    return 'Pass or land here to collect starting cash.'
  }

  if (tile.kind === 'jail') {
    return 'Just visiting unless a card or rule sends you in.'
  }

  if (tile.kind === 'go_to_jail') {
    return 'Move directly to Jail and skip passing Go.'
  }

  if (tile.kind === 'free_parking') {
    return 'A quiet stop. No payment is due here.'
  }

  return 'Resolve the square and keep the game moving.'
}

function getTileStatus(
  tile: GameTile,
  property?: GameProperty | null,
  owner?: GamePlayer | null,
) {
  if (!getTilePurchasePrice(tile)) {
    return null
  }

  if (property?.mortgaged) {
    return { label: 'Status', value: 'Mortgaged' }
  }

  if (owner) {
    return { label: 'Status', value: 'Owned' }
  }

  return { label: 'Status', value: 'Unowned' }
}

function getRentRows(tile: GameTile, property?: GameProperty | null) {
  if (tile.kind === 'property') {
    if (property?.mortgaged) {
      return [{ label: 'Rent while mortgaged', value: 'None' }]
    }

    const rows = [
      tile.baseRent
        ? { label: 'Base rent', value: formatCash(tile.baseRent) }
        : null,
      tile.baseRent
        ? { label: 'Full set rent', value: formatCash(tile.baseRent * 2) }
        : null,
      ...(tile.rentByHouseCount ?? []).map((rent, index) => ({
        label: `${formatMoney(index + 1)} house${index === 0 ? '' : 's'}`,
        value: formatCash(rent),
      })),
      tile.hotelRent
        ? { label: 'Hotel', value: formatCash(tile.hotelRent) }
        : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>

    return rows
  }

  if (tile.kind === 'airport' && tile.rentByOwnedCount?.length) {
    return tile.rentByOwnedCount.map((rent, index) => ({
      label: `${formatMoney(index + 1)} airport${index === 0 ? '' : 's'}`,
      value: formatCash(rent),
    }))
  }

  if (tile.kind === 'utility' && tile.rentMultiplierByOwnedCount?.length) {
    return tile.rentMultiplierByOwnedCount.map((multiplier, index) => ({
      label: `${formatMoney(index + 1)} ${index === 0 ? 'utility' : 'utilities'}`,
      value: `${multiplier}x dice`,
    }))
  }

  return []
}
