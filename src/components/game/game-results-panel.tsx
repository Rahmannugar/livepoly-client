import { TrophyIcon } from '@phosphor-icons/react'
import { formatCash } from '#/lib/game/game-board'
import type { GameResult, GameResultPlayer } from '#/lib/game/game.types'
import { GamePanel, StatePill } from './game-primitives'

export function GameResultsPanel({
  result,
  isLoading,
  errorMessage,
}: {
  result: GameResult | null | undefined
  isLoading: boolean
  errorMessage: string | null
}) {
  const winner = result?.players.find(
    (player) => player.roomPlayerId === result.winnerRoomPlayerId,
  )

  return (
    <GamePanel title="Results" icon={TrophyIcon} collapsible={false}>
      {errorMessage ? (
        <p className="text-sm font-bold leading-6 text-red-500">
          {errorMessage}
        </p>
      ) : result ? (
        <div className="grid gap-4">
          <div className="grid gap-2 rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-4">
            <span className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
              Winner
            </span>
            <p className="truncate text-2xl font-black text-[var(--sea-ink)]">
              {winner ? getResultPlayerName(winner) : 'No winner'}
            </p>
            <div className="flex flex-wrap gap-2">
              <StatePill label="Reason" value={formatEndReason(result.endReason)} />
              <StatePill label="Mode" value={result.mode} />
            </div>
          </div>

          <ol className="grid gap-2">
            {result.players.map((player) => (
              <li
                key={player.roomPlayerId}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent)] text-sm font-black text-[var(--accent-ink)]">
                  {player.placement}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-[var(--sea-ink)]">
                    {getResultPlayerName(player)}
                  </span>
                  <span className="block truncate text-xs font-bold text-[var(--sea-ink-soft)]">
                    Net worth {formatCash(player.finalNetWorth)}
                  </span>
                </span>
                <span className="text-sm font-black text-[var(--sea-ink)]">
                  {formatCash(player.finalCash)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          {isLoading
            ? 'Loading final results.'
            : 'Results are being saved. This should only take a moment.'}
        </p>
      )}
    </GamePanel>
  )
}

function getResultPlayerName(player: GameResultPlayer) {
  return player.username ?? player.botName ?? `Seat ${player.seatNumber}`
}

function formatEndReason(reason: GameResult['endReason']) {
  const labels: Record<GameResult['endReason'], string> = {
    bankruptcy: 'Bankruptcy',
    time_elapsed: 'Time elapsed',
    abandoned: 'No players left',
    cancelled: 'Cancelled',
  }

  return labels[reason]
}
