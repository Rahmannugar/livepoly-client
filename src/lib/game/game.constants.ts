export const GAME_SOCKET_EVENTS = {
  authenticated: 'game:authenticated',
  join: 'game:join',
  joined: 'game:joined',
  rollAndMove: 'game:roll-and-move',
  buyProperty: 'game:buy-property',
  declinePropertyPurchase: 'game:decline-property-purchase',
  placeAuctionBid: 'game:place-auction-bid',
  passAuctionBid: 'game:pass-auction-bid',
  payDebt: 'game:pay-debt',
  payJailFine: 'game:pay-jail-fine',
  declareBankruptcy: 'game:declare-bankruptcy',
  buildProperty: 'game:build-property',
  sellBuilding: 'game:sell-building',
  mortgageProperty: 'game:mortgage-property',
  unmortgageProperty: 'game:unmortgage-property',
  endTurn: 'game:end-turn',
  state: 'game:state',
  events: 'game:events',
  eventsGet: 'game:events:get',
  eventsRecovered: 'game:events:recovered',
  heartbeat: 'game:heartbeat',
  heartbeatAcknowledged: 'game:heartbeat:acknowledged',
  presenceGet: 'game:presence:get',
  presence: 'game:presence',
  commandRejected: 'game:command-rejected',
  error: 'game:error',
} as const

export const GAME_HEARTBEAT_INTERVAL_MS = 25_000
export const GAME_PRESENCE_INTERVAL_MS = 30_000
export const GAME_ACCESS_TOKEN_REFRESH_INTERVAL_MS = 12 * 60 * 1_000
export const GAME_SOCKET_ACKNOWLEDGEMENT_TIMEOUT_MS = 8_000
export const GAME_SOCKET_EXCEPTION_EVENT = 'exception'

export const GAME_QUERY_KEYS = {
  result: (gameId: string) => ['game', gameId, 'result'] as const,
} as const
