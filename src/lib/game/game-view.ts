import {
  formatCash,
  formatEventSummary,
  getPlayerName,
  getTilePurchasePrice,
  type GameTile,
} from './game-board'
import type {
  GameAuction,
  GameDebt,
  GameEventLogItem,
  GamePlayer,
} from './game.types'

export type PrimaryGameAction = {
  command: 'roll' | 'endTurn' | 'propertyDecision' | null
  enabled: boolean
  label: string
  copy: string
}

export function getGameTurnConsequence({
  phase,
  tile,
  currentTurnPlayer,
  recentEvent,
  players,
}: {
  phase?: string
  tile: GameTile | null
  currentTurnPlayer: GamePlayer | null
  recentEvent: GameEventLogItem | undefined
  players: GamePlayer[]
}) {
  if (phase === 'finished') {
    return 'Game over.'
  }

  if (phase === 'cancelled') {
    return 'This game was cancelled and no more moves can be made.'
  }

  if (phase === 'awaiting_debt_resolution' && currentTurnPlayer) {
    return `${getPlayerName(currentTurnPlayer)} is resolving a payment.`
  }

  if (
    currentTurnPlayer?.playerType === 'bot' &&
    (phase === 'awaiting_first_turn' ||
      phase === 'awaiting_roll' ||
      phase === 'awaiting_turn_end' ||
      phase === 'awaiting_property_decision' ||
      phase === 'awaiting_auction_bid' ||
      phase === 'awaiting_debt_resolution')
  ) {
    return `${getPlayerName(currentTurnPlayer)} is playing.`
  }

  if (phase === 'awaiting_property_decision' && tile) {
    const price = getTilePurchasePrice(tile)

    return price
      ? `${tile.name} is unowned. Buy it for ${formatCash(price)} or send it to auction.`
      : `${tile.name} is waiting for your decision.`
  }

  if (phase === 'awaiting_auction_bid' && tile) {
    return `${tile.name} is in auction. Bid or pass when it is your chance.`
  }

  if (phase === 'awaiting_debt_resolution') {
    return 'A payment is due before the game can continue.'
  }

  if (recentEvent?.type === 'rent_paid') {
    return 'Rent was paid on the landed property.'
  }

  if (recentEvent?.type === 'tax_paid') {
    return 'Tax was paid. The turn can continue.'
  }

  if (
    recentEvent?.type === 'card_drawn' ||
    recentEvent?.type === 'card_applied'
  ) {
    return 'A card was drawn and resolved.'
  }

  if (recentEvent?.type === 'player_landed_on_tile' && tile) {
    return `${tile.name} is the latest landed square.`
  }

  if (recentEvent && isTableActivityEvent(recentEvent.type)) {
    return formatEventSummary(recentEvent, players)
  }

  if (phase === 'awaiting_turn_end') {
    return 'The move is settled. End the turn when ready.'
  }

  if (phase === 'awaiting_first_turn' || phase === 'awaiting_roll') {
    return 'Roll the dice to move around the game.'
  }

  return 'Waiting for the next move.'
}

function isTableActivityEvent(type: string) {
  return (
    type === 'property_house_built' ||
    type === 'property_hotel_built' ||
    type === 'property_house_sold' ||
    type === 'property_hotel_sold' ||
    type === 'property_mortgaged' ||
    type === 'property_unmortgaged' ||
    type === 'trade_proposed' ||
    type === 'trade_buildings_liquidated' ||
    type === 'trade_accepted' ||
    type === 'trade_rejected' ||
    type === 'trade_cancelled'
  )
}

