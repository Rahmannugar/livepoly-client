import { LayoutGroup } from 'motion/react'
import type { GameState } from '#/lib/game/game.types'
import { findPlayer, gameTiles, type GameTile } from '#/lib/game/game-board'
import { GameBoardCenter } from './game-board-center'
import { GameTileCell } from './game-board-tile'

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
      <LayoutGroup id={`game-board-${state?.gameId ?? 'loading'}`}>
        <div className="mx-auto grid aspect-square w-full max-w-[46rem] grid-cols-11 grid-rows-11 gap-0.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1 sm:gap-1 sm:rounded-xl sm:p-2 lg:max-w-none 2xl:gap-2 2xl:p-4">
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
              players={getPlayersOnTile(state, tile.index)}
              property={getTileProperty(state, tile.key)}
              owner={getTileOwner(state, tile.key)}
              currentTurnRoomPlayerId={state?.currentTurnRoomPlayerId ?? null}
              isActiveTile={tile.key === activeTileKey}
              onSelect={onSelectTile}
            />
          ))}
        </div>
      </LayoutGroup>
    </div>
  )
}

function getPlayersOnTile(state: GameState | null, position: number) {
  return (
    state?.players.filter(
      (player) => !player.bankrupt && player.position === position,
    ) ?? []
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
