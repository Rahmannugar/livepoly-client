import { BuildingsIcon } from '@phosphor-icons/react'
import {
  findPlayer,
  formatCash,
  gameTiles,
  getPlayerName,
  getUnmortgageCost,
} from '#/lib/game/game-board'
import type { GamePlayer, GameProperty } from '#/lib/game/game.types'
import { GamePanel } from './game-primitives'

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
  return (
    <GamePanel title="Properties" icon={BuildingsIcon} collapsible={false}>
      <PropertyList
        properties={properties}
        players={players}
        roomPlayerId={roomPlayerId}
        canManageProperties={canManageProperties}
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
        No properties have been claimed yet.
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
                {property.mortgaged
                  ? 'Mortgaged'
                  : property.hasHotel
                    ? 'Hotel'
                    : `${property.houseCount} houses`}
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
