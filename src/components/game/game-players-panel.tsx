import { UsersIcon } from '@phosphor-icons/react'
import { formatCash, getPlayerName } from '#/lib/game/game-board'
import type { GamePlayer, GameState } from '#/lib/game/game.types'
import { GamePanel, LoadingBlock, PlayerToken } from './game-primitives'

export function PlayersPanel({
  state,
  roomPlayerId,
}: {
  state: GameState | null
  roomPlayerId: string | null
}) {
  return (
    <GamePanel title="Players" icon={UsersIcon}>
      <div className="grid gap-2">
        {(state?.players ?? []).map((player) => (
          <PlayerRow
            key={player.roomPlayerId}
            player={player}
            isCurrentTurn={
              state?.currentTurnRoomPlayerId === player.roomPlayerId
            }
            isYou={roomPlayerId === player.roomPlayerId}
          />
        ))}

        {!state ? <LoadingBlock label="Joining game" /> : null}
      </div>
    </GamePanel>
  )
}

function PlayerRow({
  player,
  isCurrentTurn,
  isYou,
}: {
  player: GamePlayer
  isCurrentTurn: boolean
  isYou: boolean
}) {
  return (
    <div
      className={`grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 sm:rounded-2xl sm:p-2.5 ${
        player.bankrupt ? 'opacity-65' : ''
      }`}
    >
      <PlayerToken player={player} isActive={isCurrentTurn} />
      <div className="grid min-w-0 gap-1">
        <p
          className="min-w-0 truncate text-[0.84rem] font-black text-[var(--sea-ink)] sm:text-sm"
          title={getPlayerName(player)}
        >
          {getPlayerName(player)}
          {isYou ? ' (you)' : ''}
        </p>
        <p className="truncate text-[0.7rem] font-bold text-[var(--sea-ink-soft)] sm:text-xs">
          {getPlayerStatus(player, isCurrentTurn)}
        </p>
      </div>
      <span
        className="block min-w-0 max-w-20 truncate rounded-full bg-[color-mix(in_oklab,var(--surface-strong)_78%,transparent)] px-2 py-1 text-right text-[0.62rem] font-black leading-none text-[var(--sea-ink)] [font-variant-numeric:tabular-nums] sm:text-[0.66rem]"
        title={formatCash(player.cash)}
      >
        {formatCash(player.cash)}
      </span>
    </div>
  )
}

function getPlayerStatus(player: GamePlayer, isCurrentTurn: boolean) {
  if (player.bankrupt) return 'Bankrupt'
  if (player.inJail) return isCurrentTurn ? 'Playing from jail' : 'In jail'
  if (isCurrentTurn) return 'Playing'

  return `Tile ${player.position}`
}
