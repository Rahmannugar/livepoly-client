import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { env } from '#/config/env'
import {
  clearAccessToken,
  getAccessToken,
  refreshSession,
} from '#/lib/auth/auth.service'
import { AUTH_QUERY_KEYS } from '#/lib/auth/auth.constants'
import { useAuth } from '#/lib/auth/useAuth'
import { ROOMS_QUERY_KEYS } from './rooms.constants'
import { getRoomStreamUrl } from './rooms.service'

const ROOM_STREAM_RECONNECT_DELAYS_MS = [1_000, 2_000, 5_000, 10_000] as const
const ROOM_STREAM_EVENTS = new Set([
  'room.updated',
  'room.created',
  'room.joined',
  'room.left',
  'room.cancelled',
  'room.spectator_joined',
  'room.spectator_left',
  'room.started',
])

type RoomStreamPayload = {
  event?: string
  data?: {
    roomId?: string
    roomCode?: string
    changedAt?: string
  }
}

export type RoomStreamEvent = {
  event: string
  data: RoomStreamPayload | null
}

function getReconnectDelay(attempt: number) {
  return ROOM_STREAM_RECONNECT_DELAYS_MS[
    Math.min(attempt, ROOM_STREAM_RECONNECT_DELAYS_MS.length - 1)
  ]
}

function parseStreamMessage(message: string): RoomStreamEvent | null {
  const lines = message.replaceAll('\r\n', '\n').split('\n')
  let event = 'message'
  const dataLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice('event:'.length).trim()
      continue
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trimStart())
    }
  }

  if (!dataLines.length) {
    return null
  }

  try {
    return {
      event,
      data: JSON.parse(dataLines.join('\n')) as RoomStreamPayload,
    }
  } catch {
    return {
      event,
      data: null,
    }
  }
}

function isRoomStreamEvent(event: RoomStreamEvent) {
  return (
    ROOM_STREAM_EVENTS.has(event.event) ||
    (event.data?.event ? ROOM_STREAM_EVENTS.has(event.data.event) : false)
  )
}

async function readRoomStream(
  response: Response,
  onRoomChanged: (event: RoomStreamEvent) => void,
) {
  const reader = response.body?.getReader()

  if (!reader) {
    throw new Error('Room stream is unavailable.')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true }).replaceAll('\r\n', '\n')

    let messageEndIndex = buffer.indexOf('\n\n')

    while (messageEndIndex !== -1) {
      const message = buffer.slice(0, messageEndIndex)
      buffer = buffer.slice(messageEndIndex + 2)

      const event = parseStreamMessage(message)

      if (event && isRoomStreamEvent(event)) {
        onRoomChanged(event)
      }

      messageEndIndex = buffer.indexOf('\n\n')
    }
  }
}

export function useRoomStream({
  code,
  enabled = true,
  onRoomUpdated,
}: {
  code: string
  enabled?: boolean
  onRoomUpdated?: (event: RoomStreamEvent) => void
}) {
  const queryClient = useQueryClient()
  const auth = useAuth()
  const stoppedRef = useRef(false)

  useEffect(() => {
    if (!enabled || !code || !auth.hydration.data || !auth.currentUser.data) {
      return
    }

    let reconnectAttempt = 0
    stoppedRef.current = false
    const abortController = new AbortController()

    async function ensureAccessToken() {
      const currentAccessToken = getAccessToken()

      if (currentAccessToken) {
        return currentAccessToken
      }

      const session = await refreshSession()
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, session.user)

      return session.accessToken
    }

    async function connect() {
      while (!stoppedRef.current) {
        try {
          const accessToken = await ensureAccessToken()

          const response = await fetch(
            `${env.apiBaseUrl}${getRoomStreamUrl(code)}`,
            {
              headers: {
                Accept: 'text/event-stream',
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: 'include',
              signal: abortController.signal,
            },
          )

          if (response.status === 401) {
            clearAccessToken()
            await ensureAccessToken()
            continue
          }

          if (!response.ok) {
            throw new Error(`Room stream failed: ${response.status}`)
          }

          reconnectAttempt = 0

          await readRoomStream(response, (event) => {
            void queryClient.invalidateQueries({
              queryKey: ROOMS_QUERY_KEYS.room(code),
            })
            void queryClient.invalidateQueries({
              queryKey: ROOMS_QUERY_KEYS.currentRoom,
            })
            void queryClient.invalidateQueries({
              queryKey: ROOMS_QUERY_KEYS.liveRooms,
            })
            onRoomUpdated?.(event)
          })
        } catch (error) {
          if (stoppedRef.current || abortController.signal.aborted) {
            return
          }

          if (error instanceof Error && error.name === 'AbortError') {
            return
          }

          const delay = getReconnectDelay(reconnectAttempt)
          reconnectAttempt += 1

          await new Promise((resolve) => window.setTimeout(resolve, delay))
        }
      }
    }

    void connect()

    return () => {
      stoppedRef.current = true
      abortController.abort()
    }
  }, [
    auth.currentUser.data,
    auth.hydration.data,
    code,
    enabled,
    onRoomUpdated,
    queryClient,
  ])
}
