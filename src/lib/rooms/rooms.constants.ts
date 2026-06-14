export const ROOM_DURATIONS = [60, 90, 120, 180] as const

export const BOT_DIFFICULTIES = ['easy', 'normal', 'hard'] as const

export const DEFAULT_ROOM_DURATION_MINUTES = 60

export const DEFAULT_BOT_DIFFICULTY = 'normal'

export const ROOMS_QUERY_KEYS = {
  room: (code: string) => ['rooms', 'room', code],
  currentRoom: ['rooms', 'current'],
  liveRooms: ['rooms', 'live'],
} as const
