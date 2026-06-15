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
    <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_4.6rem] items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 sm:grid-cols-[auto_minmax(0,1fr)_5.2rem] sm:gap-3 sm:p-3.5">
      <PlayerToken player={player} isActive={isCurrentTurn} />
      <div className="grid min-w-0 gap-1">
        <p
          className="min-w-0 truncate text-[0.84rem] font-black text-[var(--sea-ink)] sm:text-sm"
          title={getPlayerName(player)}
        >
          {getPlayerName(player)}
          {isYou ? ' (you)' : ''}
        </p>
        <p className="truncate text-xs font-bold text-[var(--sea-ink-soft)]">
          {isCurrentTurn
            ? player.playerType === 'bot'
              ? 'Bot thinking'
              : 'Taking turn'
            : `Tile ${player.position}`}
        </p>
      </div>
      <span
        className="block min-w-0 justify-self-stretch truncate rounded-full bg-[color-mix(in_oklab,var(--surface-strong)_78%,transparent)] px-2 py-1 text-right text-[0.64rem] font-black leading-none text-[var(--sea-ink)] [font-variant-numeric:tabular-nums] sm:px-2.5 sm:text-[0.66rem]"
        title={formatCash(player.cash)}
      >
        {formatCash(player.cash)}
      </span>
    </div>
  )
}
