export const ROOM_DURATIONS = [30, 60, 120, 180] as const

export const DEFAULT_ROOM_DURATION_MINUTES = 60

export const ROOMS_QUERY_KEYS = {
  room: (code: string) => ['rooms', 'room', code],
  currentRoom: ['rooms', 'current'],
  liveRooms: ['rooms', 'live'],
} as const
