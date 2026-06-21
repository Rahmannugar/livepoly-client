import { ShieldCheckIcon } from '@phosphor-icons/react'
import { formatPhase } from '#/lib/game/game-board'
import type { GameState } from '#/lib/game/game.types'
import { GamePanel, StatePill } from './game-primitives'

export function GameStatePanel({
  state,
  playersOnline,
  spectatorsOnline,
}: {
  state: GameState | null
  playersOnline: number
  spectatorsOnline: number
}) {
  return (
    <GamePanel title="Game state" icon={ShieldCheckIcon}>
      <div className="grid grid-cols-2 gap-2 text-sm font-bold text-[var(--sea-ink-soft)]">
        <StatePill
          label="Turn"
          value={state ? String(state.turnNumber) : '...'}
        />
        <StatePill label="Mode" value={state?.mode ?? '...'} />
        <StatePill label="Phase" value={formatPhase(state?.phase)} />
        <StatePill label="Players online" value={String(playersOnline)} />
        <StatePill label="Spectators" value={String(spectatorsOnline)} />
      </div>
    </GamePanel>
  )
}
