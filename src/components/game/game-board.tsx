import type { GameState } from '#/lib/game/game.types'
import { findPlayer, gameTiles, type GameTile } from '#/lib/game/game-board'
import { GameBoardCenter } from './game-board-center'
import { GameTileCell } from './game-board-tile'

export function GameBoard({
  state,
  access,
  isCurrentTurn,
  isRollingDice,
  onSelectTile,
}: {
  state: GameState | null
  access: string | null
  isCurrentTurn: boolean
  isRollingDice: boolean
  onSelectTile: (tile: GameTile) => void
}) {
  return (
    <div className="mx-auto w-full overflow-hidden pb-1">
      <div className="mx-auto grid aspect-square w-full max-w-[46rem] grid-cols-11 grid-rows-11 gap-0.5 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-1.5 sm:gap-1 sm:rounded-[28px] sm:p-2 lg:max-w-none 2xl:gap-2 2xl:p-4">
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
            owner={getTileOwner(state, tile.key)}
            currentTurnRoomPlayerId={state?.currentTurnRoomPlayerId ?? null}
            onSelect={onSelectTile}
          />
        ))}
      </div>
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

function getTileOwner(state: GameState | null, tileKey: string) {
  if (!state) {
    return null
  }

  const property = state.properties.find((item) => item.tileKey === tileKey)

  return findPlayer(state.players, property?.ownerRoomPlayerId)
}