export function getPrimaryGameAction({
  access,
  isCurrentTurn,
  phase,
  status,
  hasState,
  pendingTileName,
  roomPlayerId,
  currentTurnPlayer,
  currentPlayerInJail,
  shouldCurrentPlayerPlayAgain,
  auction,
  debt,
  gameExpired,
}: {
  access: string | null
  isCurrentTurn: boolean
  phase?: string
  status: string
  hasState: boolean
  pendingTileName?: string
  roomPlayerId: string | null
  currentTurnPlayer: GamePlayer | null
  currentPlayerInJail: boolean
  shouldCurrentPlayerPlayAgain: boolean
  auction?: GameAuction | null
  debt?: GameDebt | null
  gameExpired: boolean
}): PrimaryGameAction {
  const isActivePlayer =
    isCurrentTurn ||
    Boolean(roomPlayerId && currentTurnPlayer?.roomPlayerId === roomPlayerId)

  if (!hasState && (status === 'connecting' || status === 'connected')) {
    return {
      command: null,
      enabled: false,
      label: 'Joining',
      copy: 'Taking your seat at the table.',
    }
  }

  if (status === 'disconnected') {
    return {
      command: null,
      enabled: false,
      label: 'Rejoining',
      copy: 'Reconnecting.',
    }
  }

  if (!hasState && status === 'error') {
    return {
      command: null,
      enabled: false,
      label: 'Unavailable',
      copy: 'This table is not available right now.',
    }
  }

  if (access === 'spectator') {
    return {
      command: null,
      enabled: false,
      label: 'Watching game',
      copy: 'You are watching this table.',
    }
  }

  if (phase === 'finished' || phase === 'cancelled') {
    return {
      command: null,
      enabled: false,
      label: phase === 'cancelled' ? 'Cancelled' : 'Game over',
      copy:
        phase === 'cancelled'
          ? 'This game was cancelled.'
          : 'Open results to review the final table.',
    }
  }

  if (gameExpired) {
    return {
      command: null,
      enabled: false,
      label: 'Game over',
      copy: 'Open results to review the final table.',
    }
  }

  if (phase === 'awaiting_auction_bid' && auction) {
    const hasPassed = Boolean(
      roomPlayerId && auction.passedRoomPlayerIds.includes(roomPlayerId),
    )
    const canBid = Boolean(
      roomPlayerId &&
      auction.currentBidderRoomPlayerId === roomPlayerId &&
      !hasPassed,
    )

    return {
      command: null,
      enabled: false,
      label: canBid ? 'Bid or pass' : hasPassed ? 'Passed' : 'Auction live',
      copy: canBid
        ? 'Raise the bid or pass.'
        : hasPassed
          ? 'You have passed in this auction.'
          : 'Another player is bidding.',
    }
  }

  if (phase === 'awaiting_debt_resolution' && debt) {
    const isDebtor = roomPlayerId === debt.roomPlayerId

    return {
      command: null,
      enabled: false,
      label: isDebtor ? 'Debt due' : 'Debt pending',
      copy: isDebtor
        ? 'Settle the payment or declare bankruptcy.'
        : currentTurnPlayer
          ? `${getPlayerName(currentTurnPlayer)} is resolving a payment.`
          : 'A player is resolving a payment.',
    }
  }

  if (!isActivePlayer) {
    if (currentTurnPlayer?.playerType === 'bot') {
      return {
        command: null,
        enabled: false,
        label: 'Bot turn',
        copy: `${getPlayerName(currentTurnPlayer)} is playing.`,
      }
    }

    return {
      command: null,
      enabled: false,
      label: 'Between moves',
      copy:
        phase === 'awaiting_property_decision'
          ? 'Another player is choosing a property.'
          : phase === 'awaiting_turn_end'
            ? 'Another player is finishing their turn.'
            : 'Another player is up.',
    }
  }

  if (phase === 'awaiting_first_turn' || phase === 'awaiting_roll') {
    if (currentPlayerInJail) {
      return {
        command: null,
        enabled: false,
        label: 'Jail turn',
        copy: 'Roll doubles, pay the fine, or use a card.',
      }
    }

    return {
      command: 'roll',
      enabled: true,
      label: 'Roll dice',
      copy:
        phase === 'awaiting_first_turn'
          ? 'Roll to start your first move.'
          : 'Roll to move and resolve the tile you land on.',
    }
  }

  if (phase === 'awaiting_turn_end') {
    return {
      command: 'endTurn',
      enabled: true,
      label: 'End turn',
      copy: shouldCurrentPlayerPlayAgain
        ? 'You rolled doubles. End this move to keep your turn.'
        : 'Pass play to the next player.',
    }
  }

  if (phase === 'awaiting_property_decision') {
    return {
      command: 'propertyDecision',
      enabled: true,
      label: 'Buy or auction',
      copy: pendingTileName
        ? `Buy ${pendingTileName} or send it to auction.`
        : 'Choose whether to buy this property or send it to auction.',
    }
  }

  return {
    command: null,
    enabled: false,
    label: isActivePlayer ? 'No action' : 'Between moves',
    copy: 'Waiting for the next move.',
  }
}
