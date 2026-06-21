import { motion } from 'motion/react'
import type { GamePlayer, GameState } from '#/lib/game/game.types'
import { findPlayer, gameTiles, type GameTile } from '#/lib/game/game-board'
import { GameBoardCenter } from './game-board-center'
import { GameTileCell } from './game-board-tile'
import { PlayerToken } from './game-primitives'

export function GameBoard({
  state,
  access,
  isCurrentTurn,
  isRollingDice,
  activeTileKey,
  onSelectTile,
}: {
  state: GameState | null
  access: string | null
  isCurrentTurn: boolean
  isRollingDice: boolean
  activeTileKey: string | null
  onSelectTile: (tile: GameTile) => void
}) {
  return (
    <div className="mx-auto w-full overflow-hidden pb-1">
      <div className="relative mx-auto grid aspect-square w-full max-w-[46rem] grid-cols-11 grid-rows-11 gap-0.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1 sm:gap-1 sm:rounded-xl sm:p-2 lg:max-w-none 2xl:gap-2 2xl:p-4">
        <GameBoardCenter
          dice={state?.lastDiceRoll}
          access={access}
          isCurrentTurn={isCurrentTurn}
          isRollingDice={isRollingDice}
          phase={state?.phase}
        />

        {gameTiles.map((tile) => (
          <GameTileCell
            key={tile.key}
            tile={tile}
            property={getTileProperty(state, tile.key)}
            owner={getTileOwner(state, tile.key)}
            isActiveTile={tile.key === activeTileKey}
            onSelect={onSelectTile}
          />
        ))}

        <BoardTokenLayer
          players={state?.players ?? []}
          currentTurnRoomPlayerId={state?.currentTurnRoomPlayerId ?? null}
        />
      </div>
    </div>
  )
}

function getTileProperty(state: GameState | null, tileKey: string) {
  return state?.properties.find((item) => item.tileKey === tileKey) ?? null
}

function getTileOwner(state: GameState | null, tileKey: string) {
  if (!state) {
    return null
  }

  const property = getTileProperty(state, tileKey)

  return findPlayer(state.players, property?.ownerRoomPlayerId)
}

function BoardTokenLayer({
  players,
  currentTurnRoomPlayerId,
}: {
  players: GamePlayer[]
  currentTurnRoomPlayerId: string | null
}) {
  const visiblePlayers = players.filter((player) => !player.bankrupt)
  const positionCounts = new Map<number, number>()

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {visiblePlayers.map((player) => {
        const stackIndex = positionCounts.get(player.position) ?? 0
        positionCounts.set(player.position, stackIndex + 1)
        const position = getTokenPosition(player.position, stackIndex)

        return (
          <motion.div
            key={player.roomPlayerId}
            className="absolute"
            initial={false}
            animate={{
              left: `${position.left}%`,
              top: `${position.top}%`,
            }}
            transition={{
              duration: 1.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div
              style={{
                transform: 'translate(-50%, -50%)',
                marginLeft: position.offsetX,
                marginTop: position.offsetY,
              }}
            >
              <PlayerToken
                player={player}
                compact
                isActive={player.roomPlayerId === currentTurnRoomPlayerId}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function getTokenPosition(position: number, stackIndex: number) {
  const { row, column } = getBoardCoordinates(position)
  const offsets = [
    { x: -5, y: -5 },
    { x: 5, y: -5 },
    { x: -5, y: 5 },
    { x: 5, y: 5 },
  ]
  const offset = offsets[stackIndex % offsets.length]

  return {
    left: ((column - 0.5) / 11) * 100,
    top: ((row - 0.5) / 11) * 100,
    offsetX: offset.x,
    offsetY: offset.y,
  }
}

function getBoardCoordinates(position: number) {
  if (position <= 10) {
    return { row: 11, column: 11 - position }
  }

  if (position <= 20) {
    return { row: 21 - position, column: 1 }
  }

  if (position <= 30) {
    return { row: 1, column: position - 19 }
  }

  return { row: position - 29, column: 11 }
}
