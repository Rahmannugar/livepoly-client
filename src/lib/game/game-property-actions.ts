import { formatCash, gameTiles, getUnmortgageCost } from './game-board'
import type { GameTile } from './game-board'
import type { GamePlayer, GameProperty } from './game.types'

export type PropertyAction = {
  enabled: boolean
  label: string
  reason: string | null
}

export function getBuildAction({
  property,
  tile,
  owner,
  setProperties,
  canManageProperties,
  isMine,
}: {
  property: GameProperty
  tile: GameTile | undefined
  owner: GamePlayer | null
  setProperties: GameProperty[]
  canManageProperties: boolean
  isMine: boolean
}): PropertyAction {
  const buildCost = tile?.houseCost ?? 0
  const label =
    property.hasHotel || buildCost <= 0
      ? 'Built out'
      : property.houseCount === 4
        ? `Hotel ${formatCash(buildCost)}`
        : `Build ${formatCash(buildCost)}`

  if (!canManageProperties || !isMine || tile?.kind !== 'property') {
    return { enabled: false, label, reason: null }
  }

  if (!ownsFullPropertySet(setProperties, tile, property.ownerRoomPlayerId)) {
    return {
      enabled: false,
      label,
      reason: 'Own the full color set before building.',
    }
  }

  if (setProperties.some((candidate) => candidate.mortgaged)) {
    return {
      enabled: false,
      label,
      reason: 'Unmortgage the full set before building.',
    }
  }

  if (property.hasHotel) {
    return { enabled: false, label, reason: 'This property is fully built.' }
  }

  if ((owner?.cash ?? 0) < buildCost) {
    return {
      enabled: false,
      label,
      reason: `You need ${formatCash(buildCost)} to build here.`,
    }
  }

  if (property.houseCount < 4) {
    const lowestHouseCount = Math.min(
      ...setProperties
        .filter((candidate) => !candidate.hasHotel)
        .map((candidate) => candidate.houseCount),
    )

    if (property.houseCount !== lowestHouseCount) {
      return {
        enabled: false,
        label,
        reason: 'Build houses evenly across the color set.',
      }
    }

    return { enabled: true, label, reason: null }
  }

  const canBuildHotel = setProperties.every((candidate) =>
    candidate.tileKey === property.tileKey
      ? candidate.houseCount === 4 && !candidate.hasHotel
      : candidate.hasHotel || candidate.houseCount === 4,
  )

  return canBuildHotel
    ? { enabled: true, label, reason: null }
    : {
        enabled: false,
        label,
        reason: 'Build hotels evenly across the color set.',
      }
}

export function getSellAction({
  property,
  tile,
  setProperties,
  canLiquidateProperties,
  isMine,
}: {
  property: GameProperty
  tile: GameTile | undefined
  setProperties: GameProperty[]
  canLiquidateProperties: boolean
  isMine: boolean
}): PropertyAction {
  const sellAmount = (tile?.houseCost ?? 0) / 2
  const label = `Sell +${formatCash(sellAmount)}`

  if (
    !canLiquidateProperties ||
    !isMine ||
    tile?.kind !== 'property' ||
    (!property.hasHotel && property.houseCount === 0)
  ) {
    return { enabled: false, label, reason: null }
  }

  if (property.hasHotel) {
    return { enabled: true, label, reason: null }
  }

  if (setProperties.some((candidate) => candidate.hasHotel)) {
    return {
      enabled: false,
      label,
      reason: 'Sell hotels in this set before selling houses.',
    }
  }

  const highestHouseCount = Math.max(
    ...setProperties.map((candidate) => candidate.houseCount),
  )

  return property.houseCount === highestHouseCount
    ? { enabled: true, label, reason: null }
    : {
        enabled: false,
        label,
        reason: 'Sell houses evenly across the color set.',
      }
}

export function getMortgageAction({
  property,
  tile,
  owner,
  setProperties,
  canManageProperties,
  canLiquidateProperties,
  isMine,
}: {
  property: GameProperty
  tile: GameTile | undefined
  owner: GamePlayer | null
  setProperties: GameProperty[]
  canManageProperties: boolean
  canLiquidateProperties: boolean
  isMine: boolean
}): PropertyAction {
  const mortgageValue = tile?.mortgageValue ?? 0
  const unmortgageCost = getUnmortgageCost(mortgageValue)

  if (property.mortgaged) {
    const label = canManageProperties
      ? `Unmortgage ${formatCash(unmortgageCost)}`
      : 'Mortgaged'

    if (!canManageProperties || !isMine) {
      return {
        enabled: false,
        label,
        reason: canLiquidateProperties
          ? 'Unmortgaging is unavailable while resolving debt.'
          : null,
      }
    }

    if ((owner?.cash ?? 0) < unmortgageCost) {
      return {
        enabled: false,
        label,
        reason: `You need ${formatCash(unmortgageCost)} to unmortgage.`,
      }
    }

    return { enabled: true, label, reason: null }
  }

  const label = `Mortgage +${formatCash(mortgageValue)}`

  if (!canLiquidateProperties || !isMine || mortgageValue <= 0) {
    return { enabled: false, label, reason: null }
  }

  if (
    tile?.kind === 'property' &&
    setProperties.some(
      (candidate) => candidate.hasHotel || candidate.houseCount > 0,
    )
  ) {
    return {
      enabled: false,
      label: 'Sell buildings first',
      reason: 'Sell every building in this color set before mortgaging.',
    }
  }

  return { enabled: true, label, reason: null }
}

export function getActionNotice({
  tile,
  property,
  buildAction,
  sellAction,
  mortgageAction,
  canManageProperties,
  hasBuilding,
}: {
  tile: GameTile | undefined
  property: GameProperty
  buildAction: PropertyAction
  sellAction: PropertyAction
  mortgageAction: PropertyAction
  canManageProperties: boolean
  hasBuilding: boolean
}) {
  if (canManageProperties && tile?.kind === 'property' && buildAction.reason) {
    return buildAction.reason
  }

  if (hasBuilding && sellAction.reason) {
    return sellAction.reason
  }

  if (property.mortgaged || !hasBuilding) {
    return mortgageAction.reason
  }

  return null
}

export function getOwnedSetProperties(
  properties: GameProperty[],
  tile: GameTile | undefined,
  ownerRoomPlayerId: string | null,
) {
  if (!tile?.setKey || !ownerRoomPlayerId) {
    return []
  }

  const setTileKeys = new Set(
    gameTiles
      .filter((candidate) => candidate.setKey === tile.setKey)
      .map((candidate) => candidate.key),
  )

  return properties.filter(
    (candidate) =>
      candidate.ownerRoomPlayerId === ownerRoomPlayerId &&
      setTileKeys.has(candidate.tileKey),
  )
}

function ownsFullPropertySet(
  properties: GameProperty[],
  tile: GameTile,
  ownerRoomPlayerId: string | null,
) {
  if (!tile.setKey || !ownerRoomPlayerId) {
    return false
  }

  const setTiles = gameTiles.filter(
    (item) => item.kind === 'property' && item.setKey === tile.setKey,
  )

  return setTiles.every((setTile) =>
    properties.some(
      (property) =>
        property.tileKey === setTile.key &&
        property.ownerRoomPlayerId === ownerRoomPlayerId,
    ),
  )
}
