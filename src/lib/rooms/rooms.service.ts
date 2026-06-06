import { apiClient } from '#/lib/client/apiClient'
import type {
  CreateRoomRequest,
  InviteRoomRequest,
  Room,
  RoomInviteResponse,
  RoomMessageResponse,
  StartRoomResponse,
} from './rooms.types'

export function createRoom(input: CreateRoomRequest) {
  return apiClient<Room>('/rooms', {
    method: 'POST',
    body: input,
  })
}

export function getRoomByCode(code: string) {
  return apiClient<Room>(`/rooms/${encodeURIComponent(code)}`)
}

export function joinRoom(code: string) {
  return apiClient<Room>(`/rooms/${encodeURIComponent(code)}/join`, {
    method: 'POST',
  })
}

export function leaveRoom(code: string) {
  return apiClient<RoomMessageResponse>(
    `/rooms/${encodeURIComponent(code)}/leave`,
    {
      method: 'POST',
    },
  )
}

export function startRoom(code: string) {
  return apiClient<StartRoomResponse>(`/rooms/${encodeURIComponent(code)}/start`, {
    method: 'POST',
  })
}

export function inviteToRoom(code: string, input: InviteRoomRequest) {
  return apiClient<RoomInviteResponse>(
    `/rooms/${encodeURIComponent(code)}/invites`,
    {
      method: 'POST',
      body: input,
    },
  )
}
