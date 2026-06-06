import type { ROOM_DURATIONS } from './rooms.constants'

export type RoomDurationMinutes = (typeof ROOM_DURATIONS)[number]

export type RoomStatus = 'waiting' | 'active' | 'finished' | 'cancelled'

export type RoomPlayerStatus = 'joined' | 'left' | 'kicked'

export type RoomPlayerType = 'human' | 'bot'

export type CreateRoomRequest = {
  durationMinutes?: RoomDurationMinutes
}

export type RoomPlayer = {
  id: string
  roomId: string
  userId: string | null
  username: string | null
  playerType: RoomPlayerType
  botDifficulty: string | null
  botName: string | null
  seatNumber: number
  status: RoomPlayerStatus
  joinedAt: string
  leftAt: string | null
}

export type Room = {
  id: string
  code: string
  hostUserId: string
  status: RoomStatus
  maxPlayers: number
  spectatorCount: number
  durationMinutes: RoomDurationMinutes
  boardKey: string
  createdAt: string
  startedAt: string | null
  endedAt: string | null
  players: RoomPlayer[]
}

export type RoomMessageResponse = {
  message: string
}

export type Game = {
  id: string
  roomId: string
  mode: string
  status: string
  currentTurnRoomPlayerId: string
  turnNumber: number
  state: Record<string, unknown>
  startedAt: string
  finishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type StartRoomResponse = {
  room: Room
  game: Game
}
