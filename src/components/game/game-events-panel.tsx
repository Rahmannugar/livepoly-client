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
          className={`game-event-card rounded-2xl border border-[var(--line)] p-3 ${
            index === 0
              ? 'bg-[color-mix(in_oklab,var(--primary)_14%,var(--surface))]'
              : 'bg-[var(--surface)]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-black leading-5 text-[var(--sea-ink)]">
              {formatEventSummary(event, players)}
            </p>
            {index === 0 ? (
              <span className="shrink-0 rounded-full bg-[var(--primary)] px-2 py-1 text-[0.58rem] font-black uppercase tracking-[0.1em] text-[var(--primary-foreground)]">
                Latest
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs font-bold text-[var(--sea-ink-soft)]">
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
