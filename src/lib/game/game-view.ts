import {
  formatCash,
  getPlayerName,
  getTilePurchasePrice,
  type GameTile,
} from './game-board'
import type { GameAuction, GameDebt, GamePlayer } from './game.types'

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
}: {
  phase?: string
  tile: GameTile | null
  currentTurnPlayer: GamePlayer | null
  recentEvent: { type: string; payload: Record<string, unknown> } | undefined
}) {
  if (phase === 'finished') {
    return 'The game has ended. Final results are being saved.'
  }

  if (phase === 'cancelled') {
    return 'This game was cancelled and no more moves can be made.'
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
    return `${getPlayerName(currentTurnPlayer)} is making an automated move.`
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

  if (phase === 'awaiting_turn_end') {
    return 'The move is settled. End the turn when ready.'
  }

  if (phase === 'awaiting_first_turn' || phase === 'awaiting_roll') {
    return 'Roll the dice to move around the game.'
  }

  return 'Waiting for the next game update.'
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
      label: 'Joining game',
      copy: 'Opening the live game connection.',
    }
  }

  if (status === 'disconnected') {
    return {
      command: null,
      enabled: false,
      label: 'Reconnecting',
      copy: 'Trying to restore the live game connection.',
    }
  }

  if (!hasState && status === 'error') {
    return {
      command: null,
      enabled: false,
      label: 'Unavailable',
      copy: 'This game could not be opened right now.',
    }
  }

  if (access === 'spectator') {
    return {
      command: null,
      enabled: false,
      label: 'Watching game',
      copy: 'Spectators can watch the game but cannot make moves.',
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
          : 'Final results are being saved.',
    }
  }

  if (gameExpired) {
    return {
      command: null,
      enabled: false,
      label: 'Finishing',
      copy: 'Time is up. Waiting for final results.',
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
        ? 'Raise the bid or pass in the auction controls.'
        : hasPassed
          ? 'You have passed in this auction.'
          : 'Waiting for the active bidder.',
    }
  }

  if (phase === 'awaiting_debt_resolution' && debt) {
    const isDebtor = roomPlayerId === debt.roomPlayerId

    return {
      command: null,
      enabled: false,
      label: isDebtor ? 'Debt due' : 'Debt pending',
      copy: isDebtor
        ? 'Resolve this payment before the game can continue.'
        : 'Waiting for the indebted player to resolve payment.',
    }
  }

  if (!isActivePlayer) {
    if (currentTurnPlayer?.playerType === 'bot') {
      return {
        command: null,
        enabled: false,
        label: 'Bot turn',
        copy: `${getPlayerName(currentTurnPlayer)} is making an automated move.`,
      }
    }

    return {
      command: null,
      enabled: false,
      label: 'Waiting',
      copy:
        phase === 'awaiting_property_decision'
          ? 'Waiting for the active player to decide on the property.'
          : phase === 'awaiting_turn_end'
            ? 'Waiting for the active player to end the turn.'
            : 'Waiting for the active player.',
    }
  }

  if (phase === 'awaiting_first_turn' || phase === 'awaiting_roll') {
    if (currentPlayerInJail) {
      return {
        command: null,
        enabled: false,
        label: 'Jail turn',
        copy: 'Roll doubles or pay the fine in the jail controls.',
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
        : 'Your move is settled. Pass play to the next player.',
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
    label: isActivePlayer ? 'No action yet' : 'Resolving',
    copy: phase
      ? isActivePlayer
        ? `You are up, but ${phase.replaceAll('_', ' ')} has no direct action yet.`
        : `Resolving ${phase.replaceAll('_', ' ')}.`
      : 'Waiting for the next game state.',
  }
}
