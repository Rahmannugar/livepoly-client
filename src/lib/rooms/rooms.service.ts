import { apiClient } from '#/lib/client/apiClient'
import type {
  CreateRoomRequest,
  InviteRoomRequest,
  Room,
  RoomInviteResponse,
  RoomMessageResponse,
  RoomSpectatorResponse,
  StartRoomRequest,
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

export function listLiveRooms() {
  return apiClient<Room[]>('/rooms')
}

export function getCurrentRoom() {
  return apiClient<Room | null>('/rooms/current')
}

export function joinRoom(code: string) {
  return apiClient<Room>(`/rooms/${encodeURIComponent(code)}/join`, {
    method: 'POST',
  })
}

export function spectateRoom(code: string) {
  return apiClient<RoomSpectatorResponse>(
    `/rooms/${encodeURIComponent(code)}/spectate`,
    {
      method: 'POST',
    },
  )
}

export function stopSpectatingRoom(code: string) {
  return apiClient<RoomMessageResponse>(
    `/rooms/${encodeURIComponent(code)}/spectate`,
    {
      method: 'DELETE',
    },
  )
}

export function leaveRoom(code: string) {
  return apiClient<RoomMessageResponse>(
    `/rooms/${encodeURIComponent(code)}/leave`,
    {
      method: 'POST',
    },
  )
}

export function startRoom(input: StartRoomRequest) {
  return apiClient<StartRoomResponse>(
    `/rooms/${encodeURIComponent(input.code)}/start`,
    {
      method: 'POST',
      body:
        input.botDifficulty === undefined
          ? undefined
          : { botDifficulty: input.botDifficulty },
    },
  )
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
