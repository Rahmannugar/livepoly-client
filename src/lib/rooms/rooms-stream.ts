import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { env } from '#/config/env'
import {
  clearAccessToken,
  getAccessToken,
  refreshSession,
} from '#/lib/auth/auth.service'
import { AUTH_QUERY_KEYS } from '#/lib/auth/auth.constants'
import { ROOMS_QUERY_KEYS } from './rooms.constants'
import { getRoomStreamUrl } from './rooms.service'

const ROOM_STREAM_RECONNECT_DELAYS_MS = [1_000, 2_000, 5_000, 10_000] as const

function getReconnectDelay(attempt: number) {
  return ROOM_STREAM_RECONNECT_DELAYS_MS[
    Math.min(attempt, ROOM_STREAM_RECONNECT_DELAYS_MS.length - 1)
  ]
}

async function readRoomStream(response: Response, onRoomChanged: () => void) {
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

    buffer += decoder.decode(value, { stream: true })

    let messageEndIndex = buffer.indexOf('\n\n')

    while (messageEndIndex !== -1) {
      const message = buffer.slice(0, messageEndIndex)
      buffer = buffer.slice(messageEndIndex + 2)

      if (message.includes('event: room.updated')) {
        onRoomChanged()
      }

      messageEndIndex = buffer.indexOf('\n\n')
    }
  }
}

export function useRoomStream(code: string, enabled = true) {
  const queryClient = useQueryClient()
  const stoppedRef = useRef(false)

  useEffect(() => {
    if (!enabled || !code) {
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

          await readRoomStream(response, () => {
            void queryClient.invalidateQueries({
              queryKey: ROOMS_QUERY_KEYS.room(code),
            })
            void queryClient.invalidateQueries({
              queryKey: ROOMS_QUERY_KEYS.currentRoom,
            })
            void queryClient.invalidateQueries({
              queryKey: ROOMS_QUERY_KEYS.liveRooms,
            })
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
  }, [code, enabled, queryClient])
}
