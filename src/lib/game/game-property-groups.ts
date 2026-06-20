import { gameTiles, propertySetColors, type GameTile } from './game-board'
import type { GameProperty } from './game.types'

export type GamePropertyGroup = {
  key: string
  label: string
  color: string | null
  properties: GameProperty[]
}

export function groupGameProperties(
  properties: GameProperty[],
): GamePropertyGroup[] {
  const groups = new Map<string, GamePropertyGroup>()

  for (const property of properties) {
    const tile = getGameTile(property.tileKey)
    const key = tile?.setKey ?? tile?.kind ?? 'other'
    const existing = groups.get(key)

    if (existing) {
      existing.properties.push(property)
      continue
    }

    groups.set(key, {
      key,
      label: getPropertyGroupLabel(key),
      color: tile?.setKey ? propertySetColors[tile.setKey] : null,
      properties: [property],
    })
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      properties: group.properties.sort(
        (left, right) =>
          getTileIndex(left.tileKey) - getTileIndex(right.tileKey),
      ),
    }))
    .sort(
      (left, right) =>
        getTileIndex(left.properties[0]?.tileKey) -
        getTileIndex(right.properties[0]?.tileKey),
    )
}

export function getGameTile(tileKey: string): GameTile | undefined {
  return gameTiles.find((tile) => tile.key === tileKey)
}

function getPropertyGroupLabel(key: string) {
  const labels: Record<string, string> = {
    brown: 'Brown set',
    light_blue: 'Light blue set',
    pink: 'Pink set',
    orange: 'Orange set',
    red: 'Red set',
    yellow: 'Yellow set',
    green: 'Green set',
    dark_blue: 'Dark blue set',
    airport: 'Airports',
    utility: 'Utilities',
  }

  return labels[key] ?? 'Other properties'
}

function getTileIndex(tileKey?: string) {
  return gameTiles.find((tile) => tile.key === tileKey)?.index ?? 999
}
