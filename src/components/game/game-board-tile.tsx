import {
  AirplaneTiltIcon,
  BankIcon,
  CarIcon,
  CoinsIcon,
  DropIcon,
  LightningIcon,
  PoliceCarIcon,
  QuestionIcon,
  ReceiptIcon,
  type Icon,
} from '@phosphor-icons/react'
import type { CSSProperties } from 'react'
import { PlayerToken } from './game-primitives'
import type { GamePlayer } from '#/lib/game/game.types'
import {
  propertySetColors,
  type GameTile,
} from '#/lib/game/game-board'

export function GameTileCell({
  tile,
  players,
  owner,
  currentTurnRoomPlayerId,
  onSelect,
}: {
  tile: GameTile
  players: GamePlayer[]
  owner: GamePlayer | null
  currentTurnRoomPlayerId: string | null
  onSelect: (tile: GameTile) => void
}) {
  const TileIcon = getTileIcon(tile)

  return (
    <button
      type="button"
      aria-label={`View ${tile.name}`}
      className={`game-tile relative flex min-h-0 flex-col justify-between overflow-visible rounded-sm border border-[var(--line)] bg-[var(--bg-base)] p-0.5 text-left text-[var(--sea-ink)] outline-none transition hover:translate-y-[-1px] focus-visible:border-[var(--primary)] sm:rounded-md sm:p-1.5 2xl:p-2 ${
        TileIcon ? 'game-tile--special' : ''
      }`}
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
          className={`game-tile__label line-clamp-4 text-[0.38rem] font-black leading-tight sm:text-[0.56rem] xl:text-[0.62rem] 2xl:text-[0.68rem] ${
            TileIcon ? 'game-tile__label--special' : ''
          }`}
          title={tile.name}
        >
          {getTileLabel(tile)}
        </span>
      </div>

      <div className="game-tile__tokens pointer-events-none absolute bottom-1 right-1 z-40 flex max-w-[calc(100%-0.5rem)] flex-wrap items-end justify-end gap-0.5">
        {owner ? (
          <span
            className="game-tile__owner-marker grid h-3 w-3 place-items-center rounded-full bg-[var(--surface)] text-[0.42rem] font-black text-[var(--sea-ink)] shadow-sm sm:h-3.5 sm:w-3.5 sm:text-[0.48rem] xl:h-4 xl:w-4 xl:text-[0.54rem]"
            title={`${getOwnerLabel(owner)} owns ${tile.name}`}
          >
            {owner.seatNumber}
          </span>
        ) : null}
        {players.slice(0, 4).map((player) => (
          <PlayerToken
            key={player.roomPlayerId}
            player={player}
            compact
            isActive={player.roomPlayerId === currentTurnRoomPlayerId}
          />
        ))}
      </div>
    </button>
  )
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
