import {
  BuildingsIcon,
  ListChecksIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import {
  findPlayer,
  formatCash,
  formatEventSummary,
  formatPhase,
  gameTiles,
  getPlayerName,
  getUnmortgageCost,
} from '#/lib/game/game-board'
import type {
  GameEventLogItem,
  GamePlayer,
  GameProperty,
  GameState,
} from '#/lib/game/game.types'
import { GamePanel, LoadingBlock, PlayerToken, StatePill } from './game-primitives'

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

export function GameStatePanel({
  state,
  playersOnline,
}: {
  state: GameState | null
  playersOnline: number
}) {
  return (
    <GamePanel title="Game state" icon={ShieldCheckIcon}>
      <div className="grid grid-cols-2 gap-2 text-sm font-bold text-[var(--sea-ink-soft)]">
        <StatePill label="Turn" value={state ? String(state.turnNumber) : '...'} />
        <StatePill label="Mode" value={state?.mode ?? '...'} />
        <StatePill label="Phase" value={formatPhase(state?.phase)} />
        <StatePill label="Online" value={`${playersOnline} players`} />
      </div>
    </GamePanel>
  )
}

export function PropertiesPanel({
  properties,
  players,
  roomPlayerId,
  commandPending,
  onBuild,
  onSellBuilding,
  onMortgage,
  onUnmortgage,
}: {
  properties: GameProperty[]
  players: GamePlayer[]
  roomPlayerId: string | null
  commandPending: boolean
  onBuild: (tileKey: string) => void
  onSellBuilding: (tileKey: string) => void
  onMortgage: (tileKey: string) => void
  onUnmortgage: (tileKey: string) => void
}) {
  return (
    <GamePanel title="Properties" icon={BuildingsIcon}>
      <PropertyList
        properties={properties}
        players={players}
        roomPlayerId={roomPlayerId}
        commandPending={commandPending}
        onBuild={onBuild}
        onSellBuilding={onSellBuilding}
        onMortgage={onMortgage}
        onUnmortgage={onUnmortgage}
      />
    </GamePanel>
  )
}

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
          {isCurrentTurn ? 'Taking turn' : `Tile ${player.position}`}
        </p>
      </div>
    </div>
  )
}

function PropertyList({
  properties,
  players,
  roomPlayerId,
  commandPending,
  onBuild,
  onSellBuilding,
  onMortgage,
  onUnmortgage,
}: {
  properties: GameProperty[]
  players: GamePlayer[]
  roomPlayerId: string | null
  commandPending: boolean
  onBuild: (tileKey: string) => void
  onSellBuilding: (tileKey: string) => void
  onMortgage: (tileKey: string) => void
  onUnmortgage: (tileKey: string) => void
}) {
  if (properties.length === 0) {
    return (
      <p className="text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
        No properties have been claimed yet.
      </p>
    )
  }

  return (
    <div className="grid max-h-52 gap-2 overflow-y-auto pr-1">
      {properties.slice(0, 8).map((property) => {
        const tile = gameTiles.find((item) => item.key === property.tileKey)
        const owner = findPlayer(players, property.ownerRoomPlayerId)
        const isMine = Boolean(
          roomPlayerId && property.ownerRoomPlayerId === roomPlayerId,
        )
        const mortgageValue = tile?.mortgageValue ?? 0
        const unmortgageCost = getUnmortgageCost(mortgageValue)
        const canManageBuilding = Boolean(
          isMine &&
            tile?.kind === 'property' &&
            !property.mortgaged &&
            !property.hasHotel,
        )
        const hasBuilding = property.hasHotel || property.houseCount > 0
        const buildingCost = tile?.houseCost ?? 0

        return (
          <div
            key={property.tileKey}
            className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[var(--sea-ink)]">
                  {tile?.name ?? property.tileKey}
                </p>
                <p className="mt-0.5 text-xs font-bold text-[var(--sea-ink-soft)]">
                  {owner ? getPlayerName(owner) : 'Unowned'}
                </p>
              </div>
              <span className="shrink-0 text-xs font-black text-[var(--sea-ink)]">
                {property.mortgaged
                  ? 'Mortgaged'
                  : property.hasHotel
                    ? 'Hotel'
                    : `${property.houseCount} houses`}
              </span>
            </div>

            {mortgageValue > 0 ? (
              <div className="grid gap-2">
                {tile?.kind === 'property' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={
                        !canManageBuilding ||
                        commandPending ||
                        buildingCost <= 0
                      }
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_88%,transparent)] px-3 text-xs font-black text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => onBuild(property.tileKey)}
                    >
                      {property.hasHotel
                        ? 'Built out'
                        : property.houseCount === 4
                          ? `Hotel ${formatCash(buildingCost)}`
                          : `Build ${formatCash(buildingCost)}`}
                    </button>
                    <button
                      type="button"
                      disabled={!isMine || !hasBuilding || commandPending}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_88%,transparent)] px-3 text-xs font-black text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => onSellBuilding(property.tileKey)}
                    >
                      Sell +{formatCash(buildingCost / 2)}
                    </button>
                  </div>
                ) : null}

                <button
                  type="button"
                  disabled={!isMine || commandPending}
                  className="inline-flex h-9 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_88%,transparent)] px-4 text-xs font-black text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    if (property.mortgaged) {
                      onUnmortgage(property.tileKey)
                      return
                    }

                    onMortgage(property.tileKey)
                  }}
                >
                  {property.mortgaged
                    ? `Unmortgage ${formatCash(unmortgageCost)}`
                    : `Mortgage +${formatCash(mortgageValue)}`}
                </button>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
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
