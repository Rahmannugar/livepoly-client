import { BuildingsIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { findPlayer, gameTiles, getPlayerName } from '#/lib/game/game-board'
import type { GameTile } from '#/lib/game/game-board'
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
}) {
  if (properties.length === 0) {
    return (
      <p className="text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
        No owned squares here yet.
      </p>
    )
  }

  return (
    <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
      {properties.map((property) => {
        const tile = gameTiles.find((item) => item.key === property.tileKey)
        const owner = findPlayer(players, property.ownerRoomPlayerId)
        const isMine = Boolean(
          roomPlayerId && property.ownerRoomPlayerId === roomPlayerId,
        )
        const mortgageValue = tile?.mortgageValue ?? 0
        const hasBuilding = property.hasHotel || property.houseCount > 0
        const setProperties = getOwnedSetProperties(
          properties,
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
          <div
            key={property.tileKey}
            className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-black text-[var(--sea-ink)]"
                  title={tile?.name ?? property.tileKey}
                >
                  {tile?.name ?? property.tileKey}
                </p>
                <p
                  className="mt-0.5 truncate text-xs font-bold text-[var(--sea-ink-soft)]"
                  title={owner ? getPlayerName(owner) : 'Unowned'}
                >
                  {owner ? getPlayerName(owner) : 'Unowned'}
                </p>
              </div>
              <span className="max-w-24 shrink-0 truncate text-right text-xs font-black text-[var(--sea-ink)]">
                {getPropertyBuildLabel(property, tile)}
              </span>
            </div>

            {canLiquidateProperties && isMine && mortgageValue > 0 ? (
              <div className="grid gap-2">
                {tile?.kind === 'property' ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={!buildAction.enabled || commandPending}
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_88%,transparent)] px-3 py-2 text-center text-xs font-black leading-4 text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => onBuild(property.tileKey)}
                    >
                      {buildAction.label}
                    </button>
                    <button
                      type="button"
                      disabled={!sellAction.enabled || commandPending}
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_88%,transparent)] px-3 py-2 text-center text-xs font-black leading-4 text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_88%,transparent)] px-4 py-2 text-center text-xs font-black leading-4 text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
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
      })}
    </div>
  )
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
