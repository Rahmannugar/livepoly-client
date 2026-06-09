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
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
      <PlayerToken player={player} isActive={isCurrentTurn} />
      <div className="grid min-w-0 gap-1">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <p
            className="truncate text-sm font-black text-[var(--sea-ink)]"
            title={getPlayerName(player)}
          >
            {getPlayerName(player)}
            {isYou ? ' (you)' : ''}
          </p>
          <span className="shrink-0 rounded-full bg-[color-mix(in_oklab,var(--surface-strong)_78%,transparent)] px-2 py-1 text-[0.68rem] font-black leading-none text-[var(--sea-ink)]">
            {formatCash(player.cash)}
          </span>
        </div>
        <p className="truncate text-xs font-bold text-[var(--sea-ink-soft)]">
          {isCurrentTurn
            ? player.playerType === 'bot'
              ? 'Bot thinking'
              : 'Taking turn'
            : `Tile ${player.position}`}
        </p>
      </div>
    </div>
  )
}
