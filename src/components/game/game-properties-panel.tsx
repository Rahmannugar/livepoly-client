import {
  BuildingsIcon,
  CaretDownIcon,
  LockKeyIcon,
  MapPinIcon,
} from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { findPlayer, getPlayerName } from '#/lib/game/game-board'
import type { GameTile } from '#/lib/game/game-board'
import {
  getGameTile,
  groupGameProperties,
  type GamePropertyGroup,
} from '#/lib/game/game-property-groups'
import {
  getActionNotice,
  getBuildAction,
  getMortgageAction,
  getOwnedSetProperties,
  getSellAction,
} from '#/lib/game/game-property-actions'
import type { GamePlayer, GameProperty } from '#/lib/game/game.types'
import { GamePanel } from './game-primitives'

export function PropertiesPanel({
  properties,
  players,
  roomPlayerId,
  canManageProperties,
  canLiquidateProperties,
  commandPending,
  onBuild,
  onSellBuilding,
  onMortgage,
  onUnmortgage,
  onSelectProperty,
}: {
  properties: GameProperty[]
  players: GamePlayer[]
  roomPlayerId: string | null
  canManageProperties: boolean
  canLiquidateProperties: boolean
  commandPending: boolean
  onBuild: (tileKey: string) => void
  onSellBuilding: (tileKey: string) => void
  onMortgage: (tileKey: string) => void
  onUnmortgage: (tileKey: string) => void
  onSelectProperty: (tileKey: string) => void
}) {
  const playerTabs = useMemo(() => {
    return [...players].sort((left, right) => {
      if (left.roomPlayerId === roomPlayerId) return -1
      if (right.roomPlayerId === roomPlayerId) return 1

      return left.seatNumber - right.seatNumber
    })
  }, [players, roomPlayerId])
  const [activeOwnerId, setActiveOwnerId] = useState<string | null>(null)
  const selectedOwnerId =
    activeOwnerId &&
    playerTabs.some((player) => player.roomPlayerId === activeOwnerId)
      ? activeOwnerId
      : (playerTabs[0]?.roomPlayerId ?? null)
  const selectedProperties = selectedOwnerId
    ? properties.filter(
        (property) => property.ownerRoomPlayerId === selectedOwnerId,
      )
    : []

  return (
    <GamePanel title="Properties" icon={BuildingsIcon} collapsible={false}>
      {playerTabs.length > 0 ? (
        <div className="mb-4 flex gap-5 overflow-x-auto border-b border-[var(--line)]">
          {playerTabs.map((player) => {
            const ownerId = player.roomPlayerId
            const active = ownerId === selectedOwnerId
            const ownerLabel =
              ownerId === roomPlayerId ? 'You' : getPlayerName(player)
            const propertyCount = properties.filter(
              (property) => property.ownerRoomPlayerId === ownerId,
            ).length

            return (
              <button
                key={ownerId}
                type="button"
                className={`relative shrink-0 px-1 pb-3 text-sm font-black transition ${
                  active
                    ? 'text-[var(--sea-ink)] after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-full after:bg-[var(--primary)]'
                    : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
                }`}
                onClick={() => setActiveOwnerId(ownerId)}
              >
                <span
                  className="inline-block max-w-28 truncate align-bottom"
                  title={ownerLabel}
                >
                  {ownerLabel}
                </span>
                <span className="ml-2 text-[0.65rem] opacity-70">
                  {propertyCount}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
      <PropertyList
        properties={selectedProperties}
        players={players}
        roomPlayerId={roomPlayerId}
        canManageProperties={canManageProperties}
        canLiquidateProperties={canLiquidateProperties}
        commandPending={commandPending}
        onBuild={onBuild}
        onSellBuilding={onSellBuilding}
        onMortgage={onMortgage}
        onUnmortgage={onUnmortgage}
        onSelectProperty={onSelectProperty}
      />
    </GamePanel>
  )
}

function PropertyList({
  properties,
  players,
  roomPlayerId,
  canManageProperties,
  canLiquidateProperties,
  commandPending,
  onBuild,
  onSellBuilding,
  onMortgage,
  onUnmortgage,
  onSelectProperty,
}: {
  properties: GameProperty[]
  players: GamePlayer[]
  roomPlayerId: string | null
  canManageProperties: boolean
  canLiquidateProperties: boolean
  commandPending: boolean
  onBuild: (tileKey: string) => void
  onSellBuilding: (tileKey: string) => void
  onMortgage: (tileKey: string) => void
  onUnmortgage: (tileKey: string) => void
  onSelectProperty: (tileKey: string) => void
}) {
  if (properties.length === 0) {
    return (
      <p className="text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
        No owned squares here yet.
      </p>
    )
  }

  const propertyGroups = groupGameProperties(properties)

  return (
    <div className="grid gap-2">
      {propertyGroups.map((group) => (
        <PropertyGroup
          key={group.key}
          group={group}
          allProperties={properties}
          players={players}
          roomPlayerId={roomPlayerId}
          canManageProperties={canManageProperties}
          canLiquidateProperties={canLiquidateProperties}
          commandPending={commandPending}
          onBuild={onBuild}
          onSellBuilding={onSellBuilding}
          onMortgage={onMortgage}
          onUnmortgage={onUnmortgage}
          onSelectProperty={onSelectProperty}
        />
      ))}
    </div>
  )
}

function PropertyGroup({
  group,
  allProperties,
  players,
  roomPlayerId,
  canManageProperties,
  canLiquidateProperties,
  commandPending,
  onBuild,
  onSellBuilding,
  onMortgage,
  onUnmortgage,
  onSelectProperty,
}: {
  group: GamePropertyGroup
  allProperties: GameProperty[]
  players: GamePlayer[]
  roomPlayerId: string | null
  canManageProperties: boolean
  canLiquidateProperties: boolean
  commandPending: boolean
  onBuild: (tileKey: string) => void
  onSellBuilding: (tileKey: string) => void
  onMortgage: (tileKey: string) => void
  onUnmortgage: (tileKey: string) => void
  onSelectProperty: (tileKey: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const buildingCount = group.properties.reduce(
    (total, property) =>
      total + property.houseCount + (property.hasHotel ? 1 : 0),
    0,
  )
  const mortgageCount = group.properties.filter(
    (property) => property.mortgaged,
  ).length

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
      <button
        type="button"
        className="flex min-h-12 w-full items-center gap-2 px-3 py-2 text-left"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        {group.color ? (
          <span
            className="h-6 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: group.color }}
            aria-hidden="true"
          />
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-black text-[var(--sea-ink)]">
            {group.label}
          </span>
          <span className="mt-0.5 block text-[0.68rem] font-bold text-[var(--sea-ink-soft)]">
            {formatGroupSummary(
              group.properties.length,
              buildingCount,
              mortgageCount,
            )}
          </span>
        </span>
        <CaretDownIcon
          weight="bold"
          className={`h-4 w-4 shrink-0 text-[var(--sea-ink-soft)] transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {expanded ? (
        <div className="grid gap-2 border-t border-[var(--line)] p-2">
          {group.properties.map((property) => (
            <PropertyCard
              key={property.tileKey}
              property={property}
              allProperties={allProperties}
              players={players}
              roomPlayerId={roomPlayerId}
              canManageProperties={canManageProperties}
              canLiquidateProperties={canLiquidateProperties}
              commandPending={commandPending}
              onBuild={onBuild}
              onSellBuilding={onSellBuilding}
              onMortgage={onMortgage}
              onUnmortgage={onUnmortgage}
              onSelectProperty={onSelectProperty}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function PropertyCard({
  property,
  allProperties,
  players,
  roomPlayerId,
  canManageProperties,
  canLiquidateProperties,
  commandPending,
  onBuild,
  onSellBuilding,
  onMortgage,
  onUnmortgage,
  onSelectProperty,
}: {
  property: GameProperty
  allProperties: GameProperty[]
  players: GamePlayer[]
  roomPlayerId: string | null
  canManageProperties: boolean
  canLiquidateProperties: boolean
  commandPending: boolean
  onBuild: (tileKey: string) => void
  onSellBuilding: (tileKey: string) => void
  onMortgage: (tileKey: string) => void
  onUnmortgage: (tileKey: string) => void
  onSelectProperty: (tileKey: string) => void
}) {
  const tile = getGameTile(property.tileKey)
  const owner = findPlayer(players, property.ownerRoomPlayerId)
  const isMine = Boolean(
    roomPlayerId && property.ownerRoomPlayerId === roomPlayerId,
  )
  const mortgageValue = tile?.mortgageValue ?? 0
  const hasBuilding = property.hasHotel || property.houseCount > 0
  const setProperties = getOwnedSetProperties(
    allProperties,
    tile,
    property.ownerRoomPlayerId,
  )
  const buildAction = getBuildAction({
    property,
    tile,
    owner,
    setProperties,
    canManageProperties,
    isMine,
  })
  const sellAction = getSellAction({
    property,
    tile,
    setProperties,
    canLiquidateProperties,
    isMine,
  })
  const mortgageAction = getMortgageAction({
    property,
    tile,
    owner,
    setProperties,
    canManageProperties,
    canLiquidateProperties,
    isMine,
  })
  const actionNotice = getActionNotice({
    tile,
    property,
    buildAction,
    sellAction,
    mortgageAction,
    canManageProperties,
    hasBuilding,
  })

  return (
    <div className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
      <button
        type="button"
        className="flex min-w-0 items-start justify-between gap-3 text-left"
        aria-label={`View ${tile?.name ?? property.tileKey}`}
        onClick={() => onSelectProperty(property.tileKey)}
      >
        <span className="min-w-0">
          <span
            className="block truncate text-sm font-black text-[var(--sea-ink)]"
            title={tile?.name ?? property.tileKey}
          >
            {tile?.name ?? property.tileKey}
          </span>
          <span className="mt-0.5 block truncate text-xs font-bold text-[var(--sea-ink-soft)]">
            {owner ? getPlayerName(owner) : 'Unowned'}
          </span>
        </span>
        <span className="inline-flex max-w-32 shrink-0 items-center justify-end gap-1 text-right text-xs font-black text-[var(--sea-ink)]">
          {property.mortgaged ? (
            <LockKeyIcon
              weight="fill"
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
          ) : null}
          <span className="truncate">
            {getPropertyBuildLabel(property, tile)}
          </span>
          <MapPinIcon
            weight="bold"
            className="h-3.5 w-3.5 shrink-0 text-[var(--sea-ink-soft)]"
            aria-hidden="true"
          />
        </span>
      </button>

      {canLiquidateProperties && isMine && mortgageValue > 0 ? (
        <div className="grid gap-2">
          {tile?.kind === 'property' ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={!buildAction.enabled || commandPending}
                className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-center text-xs font-black leading-4 text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => onBuild(property.tileKey)}
              >
                {buildAction.label}
              </button>
              <button
                type="button"
                disabled={!sellAction.enabled || commandPending}
                className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-center text-xs font-black leading-4 text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => onSellBuilding(property.tileKey)}
              >
                {sellAction.label}
              </button>
            </div>
          ) : null}
          {actionNotice ? (
            <p className="text-xs font-bold leading-5 text-[var(--sea-ink-soft)]">
              {actionNotice}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!mortgageAction.enabled || commandPending}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-center text-xs font-black leading-4 text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => {
              if (property.mortgaged) {
                onUnmortgage(property.tileKey)
                return
              }

              onMortgage(property.tileKey)
            }}
          >
            {mortgageAction.label}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function formatGroupSummary(
  propertyCount: number,
  buildingCount: number,
  mortgageCount: number,
) {
  const details = [
    `${propertyCount} ${propertyCount === 1 ? 'property' : 'properties'}`,
    buildingCount > 0
      ? `${buildingCount} ${buildingCount === 1 ? 'building' : 'buildings'}`
      : null,
    mortgageCount > 0 ? `${mortgageCount} mortgaged` : null,
  ].filter(Boolean)

  return details.join(' · ')
}

function getPropertyBuildLabel(property: GameProperty, tile?: GameTile) {
  if (property.mortgaged) return 'Mortgaged'
  if (tile?.kind === 'airport') return 'Airport'
  if (tile?.kind === 'utility') return 'Utility'
  if (property.hasHotel) return 'Hotel'
  if (tile?.kind === 'property') {
    return property.houseCount === 1
      ? '1 house'
      : `${property.houseCount} houses`
  }

  return 'Owned'
}
