export const GAME_SOCKET_EVENTS = {
  join: 'game:join',
  joined: 'game:joined',
  rollAndMove: 'game:roll-and-move',
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
export const GAME_SOCKET_ACK_TIMEOUT_MS = 8_000
