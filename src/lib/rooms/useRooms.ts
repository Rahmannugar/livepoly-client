import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ROOMS_QUERY_KEYS } from './rooms.constants'
import * as roomsService from './rooms.service'

export function useRoom(code: string) {
  return useQuery({
    queryKey: ROOMS_QUERY_KEYS.room(code),
    queryFn: () => roomsService.getRoomByCode(code),
    enabled: Boolean(code),
  })
}

export function useRooms() {
  const queryClient = useQueryClient()

  const createRoom = useMutation({
    mutationFn: roomsService.createRoom,
    onSuccess: (room) => {
      queryClient.setQueryData(ROOMS_QUERY_KEYS.room(room.code), room)
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEYS.liveRooms })
    },
  })

  const joinRoom = useMutation({
    mutationFn: roomsService.joinRoom,
    onSuccess: (room) => {
      queryClient.setQueryData(ROOMS_QUERY_KEYS.room(room.code), room)
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEYS.liveRooms })
    },
  })

  const leaveRoom = useMutation({
    mutationFn: roomsService.leaveRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEYS.liveRooms })
    },
  })

  const startRoom = useMutation({
    mutationFn: roomsService.startRoom,
    onSuccess: (response) => {
      queryClient.setQueryData(
        ROOMS_QUERY_KEYS.room(response.room.code),
        response.room,
      )
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEYS.liveRooms })
    },
  })

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    startRoom,
  }
}
