import { ListChecksIcon } from '@phosphor-icons/react'
import { formatEventSummary } from '#/lib/game/game-board'
import type { GameEventLogItem, GamePlayer } from '#/lib/game/game.types'
import { GamePanel } from './game-primitives'

export function EventsPanel({
  events,
  players,
}: {
  events: GameEventLogItem[]
  players: GamePlayer[]
}) {
  return (
    <GamePanel title="Events" icon={ListChecksIcon}>
      <EventList events={events} players={players} />
    </GamePanel>
  )
}

function EventList({
  events,
  players,
}: {
  events: GameEventLogItem[]
  players: GamePlayer[]
}) {
  if (events.length === 0) {
    return (
      <p className="text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
        Game events will appear as players move.
      </p>
    )
  }

  return (
    <div className="grid max-h-52 gap-2 overflow-y-auto pr-1">
      {events.map((event, index) => (
        <div
          key={`${event.type}-${event.sequence ?? index}`}
          className="game-event-card rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"
        >
          <p className="text-sm font-black text-[var(--sea-ink)]">
            {formatEventSummary(event, players)}
          </p>
          <p className="mt-0.5 text-xs font-bold text-[var(--sea-ink-soft)]">
            {new Date(event.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      ))}
    </div>
  )
}
