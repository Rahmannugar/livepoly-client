import {
  AirplaneTiltIcon,
  BankIcon,
  CarIcon,
  CurrencyDollarIcon,
  DropIcon,
  LightningIcon,
  PoliceCarIcon,
  QuestionIcon,
  ReceiptIcon,
  type Icon,
} from '@phosphor-icons/react'
import type { CSSProperties } from 'react'
import { DiceRollDisplay, PlayerToken } from './game-primitives'
import type { GamePlayer, GameState } from '#/lib/game/game.types'
import {
  findPlayer,
  formatDice,
  gameTiles,
  propertySetColors,
  type GameTile,
} from '#/lib/game/game-board'

export function GameBoard({
  state,
  access,
  isCurrentTurn,
  isRollingDice,
}: {
  state: GameState | null
  access: string | null
  isCurrentTurn: boolean
  isRollingDice: boolean
}) {
  return (
    <div className="mx-auto w-full overflow-x-auto pb-1">
      <div className="grid aspect-square w-full min-w-[34rem] grid-cols-11 grid-rows-11 gap-1 rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-2 sm:min-w-[42rem] sm:gap-1.5 sm:p-3 lg:min-w-0 2xl:gap-2 2xl:p-4">
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 grid place-items-center rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_82%,transparent)] p-5 text-center">
          <div>
            <p className="app-kicker">Room {state?.roomCode ?? '...'}</p>
            <DiceRollDisplay
              dice={state?.lastDiceRoll}
              isRolling={isRollingDice}
            />
            <p className="display-title mt-3 text-4xl font-semibold text-[var(--sea-ink)]">
              {isRollingDice ? 'Rolling...' : formatDice(state?.lastDiceRoll)}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
              {access === 'spectator'
                ? 'Watching this game live.'
                : isCurrentTurn
                  ? 'Your move.'
                  : 'Waiting for the next move.'}
            </p>
          </div>
        </div>

        {gameTiles.map((tile) => (
          <GameTileCell
            key={tile.key}
            tile={tile}
            players={getPlayersOnTile(state, tile.index)}
            owner={getTileOwner(state, tile.key)}
            currentTurnRoomPlayerId={state?.currentTurnRoomPlayerId ?? null}
          />
        ))}
      </div>
    </div>
  )
}

function GameTileCell({
  tile,
  players,
  owner,
  currentTurnRoomPlayerId,
}: {
  tile: GameTile
  players: GamePlayer[]
  owner: GamePlayer | null
  currentTurnRoomPlayerId: string | null
}) {
  const TileIcon = getTileIcon(tile)

  return (
    <div
      className={`game-tile relative flex min-h-0 flex-col justify-between overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg-base)] p-1 text-[var(--sea-ink)] sm:rounded-xl sm:p-1.5 2xl:rounded-2xl 2xl:p-2 ${
        TileIcon ? 'game-tile--special' : ''
      }`}
      style={getTileGridStyle(tile.index)}
    >
      {tile.setKey ? (
        <span
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ backgroundColor: propertySetColors[tile.setKey] }}
        />
      ) : null}

      <div className="game-tile__body mt-1 min-h-0">
        {TileIcon ? (
          <span className="game-tile__icon">
            <TileIcon weight="duotone" className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem]" />
          </span>
        ) : null}
        <span
          className={`game-tile__label line-clamp-3 text-[0.52rem] font-black leading-tight sm:text-[0.62rem] xl:text-[0.7rem] 2xl:text-[0.78rem] ${
            TileIcon ? 'game-tile__label--special' : ''
          }`}
        >
          {getTileLabel(tile)}
        </span>
      </div>

      <div className="flex min-h-5 flex-wrap items-end gap-1">
        {owner ? (
          <span className="rounded-full bg-[var(--surface)] px-1.5 py-0.5 text-[0.55rem] font-black">
            {owner.seatNumber}
          </span>
        ) : null}
        {players.map((player) => (
          <PlayerToken
            key={player.roomPlayerId}
            player={player}
            compact
            isActive={player.roomPlayerId === currentTurnRoomPlayerId}
          />
        ))}
      </div>
    </div>
  )
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
    return CurrencyDollarIcon
  }

  if (tile.key === 'water_works') {
    return DropIcon
  }

  if (tile.key === 'electric_company') {
    return LightningIcon
  }

  return null
}

function getPlayersOnTile(state: GameState | null, position: number) {
  return state?.players.filter((player) => player.position === position) ?? []
}

function getTileOwner(state: GameState | null, tileKey: string) {
  if (!state) {
    return null
  }

  const property = state.properties.find((item) => item.tileKey === tileKey)

  return findPlayer(state.players, property?.ownerRoomPlayerId)
}
