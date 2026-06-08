import type { GameAuction, GameDebt, GameEventLogItem, GamePlayer } from './game.types'

export type GameTile = {
  index: number
  key: string
  name: string
  shortName?: string
  kind: string
  setKey?: string
  mortgageValue?: number
  houseCost?: number
}

export const gameTiles: GameTile[] = [
  { index: 0, key: 'go', name: 'Go', kind: 'go' },
  { index: 1, key: 'nigeria', name: 'Nigeria', kind: 'property', setKey: 'brown', mortgageValue: 30, houseCost: 50 },
  { index: 2, key: 'world_fund_1', name: 'World Fund', kind: 'world_fund' },
  { index: 3, key: 'ghana', name: 'Ghana', kind: 'property', setKey: 'brown', mortgageValue: 30, houseCost: 50 },
  { index: 4, key: 'income_tax', name: 'Income Tax', kind: 'tax' },
  { index: 5, key: 'lagos_airport', name: 'Lagos Airport', kind: 'airport', mortgageValue: 100 },
  { index: 6, key: 'south_africa', name: 'South Africa', shortName: 'S. Africa', kind: 'property', setKey: 'light_blue', mortgageValue: 50, houseCost: 50 },
  { index: 7, key: 'chance_1', name: 'Chance', kind: 'chance' },
  { index: 8, key: 'egypt', name: 'Egypt', kind: 'property', setKey: 'light_blue', mortgageValue: 50, houseCost: 50 },
  { index: 9, key: 'morocco', name: 'Morocco', kind: 'property', setKey: 'light_blue', mortgageValue: 60, houseCost: 50 },
  { index: 10, key: 'jail', name: 'Jail', kind: 'jail' },
  { index: 11, key: 'brazil', name: 'Brazil', kind: 'property', setKey: 'pink', mortgageValue: 70, houseCost: 100 },
  { index: 12, key: 'electric_company', name: 'Electric Company', kind: 'utility', mortgageValue: 75 },
  { index: 13, key: 'argentina', name: 'Argentina', kind: 'property', setKey: 'pink', mortgageValue: 70, houseCost: 100 },
  { index: 14, key: 'mexico', name: 'Mexico', kind: 'property', setKey: 'pink', mortgageValue: 80, houseCost: 100 },
  { index: 15, key: 'new_york_airport', name: 'New York Airport', kind: 'airport', mortgageValue: 100 },
  { index: 16, key: 'usa', name: 'USA', kind: 'property', setKey: 'orange', mortgageValue: 90, houseCost: 100 },
  { index: 17, key: 'world_fund_2', name: 'World Fund', kind: 'world_fund' },
  { index: 18, key: 'canada', name: 'Canada', kind: 'property', setKey: 'orange', mortgageValue: 90, houseCost: 100 },
  { index: 19, key: 'jamaica', name: 'Jamaica', kind: 'property', setKey: 'orange', mortgageValue: 100, houseCost: 100 },
  { index: 20, key: 'free_parking', name: 'Free Parking', kind: 'free_parking' },
  { index: 21, key: 'uk', name: 'United Kingdom', shortName: 'UK', kind: 'property', setKey: 'red', mortgageValue: 110, houseCost: 150 },
  { index: 22, key: 'chance_2', name: 'Chance', kind: 'chance' },
  { index: 23, key: 'france', name: 'France', kind: 'property', setKey: 'red', mortgageValue: 110, houseCost: 150 },
  { index: 24, key: 'spain', name: 'Spain', kind: 'property', setKey: 'red', mortgageValue: 120, houseCost: 150 },
  { index: 25, key: 'london_airport', name: 'London Airport', kind: 'airport', mortgageValue: 100 },
  { index: 26, key: 'germany', name: 'Germany', kind: 'property', setKey: 'yellow', mortgageValue: 130, houseCost: 150 },
  { index: 27, key: 'italy', name: 'Italy', kind: 'property', setKey: 'yellow', mortgageValue: 130, houseCost: 150 },
  { index: 28, key: 'water_works', name: 'Water Works', kind: 'utility', mortgageValue: 75 },
  { index: 29, key: 'netherlands', name: 'Netherlands', shortName: 'Netherl.', kind: 'property', setKey: 'yellow', mortgageValue: 140, houseCost: 150 },
  { index: 30, key: 'go_to_jail', name: 'Go To Jail', kind: 'go_to_jail' },
  { index: 31, key: 'india', name: 'India', kind: 'property', setKey: 'green', mortgageValue: 150, houseCost: 200 },
  { index: 32, key: 'china', name: 'China', kind: 'property', setKey: 'green', mortgageValue: 150, houseCost: 200 },
  { index: 33, key: 'world_fund_3', name: 'World Fund', kind: 'world_fund' },
  { index: 34, key: 'japan', name: 'Japan', kind: 'property', setKey: 'green', mortgageValue: 160, houseCost: 200 },
  { index: 35, key: 'tokyo_airport', name: 'Tokyo Airport', kind: 'airport', mortgageValue: 100 },
  { index: 36, key: 'chance_3', name: 'Chance', kind: 'chance' },
  { index: 37, key: 'south_korea', name: 'South Korea', shortName: 'Korea', kind: 'property', setKey: 'dark_blue', mortgageValue: 175, houseCost: 200 },
  { index: 38, key: 'luxury_tax', name: 'Luxury Tax', kind: 'tax' },
  { index: 39, key: 'australia', name: 'Australia', kind: 'property', setKey: 'dark_blue', mortgageValue: 200, houseCost: 200 },
]

