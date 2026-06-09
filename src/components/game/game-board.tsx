import type { GamePlayer, GameState } from '#/lib/game/game.types'
import { findPlayer, gameTiles } from '#/lib/game/game-board'
import { GameBoardCenter } from './game-board-center'
import { GameTileCell } from './game-board-tile'

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
          />
        ))}
      </div>
    </div>
  )
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
