import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { env } from '#/config/env'
import { useToast } from '#/components/common/toast'
import { AUTH_QUERY_KEYS } from '#/lib/auth/auth.constants'
import {
  getAccessToken,
  refreshSession,
  clearAccessToken,
} from '#/lib/auth/auth.service'
import type { AuthUser } from '#/lib/auth/auth.types'
import {
  NOTIFICATIONS_QUERY_KEYS,
  NOTIFICATIONS_STREAM_RECONNECT_DELAYS_MS,
} from './notifications.constants'
import { getNotificationsStreamUrl } from './notifications.service'

type StreamEvent = {
  event: string
  data: string
}

function getReconnectDelay(attempt: number) {
  return NOTIFICATIONS_STREAM_RECONNECT_DELAYS_MS[
    Math.min(attempt, NOTIFICATIONS_STREAM_RECONNECT_DELAYS_MS.length - 1)
  ]
}

function parseStreamMessage(message: string): StreamEvent | null {
  const lines = message.split('\n')
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

  return {
    event,
    data: dataLines.join('\n'),
  }
}

async function readNotificationStream(
  response: Response,
  onEvent: (event: StreamEvent) => void,
) {
  const reader = response.body?.getReader()

  if (!reader) {
    throw new Error('Notifications stream is unavailable.')
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

      const event = parseStreamMessage(message)

      if (event) {
        onEvent(event)
      }

      messageEndIndex = buffer.indexOf('\n\n')
    }
  }
}

export function NotificationsStream() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const stoppedRef = useRef(false)
  const user = useQuery<AuthUser | null>({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: () => null,
    enabled: false,
    initialData: null,
  })

  useEffect(() => {
    if (!user.data) {
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
            `${env.apiBaseUrl}${getNotificationsStreamUrl()}`,
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
            throw new Error(`Notifications stream failed: ${response.status}`)
          }

          reconnectAttempt = 0

          await readNotificationStream(response, (event) => {
            if (event.event === 'notification.created') {
              void queryClient.invalidateQueries({
                queryKey: NOTIFICATIONS_QUERY_KEYS.list,
              })
              if (
                !window.location.pathname.startsWith('/games/') &&
                !window.location.pathname.startsWith('/rooms/')
              ) {
                showToast({ kind: 'info', message: 'New notification.' })
              }
            }
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
  }, [queryClient, showToast, user.data])

  return null
}