export const propertySetColors: Record<string, string> = {
  brown: '#8f5b38',
  light_blue: '#78c7df',
  pink: '#d05da8',
  orange: '#f39a3d',
  red: '#d94b4b',
  yellow: '#efcf4f',
  green: '#2d9b68',
  dark_blue: '#3154a3',
}

export function findPlayer(players: GamePlayer[], roomPlayerId?: string | null) {
  if (!roomPlayerId) {
    return null
  }

  return players.find((player) => player.roomPlayerId === roomPlayerId) ?? null
}

export function getPlayerName(player: GamePlayer) {
  return player.username ?? player.botName ?? `Seat ${player.seatNumber}`
}

export function getPlayerColor(seatNumber: number) {
  const colors = ['#0f766e', '#b45309', '#6d5bd0', '#be123c']
  return colors[(seatNumber - 1) % colors.length]
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatCash(value: number) {
  return `W${formatMoney(value)}`
}

export function getTilePurchasePrice(tile?: GameTile | null) {
  if (!tile?.mortgageValue) {
    return null
  }

  return tile.mortgageValue * 2
}

export function formatPhase(phase?: string) {
  return phase ? phase.replaceAll('_', ' ') : '...'
}

export function formatDice(dice?: readonly [number, number] | null) {
  if (!dice) {
    return 'Dice ready'
  }

  return `${dice[0]} + ${dice[1]}`
}

export function getMinimumAuctionBid(auction?: GameAuction | null) {
  if (!auction || auction.currentBid <= 0) {
    return 10
  }

  return auction.currentBid + 10
}

export function getUnmortgageCost(mortgageValue: number) {
  return Math.ceil(mortgageValue * 1.1)
}

export function formatDebtReason(reason: GameDebt['reason']) {
  const labels: Record<GameDebt['reason'], string> = {
    rent: 'rent',
    tax: 'tax',
    card: 'a card',
    jail_fine: 'a jail fine',
  }

  return labels[reason]
}

export function formatEventSummary(
  event: GameEventLogItem,
  players: GamePlayer[],
) {
  const payload = event.payload
  const player = getEventPlayerName(players, payload, 'roomPlayerId')
  const payer = getEventPlayerName(players, payload, 'payerRoomPlayerId')
  const owner = getEventPlayerName(players, payload, 'ownerRoomPlayerId')
  const tile = getEventTileName(payload)
  const amount = getEventNumber(payload, 'amount')
  const dice = getEventDice(payload)

  switch (event.type) {
    case 'player_moved': {
      const from = getEventNumber(payload, 'from')
      const to = getEventNumber(payload, 'to')

      if (from !== null && to !== null) {
        return `${player} moved from ${from} to ${to}.`
      }

      return `${player} moved.`
    }

    case 'player_rolled_doubles':
      return `${player} rolled doubles${dice ? ` (${formatDice(dice)})` : ''}.`

    case 'player_rolled_third_doubles':
      return `${player} rolled three doubles and went to Jail.`

    case 'player_passed_go':
      return amount === null
        ? `${player} passed Go.`
        : `${player} passed Go and collected ${formatCash(amount)}.`

    case 'player_landed_on_tile':
      return `${player} landed on ${tile}.`

    case 'card_drawn':
      return `${player} drew a ${formatDeckName(payload)} card.`

    case 'card_applied':
      return `${player} resolved a ${formatDeckName(payload)} card.`

    case 'player_sent_to_jail':
      return `${player} was sent to Jail.`

    case 'jail_escape_roll_succeeded':
      return `${player} rolled doubles and left Jail.`

    case 'jail_escape_roll_failed': {
      const jailTurnCount = getEventNumber(payload, 'jailTurnCount')

      return `${player} stayed in Jail${
        jailTurnCount === null ? '.' : ` (${jailTurnCount}/3).`
      }`
    }

    case 'jail_forced_fine_paid':
      return `${player} paid the forced Jail fine.`

    case 'jail_fine_paid':
      return `${player} paid ${formatCash(amount ?? 50)} to leave Jail.`

    case 'player_released_from_jail':
      return `${player} left Jail.`

    case 'property_bought':
      return `${player} bought ${tile}${
        amount === null ? '.' : ` for ${formatCash(amount)}.`
      }`

    case 'property_purchase_declined':
      return `${player} sent ${tile} to auction.`

    case 'auction_started':
      return `${tile} went to auction.`

    case 'auction_bid_placed':
      return `${player} bid ${formatCash(amount ?? 0)} on ${tile}.`

    case 'auction_bid_passed':
      return `${player} passed on ${tile}.`

    case 'auction_won':
      return `${player} won ${tile}${
        amount === null ? '.' : ` for ${formatCash(amount)}.`
      }`

    case 'rent_paid':
      return `${payer} paid ${owner} ${formatCash(amount ?? 0)} rent on ${tile}.`

    case 'tax_paid':
      return `${player} paid ${formatCash(amount ?? 0)} tax.`

    case 'payment_required':
      return `${player} needs ${formatCash(amount ?? 0)}.`

    case 'debt_paid':
      return `${player} cleared a ${formatCash(amount ?? 0)} debt.`

    case 'property_house_built': {
      const houseCount = getEventNumber(payload, 'houseCount')

      return `${player} built a house on ${tile}${
        houseCount === null ? '.' : ` (${houseCount}).`
      }`
    }

    case 'property_hotel_built':
      return `${player} built a hotel on ${tile}.`

    case 'property_house_sold':
      return `${player} sold a house on ${tile}.`

    case 'property_hotel_sold':
      return `${player} sold a hotel on ${tile}.`

    case 'property_mortgaged':
      return `${player} mortgaged ${tile}.`

    case 'property_unmortgaged':
      return `${player} unmortgaged ${tile}.`

    case 'player_bankrupt':
      return `${player} went bankrupt.`

    case 'game_finished_by_bankruptcy':
      return 'The game ended by bankruptcy.'

    case 'game_finished_by_time':
      return 'The game ended on time.'

    case 'turn_ended':
      return `${player} ended the turn.`

    default:
      return event.type.replaceAll('_', ' ')
  }
}

function getEventPlayerName(
  players: GamePlayer[],
  payload: GameEventLogItem['payload'],
  key: string,
) {
  const roomPlayerId = getEventString(payload, key)
  const player = findPlayer(players, roomPlayerId)

  return player ? getPlayerName(player) : 'A player'
}

function getEventTileName(payload: GameEventLogItem['payload']) {
  const tileKey = getEventString(payload, 'tileKey')
  const tile = gameTiles.find((item) => item.key === tileKey)

  return tile?.name ?? tileKey ?? 'a tile'
}

function getEventString(payload: GameEventLogItem['payload'], key: string) {
  const value = payload[key]

  return typeof value === 'string' ? value : null
}

function getEventNumber(payload: GameEventLogItem['payload'], key: string) {
  const value = payload[key]

  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function getEventDice(payload: GameEventLogItem['payload']) {
  const value = payload.dice

  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  ) {
    return [value[0], value[1]] as const
  }

  return null
}

function formatDeckName(payload: GameEventLogItem['payload']) {
  const deckKey = getEventString(payload, 'deckKey')

  if (deckKey === 'world_fund') {
    return 'World Fund'
  }

  if (deckKey === 'chance') {
    return 'Chance'
  }

  return 'card'
}
