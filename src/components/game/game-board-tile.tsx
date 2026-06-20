import {
  AirplaneTiltIcon,
  BankIcon,
  BuildingsIcon,
  CarIcon,
  CoinsIcon,
  DropIcon,
  HouseIcon,
  LightningIcon,
  LockKeyIcon,
  PoliceCarIcon,
  QuestionIcon,
  ReceiptIcon,
} from '@phosphor-icons/react'
import type { CSSProperties } from 'react'
import type { Icon } from '@phosphor-icons/react'
import type { GamePlayer, GameProperty } from '#/lib/game/game.types'
import { propertySetColors } from '#/lib/game/game-board'
import type { GameTile } from '#/lib/game/game-board'

export function GameTileCell({
  tile,
  property,
  owner,
  isActiveTile,
  onSelect,
}: {
  tile: GameTile
  property: GameProperty | null
  owner: GamePlayer | null
  isActiveTile: boolean
  onSelect: (tile: GameTile) => void
}) {
  const TileIcon = getTileIcon(tile)
  const buildingLabel = getBuildingLabel(property)
  const mortgaged = Boolean(property?.mortgaged)

  return (
    <button
      type="button"
      aria-label={`View ${tile.name}${buildingLabel ? `, ${buildingLabel}` : ''}${mortgaged ? ', mortgaged' : ''}`}
      className={`game-tile relative flex min-h-0 flex-col justify-between overflow-visible rounded-[0.18rem] border border-[var(--line)] bg-[var(--bg-base)] p-0.5 text-left text-[var(--sea-ink)] outline-none transition hover:translate-y-[-1px] focus-visible:border-[var(--primary)] sm:rounded-sm sm:p-1.5 2xl:p-2 ${
        TileIcon ? 'game-tile--special' : ''
      } ${isActiveTile ? 'game-tile--active' : ''}`}
      style={getTileGridStyle(tile.index)}
      onClick={() => onSelect(tile)}
    >
      {tile.setKey ? (
        <span
          className="absolute inset-x-0 top-0 h-0.5 sm:h-1"
          style={{ backgroundColor: propertySetColors[tile.setKey] }}
        />
      ) : null}

      <div className="game-tile__body mt-1 min-h-0 pr-0.5 pb-3 sm:pr-1 sm:pb-5">
        {TileIcon ? (
          <span className="game-tile__icon">
            <TileIcon
              weight="duotone"
              className="h-3.5 w-3.5 sm:h-[1.1rem] sm:w-[1.1rem]"
            />
          </span>
        ) : null}
        <span
          className={`game-tile__label line-clamp-4 text-[0.34rem] font-black leading-[0.84] sm:text-[0.46rem] sm:leading-[0.92] xl:text-[0.5rem] 2xl:text-[0.56rem] ${
            TileIcon ? 'game-tile__label--special' : ''
          }`}
          title={tile.name}
        >
          {getTileLabel(tile)}
        </span>
      </div>

      {buildingLabel ? (
        <BuildingMarker property={property} label={buildingLabel} />
      ) : null}

      {mortgaged ? <MortgageMarker /> : null}

      <div className="game-tile__tokens pointer-events-none absolute bottom-1 right-1 z-40 flex max-w-[calc(100%-0.5rem)] flex-wrap items-end justify-end gap-0.5">
        {owner ? (
          <span
            className="game-tile__owner-marker grid h-3 w-3 place-items-center rounded-full bg-[var(--surface)] text-[0.42rem] font-black text-[var(--sea-ink)] shadow-sm sm:h-3.5 sm:w-3.5 sm:text-[0.48rem] xl:h-4 xl:w-4 xl:text-[0.54rem]"
            title={`${getOwnerLabel(owner)} owns ${tile.name}`}
          >
            {owner.seatNumber}
          </span>
        ) : null}
      </div>
    </button>
  )
}

function MortgageMarker() {
  return (
    <span
      aria-hidden="true"
      title="Mortgaged"
      className="pointer-events-none absolute right-0.5 top-1 z-30 grid h-3 w-3 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink)] shadow-sm sm:right-1 sm:top-1.5 sm:h-4 sm:w-4"
    >
      <LockKeyIcon weight="fill" className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
    </span>
  )
}

function BuildingMarker({
  property,
  label,
}: {
  property: GameProperty | null
  label: string
}) {
  const isHotel = Boolean(property?.hasHotel)
  const BuildingIcon = isHotel ? BuildingsIcon : HouseIcon

  return (
    <span
      aria-hidden="true"
      title={label}
      className="game-tile__building pointer-events-none absolute bottom-0.5 left-0.5 z-30 inline-flex h-3 min-w-3 items-center justify-center gap-px rounded-[0.18rem] border border-[var(--line)] bg-[var(--surface-strong)] px-px text-[0.36rem] font-black text-[var(--sea-ink)] shadow-sm sm:bottom-1 sm:left-1 sm:h-4 sm:min-w-4 sm:gap-0.5 sm:px-1 sm:text-[0.48rem]"
    >
      <BuildingIcon weight="fill" className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
      {isHotel ? null : <span>{property?.houseCount}</span>}
    </span>
  )
}

function getBuildingLabel(property: GameProperty | null) {
  if (property?.hasHotel) {
    return 'Hotel'
  }

  if (property && property.houseCount > 0) {
    return `${property.houseCount} house${property.houseCount === 1 ? '' : 's'}`
  }

  return null
}

function getOwnerLabel(owner: GamePlayer) {
  return owner.username ?? owner.botName ?? `Player ${owner.seatNumber}`
}

function getTileGridStyle(index: number): CSSProperties {
  if (index <= 10) {
    return { gridRow: 11, gridColumn: 11 - index }
  }

  if (index <= 20) {
    return { gridRow: 21 - index, gridColumn: 1 }
  }

  if (index <= 30) {
    return { gridRow: 1, gridColumn: index - 19 }
  }

  return { gridRow: index - 29, gridColumn: 11 }
}

function getTileLabel(tile: GameTile) {
  if (tile.kind !== 'property') {
    return tile.name
  }

  return tile.shortName ?? tile.name
}

function getTileIcon(tile: GameTile): Icon | null {
  if (tile.kind === 'airport') {
    return AirplaneTiltIcon
  }

  if (tile.kind === 'chance') {
    return QuestionIcon
  }

  if (tile.kind === 'world_fund') {
    return BankIcon
  }

  if (tile.kind === 'tax') {
    return ReceiptIcon
  }

  if (tile.kind === 'free_parking') {
    return CarIcon
  }

  if (tile.kind === 'go_to_jail') {
    return PoliceCarIcon
  }

  if (tile.kind === 'go') {
    return CoinsIcon
  }

  if (tile.key === 'water_works') {
    return DropIcon
  }

  if (tile.key === 'electric_company') {
    return LightningIcon
  }

  return null
}
