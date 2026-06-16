import { BuildingsIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import {
  findPlayer,
  formatCash,
  gameTiles,
  getPlayerName,
  getUnmortgageCost,
  type GameTile,
} from '#/lib/game/game-board'
import type { GamePlayer, GameProperty } from '#/lib/game/game.types'
import { GamePanel } from './game-primitives'
import { TradeProposalForm } from './game-trade-actions'

export function PropertiesPanel({
  properties,
  players,
  roomPlayerId,
  canManageProperties,
  commandPending,
  onBuild,
  onSellBuilding,
  onMortgage,
  onUnmortgage,
  onProposeTrade,
}: {
  properties: GameProperty[]
  players: GamePlayer[]
  roomPlayerId: string | null
  canManageProperties: boolean
  commandPending: boolean
  onBuild: (tileKey: string) => void
  onSellBuilding: (tileKey: string) => void
  onMortgage: (tileKey: string) => void
  onUnmortgage: (tileKey: string) => void
  onProposeTrade: (input: {
    toRoomPlayerId: string
    offeredCash: number
    requestedCash: number
    offeredPropertyKeys: string[]
    requestedPropertyKeys: string[]
  }) => void
}) {
  const ownerTabs = useMemo(() => {
    const ownerIds = Array.from(
      new Set(
        properties
          .map((property) => property.ownerRoomPlayerId)
          .filter(Boolean) as string[],
      ),
    )

    return ownerIds.sort((left, right) => {
      if (left === roomPlayerId) return -1
      if (right === roomPlayerId) return 1

      const leftPlayer = findPlayer(players, left)
      const rightPlayer = findPlayer(players, right)

      const leftName = leftPlayer ? getPlayerName(leftPlayer) : left
      const rightName = rightPlayer ? getPlayerName(rightPlayer) : right

      return leftName.localeCompare(rightName)
    })
  }, [players, properties, roomPlayerId])
  const [activeOwnerId, setActiveOwnerId] = useState<string | null>(null)
  const selectedOwnerId =
    activeOwnerId && ownerTabs.includes(activeOwnerId)
      ? activeOwnerId
      : (ownerTabs[0] ?? null)
  const selectedProperties = selectedOwnerId
    ? properties.filter(
        (property) => property.ownerRoomPlayerId === selectedOwnerId,
      )
    : []

  return (
    <GamePanel title="Properties" icon={BuildingsIcon} collapsible={false}>
      {ownerTabs.length > 1 ? (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {ownerTabs.map((ownerId) => {
            const owner = findPlayer(players, ownerId)
            const active = ownerId === selectedOwnerId
            const ownerLabel =
              ownerId === roomPlayerId
                ? 'You'
                : owner
                  ? getPlayerName(owner)
                  : 'Unknown player'

            return (
              <button
                key={ownerId}
                type="button"
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
                  active
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] hover:translate-y-[-1px]'
                }`}
                onClick={() => setActiveOwnerId(ownerId)}
              >
                {ownerLabel}
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
        commandPending={commandPending}
        onBuild={onBuild}
        onSellBuilding={onSellBuilding}
        onMortgage={onMortgage}
        onUnmortgage={onUnmortgage}
      />
      <TradeProposalForm
        properties={properties}
        players={players}
        roomPlayerId={roomPlayerId}
        commandPending={commandPending}
        disabled={!canManageProperties}
        onProposeTrade={onProposeTrade}
      />
    </GamePanel>
  )
}

function PropertyList({
  properties,
  players,
  roomPlayerId,
  canManageProperties,
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
        const unmortgageCost = getUnmortgageCost(mortgageValue)
        const canManageBuilding = Boolean(
          canManageProperties &&
            isMine &&
            tile?.kind === 'property' &&
            ownsFullPropertySet(properties, tile, property.ownerRoomPlayerId) &&
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

            {canManageProperties && isMine && mortgageValue > 0 ? (
              <div className="grid gap-2">
                {tile?.kind === 'property' ? (
                  <div className="grid gap-2 2xl:grid-cols-2">
                    <button
                      type="button"
                      disabled={
                        !canManageBuilding ||
                        commandPending ||
                        buildingCost <= 0
                      }
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_88%,transparent)] px-3 py-2 text-center text-xs font-black leading-4 text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
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
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_88%,transparent)] px-3 py-2 text-center text-xs font-black leading-4 text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => onSellBuilding(property.tileKey)}
                    >
                      Sell +{formatCash(buildingCost / 2)}
                    </button>
                  </div>
                ) : null}
                {tile?.kind === 'property' && isMine && !canManageBuilding ? (
                  <p className="text-xs font-bold leading-5 text-[var(--sea-ink-soft)]">
                    Own the full color set before building here.
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={!isMine || commandPending}
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_88%,transparent)] px-4 py-2 text-center text-xs font-black leading-4 text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
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

function ownsFullPropertySet(
  properties: GameProperty[],
  tile: GameTile | undefined,
  ownerRoomPlayerId: string | null,
) {
  if (!tile?.setKey || !ownerRoomPlayerId) {
    return false
  }

  const setTiles = gameTiles.filter(
    (item) => item.kind === 'property' && item.setKey === tile.setKey,
  )

  return setTiles.every((setTile) =>
    properties.some(
      (property) =>
        property.tileKey === setTile.key &&
        property.ownerRoomPlayerId === ownerRoomPlayerId &&
        !property.mortgaged,
    ),
  )
}
