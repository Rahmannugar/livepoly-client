export const ROOM_DURATIONS = [60, 90] as const

export const BOT_DIFFICULTIES = ['easy', 'normal', 'hard'] as const

export const DEFAULT_ROOM_DURATION_MINUTES = 60

export const DEFAULT_BOT_DIFFICULTY = 'normal'

export const WAITING_ROOM_EXPIRY_MS = 60 * 60 * 1000

export const ROOMS_QUERY_KEYS = {
  room: (code: string) => ['rooms', 'room', code],
  currentRoom: ['rooms', 'current'],
  liveRooms: ['rooms', 'live'],
} as const
