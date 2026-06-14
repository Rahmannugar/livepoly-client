export type GameLiveAccess = 'player' | 'spectator'

export type DiceRoll = readonly [number, number]

export type GamePhase =
  | 'awaiting_first_turn'
  | 'awaiting_roll'
  | 'awaiting_property_decision'
  | 'awaiting_auction_bid'
  | 'awaiting_debt_resolution'
  | 'awaiting_turn_end'
  | 'finished'
  | 'cancelled'

export type GamePlayer = {
  roomPlayerId: string
  userId: string | null
  username: string | null
  playerType: 'human' | 'bot'
  botDifficulty: string | null
  botName: string | null
  seatNumber: number
  cash: number
  position: number
  inJail: boolean
  jailTurnCount: number
  getOutOfJailFreeCards: number
  consecutiveMissedTurns?: number
  lastMissedTurnNumber?: number | null
  bankrupt: boolean
}

export type GameProperty = {
  tileKey: string
  ownerRoomPlayerId: string | null
  houseCount: number
  hasHotel: boolean
  mortgaged: boolean
}

export type GameAuction = {
  tileKey: string
  currentBid: number
  highestBidderRoomPlayerId: string | null
  currentBidderRoomPlayerId: string | null
  activeRoomPlayerIds: string[]
  passedRoomPlayerIds: string[]
}

export type GameDebt = {
  roomPlayerId: string
  creditorRoomPlayerId: string | null
  amount: number
  reason: 'rent' | 'tax' | 'card' | 'jail_fine'
}

export type GameState = {
  version: 1
  roomId: string
  roomCode: string
  boardKey: string
  mode: 'ranked' | 'casual'
  startedAt?: number | null
  durationMinutes?: number | null
  expiresAt?: number | null
  turnExpiresAt?: number | null
  phase: GamePhase
  turnNumber: number
  currentTurnRoomPlayerId: string
  consecutiveDoublesCount: number
  shouldCurrentPlayerPlayAgain: boolean
  lastDiceRoll?: DiceRoll | null
  pendingTileKey?: string | null
  auction?: GameAuction | null
  debt?: GameDebt | null
  decks: {
    chance: { drawPile: string[]; discardPile: string[] }
    worldFund: { drawPile: string[]; discardPile: string[] }
  }
  players: GamePlayer[]
  properties: GameProperty[]
}

export type GameJoinedEvent = {
  gameId: string
  access: GameLiveAccess
  state: GameState
  roomPlayerId?: string
  spectatorId?: string
}

export type GameStateEvent = {
  gameId: string
  state: GameState
}

export type GameEngineEvent = {
  type: string
  [key: string]: unknown
}

export type GameEventsEvent = {
  gameId: string
  events: GameEngineEvent[]
}

export type GameEventRecoveryItem = {
  sequence: number
  type: string
  payload: GameEngineEvent
  createdAt: string
}

export type GameEventsRecoveredEvent = {
  gameId: string
  items: GameEventRecoveryItem[]
  nextCursor: string | null
  hasMore: boolean
}

export type GamePresenceUser = {
  userId: string
  access: GameLiveAccess
  socketCount: number
  lastSeenAt: string
}

export type GamePresenceEvent = {
  gameId: string
  onlineUsers: GamePresenceUser[]
  playersOnline: number
  spectatorsOnline: number
}

export type GameCommandRejectedEvent = {
  gameId: string
  command: string
  code?: string
  message: string
}

export type GameSocketErrorEvent = {
  message: string
  code?: string
}

export type GameConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'joined'
  | 'disconnected'
  | 'error'

export type GameEventLogItem =
  | GameEventRecoveryItem
  | {
      sequence: null
      type: string
      payload: GameEngineEvent
      createdAt: string
    }

export type GameResultEndReason = 'bankruptcy' | 'time_elapsed' | 'cancelled'

export type GameResultPlayer = {
  roomPlayerId: string
  userId: string | null
  username: string | null
  playerType: 'human' | 'bot'
  botName: string | null
  seatNumber: number
  startingCash: number
  finalCash: number
  finalNetWorth: number
  placement: number
  bankruptAt: string | null
}

export type GameResult = {
  gameId: string
  roomId: string
  roomCode: string
  mode: 'ranked' | 'casual'
  endReason: GameResultEndReason
  winnerRoomPlayerId: string | null
  winnerUserId: string | null
  durationSeconds: number
  completedAt: string
  players: GameResultPlayer[]
}
