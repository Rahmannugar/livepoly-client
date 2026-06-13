import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'
import { env } from '#/config/env'
import { AUTH_QUERY_KEYS } from '#/lib/auth/auth.constants'
import { getAccessToken, refreshSession } from '#/lib/auth/auth.service'
import type { AuthUser } from '#/lib/auth/auth.types'
import {
  GAME_ACCESS_TOKEN_REFRESH_INTERVAL_MS,
  GAME_HEARTBEAT_INTERVAL_MS,
  GAME_PRESENCE_INTERVAL_MS,
  GAME_SOCKET_ACKNOWLEDGEMENT_TIMEOUT_MS,
  GAME_SOCKET_EXCEPTION_EVENT,
  GAME_SOCKET_EVENTS,
} from './game.constants'
import type {
  GameCommandRejectedEvent,
  GameConnectionStatus,
  GameEngineEvent,
  GameEventLogItem,
  GameEventsEvent,
  GameEventsRecoveredEvent,
  GameJoinedEvent,
  GamePresenceEvent,
  GameSocketErrorEvent,
  GameState,
  GameStateEvent,
} from './game.types'

type SocketAcknowledgement<T> = {
  event: string
  data: T
}

type SocketExceptionPayload = {
  message?: unknown
  code?: string
}

type GameCommandStateResponse = GameStateEvent & {
  events?: GameEngineEvent[]
}

const MAX_GAME_EVENTS = 80

function debugGameSocket(message: string, details?: Record<string, unknown>) {
  if (!import.meta.env.DEV) {
    return
  }

  console.info(`[LivePoly game socket] ${message}`, details ?? {})
}

function getGameSocketErrorMessage(message: string) {
  const normalized = message.trim()

  if (!normalized) {
    return 'Game connection failed.'
  }

  if (
    normalized.includes('xhr poll error') ||
    normalized.includes('websocket error') ||
    normalized.includes('timeout')
  ) {
    return 'Could not connect to the game server.'
  }

  if (normalized === 'Authentication required') {
    return 'Sign in again to continue this game.'
  }

  if (normalized === 'Game access denied') {
    return 'You are not part of this game.'
  }

  return normalized
}

function getSocketPayloadMessage(payload: unknown) {
  if (typeof payload === 'string') {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return 'Game socket request failed.'
  }

  const message = (payload as SocketExceptionPayload).message

  if (typeof message === 'string') {
    return message
  }

  if (message && typeof message === 'object') {
    const nestedMessage = (message as SocketExceptionPayload).message

    if (typeof nestedMessage === 'string') {
      return nestedMessage
    }
  }

  return 'Game socket request failed.'
}

function isSocketAcknowledgement<T>(
  response: unknown,
): response is SocketAcknowledgement<T> {
  return Boolean(
    response &&
      typeof response === 'object' &&
      'event' in response &&
      'data' in response,
  )
}

function isGameResponse<TResponse extends { gameId?: string }>(
  response: unknown,
): response is TResponse {
  return Boolean(
    response &&
      typeof response === 'object' &&
      ('gameId' in response || 'state' in response || 'items' in response),
  )
}

function createLiveEventItems(events: GameEngineEvent[]): GameEventLogItem[] {
  const createdAt = new Date().toISOString()

  return events.map((event) => ({
    sequence: null,
    type: event.type,
    payload: event,
    createdAt,
  }))
}

function mergeGameEvents(
  current: GameEventLogItem[],
  incoming: GameEventLogItem[],
) {
  const seen = new Set<string>()

  return [...incoming, ...current]
    .filter((event) => {
      const key = getGameEventIdentity(event)

      if (seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
    .slice(0, MAX_GAME_EVENTS)
}

function getGameEventIdentity(event: GameEventLogItem) {
  if (event.sequence !== null) {
    return `sequence:${event.sequence}`
  }

  return `${event.type}:${JSON.stringify(event.payload)}`
}

export function useGame(gameId: string) {
  const authUser = useQuery<AuthUser | null>({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: () => null,
    enabled: false,
    initialData: null,
  })
  const authHydration = useQuery({
    queryKey: AUTH_QUERY_KEYS.hydration,
    queryFn: () => true,
    enabled: false,
    initialData: false,
  })
  const socketRef = useRef<Socket | null>(null)
  const [status, setStatus] = useState<GameConnectionStatus>('connecting')
  const [state, setState] = useState<GameState | null>(null)
  const [access, setAccess] = useState<GameJoinedEvent['access'] | null>(null)
  const [roomPlayerId, setRoomPlayerId] = useState<string | null>(null)
  const [presence, setPresence] = useState<GamePresenceEvent | null>(null)
  const [events, setEvents] = useState<GameEventLogItem[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [commandPending, setCommandPending] = useState(false)
  const [authRefreshTick, setAuthRefreshTick] = useState(0)

  const disconnectSocket = useCallback(() => {
    const socket = socketRef.current

    if (!socket) {
      return
    }

    socket.off()
    socket.disconnect()
    socketRef.current = null
  }, [])

  const currentPlayer = useMemo(() => {
    if (!state || !roomPlayerId) {
      return null
    }

    return (
      state.players.find((player) => player.roomPlayerId === roomPlayerId) ??
      null
    )
  }, [roomPlayerId, state])

  const isCurrentTurn =
    Boolean(state && roomPlayerId) &&
    state?.currentTurnRoomPlayerId === roomPlayerId

  const requestGameEvent = useCallback(
    async <TResponse extends { gameId?: string },>(
      event: string,
      expectedEvent: string,
      payload: object,
    ) => {
      const socket = socketRef.current

      if (!socket) {
        throw new Error('Game socket is not connected')
      }

      return new Promise<TResponse>((resolve, reject) => {
        let timeoutId: number

        const handleEvent = (data: TResponse) => {
          if (data.gameId && data.gameId !== gameId) {
            return
          }

          cleanup()
          resolve(data)
        }

        const handleCommandRejected = (data: GameCommandRejectedEvent) => {
          if (data.gameId !== gameId) {
            return
          }

          cleanup()
          reject(new Error(getGameSocketErrorMessage(data.message)))
        }

        const handleSocketError = (data: unknown) => {
          cleanup()
          reject(new Error(getGameSocketErrorMessage(getSocketPayloadMessage(data))))
        }

        const cleanup = () => {
          window.clearTimeout(timeoutId)
          socket.off(expectedEvent, handleEvent)
          socket.off(GAME_SOCKET_EVENTS.commandRejected, handleCommandRejected)
          socket.off(GAME_SOCKET_EVENTS.error, handleSocketError)
          socket.off(GAME_SOCKET_EXCEPTION_EVENT, handleSocketError)
        }

        timeoutId = window.setTimeout(() => {
          cleanup()
          reject(new Error('Game server did not respond in time'))
        }, GAME_SOCKET_ACKNOWLEDGEMENT_TIMEOUT_MS)

        socket.on(expectedEvent, handleEvent)
        socket.on(GAME_SOCKET_EVENTS.commandRejected, handleCommandRejected)
        socket.on(GAME_SOCKET_EVENTS.error, handleSocketError)
        socket.on(GAME_SOCKET_EXCEPTION_EVENT, handleSocketError)
        socket.emit(event, payload, (response?: unknown) => {
          debugGameSocket('ack received', {
            event,
            expectedEvent,
            response,
          })

          if (isSocketAcknowledgement<TResponse>(response)) {
            handleEvent(response.data)
            return
          }

          if (isGameResponse<TResponse>(response)) {
            handleEvent(response)
            return
          }

          if (response) {
            handleSocketError(response)
          }
        })
      })
    },
    [gameId],
  )

  useEffect(() => {
    const token = getAccessToken()

    debugGameSocket('auth check before connect', {
      gameId,
      hasToken: Boolean(token),
      hydrated: authHydration.data,
      authUserId: authUser.data?.id ?? null,
    })

    if (!token && !authHydration.data) {
      disconnectSocket()
      setStatus('connecting')
      setErrorMessage(null)
      return
    }

    if (!token) {
      let cancelled = false

      void refreshSession()
        .then(() => {
          if (!cancelled) {
            setAuthRefreshTick((current) => current + 1)
          }
        })
        .catch(() => {
          if (!cancelled) {
            disconnectSocket()
            setStatus('error')
            setErrorMessage('Sign in again to continue this game.')
          }
        })

      return () => {
        cancelled = true
      }
    }

    disconnectSocket()
    setStatus('connecting')
    setErrorMessage(null)

    const socket = io(`${env.realtimeBaseUrl}/game`, {
      auth: { token },
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 900,
      reconnectionDelayMax: 5_000,
      timeout: 10_000,
    })
    socketRef.current = socket
    let authRefreshInFlight = false
    let authRecoveryAttempts = 0

    async function refreshGameSocketToken() {
      if (authRefreshInFlight) {
        return null
      }

      authRefreshInFlight = true

      try {
        const session = await refreshSession()
        socket.auth = { token: session.accessToken }
        return session.accessToken
      } catch {
        return null
      } finally {
        authRefreshInFlight = false
      }
    }

    async function recoverFromSocketAuthFailure() {
      if (authRecoveryAttempts >= 1) {
        setStatus('error')
        setErrorMessage('Sign in again to continue this game.')
        return
      }

      authRecoveryAttempts += 1
      debugGameSocket('auth refresh requested', { gameId })

      const nextToken = await refreshGameSocketToken()

      if (!nextToken) {
        setStatus('error')
        setErrorMessage('Sign in again to continue this game.')
        return
      }

      setStatus('connecting')
      setErrorMessage(null)
      socket.disconnect()
      socket.connect()
    }

    async function joinGame() {
      try {
        if (!socket.connected) {
          debugGameSocket('join skipped until socket connects', { gameId })
          return
        }

        debugGameSocket('join requested', { gameId })

        const joined = await requestGameEvent<GameJoinedEvent>(
          GAME_SOCKET_EVENTS.join,
          GAME_SOCKET_EVENTS.joined,
          { gameId },
        )

        setStatus('joined')
        setAccess(joined.access)
        setRoomPlayerId(joined.roomPlayerId ?? null)
        setState(joined.state)
        setErrorMessage(null)

        debugGameSocket('join succeeded', {
          gameId,
          access: joined.access,
          roomPlayerId: joined.roomPlayerId ?? null,
          spectatorId: joined.spectatorId ?? null,
          phase: joined.state.phase,
        })

        const recovered = await requestGameEvent<GameEventsRecoveredEvent>(
          GAME_SOCKET_EVENTS.eventsGet,
          GAME_SOCKET_EVENTS.eventsRecovered,
          { gameId },
        )

        setEvents([...recovered.items].reverse())

        const presenceSummary = await requestGameEvent<GamePresenceEvent>(
          GAME_SOCKET_EVENTS.presenceGet,
          GAME_SOCKET_EVENTS.presence,
          { gameId },
        )

        setPresence(presenceSummary)
      } catch (error) {
        debugGameSocket('join failed', {
          gameId,
          error: error instanceof Error ? error.message : error,
        })
        setStatus('error')
        setErrorMessage(
          error instanceof Error
            ? getGameSocketErrorMessage(error.message)
            : 'Could not join game.',
        )
      }
    }

    socket.on('connect', () => {
      debugGameSocket('connected', {
        gameId,
        socketId: socket.id,
      })
      setStatus('connected')
    })

    socket.on(GAME_SOCKET_EVENTS.authenticated, (payload: unknown) => {
      authRecoveryAttempts = 0
      debugGameSocket('authenticated', {
        gameId,
        socketId: socket.id,
        payload,
      })
      void joinGame()
    })

    socket.on('disconnect', (reason) => {
      debugGameSocket('disconnected', { gameId, reason })
      setStatus((currentStatus) =>
        currentStatus === 'joined' ? 'connecting' : 'disconnected',
      )
    })

    socket.on('connect_error', (error) => {
      debugGameSocket('connect error', {
        gameId,
        message: error.message,
      })

      if (error.message === 'Authentication required') {
        void recoverFromSocketAuthFailure()
        return
      }

      setStatus('error')
      setErrorMessage(getGameSocketErrorMessage(error.message))
    })

    socket.on(GAME_SOCKET_EVENTS.state, (payload: GameStateEvent) => {
      if (payload.gameId === gameId) {
        setState(payload.state)
        setErrorMessage(null)
      }
    })

    socket.on(GAME_SOCKET_EVENTS.events, (payload: GameEventsEvent) => {
      if (payload.gameId !== gameId) {
        return
      }

      setEvents((current) =>
        mergeGameEvents(current, createLiveEventItems(payload.events)),
      )
    })

    socket.on(GAME_SOCKET_EVENTS.presence, (payload: GamePresenceEvent) => {
      if (payload.gameId === gameId) {
        setPresence(payload)
      }
    })

    socket.on(
      GAME_SOCKET_EVENTS.commandRejected,
      (payload: GameCommandRejectedEvent) => {
        if (payload.gameId === gameId) {
          setErrorMessage(getGameSocketErrorMessage(payload.message))
        }
      },
    )

    socket.on(GAME_SOCKET_EVENTS.error, (payload: GameSocketErrorEvent) => {
      debugGameSocket('game:error received', {
        gameId,
        payload,
      })

      if (payload.message === 'Authentication required') {
        void recoverFromSocketAuthFailure()
        return
      }

      setErrorMessage(getGameSocketErrorMessage(payload.message))
    })

    socket.on(GAME_SOCKET_EXCEPTION_EVENT, (payload: unknown) => {
      debugGameSocket('exception received', { gameId, payload })
      const message = getSocketPayloadMessage(payload)

      if (message === 'Authentication required') {
        void recoverFromSocketAuthFailure()
        return
      }

      setErrorMessage(getGameSocketErrorMessage(message))
    })

    const heartbeatId = window.setInterval(() => {
      if (socket.connected) {
        socket.emit(GAME_SOCKET_EVENTS.heartbeat, { gameId })
      }
    }, GAME_HEARTBEAT_INTERVAL_MS)

    const presenceId = window.setInterval(() => {
      if (socket.connected) {
        socket.emit(GAME_SOCKET_EVENTS.presenceGet, { gameId })
      }
    }, GAME_PRESENCE_INTERVAL_MS)

    const authRefreshId = window.setInterval(() => {
      void refreshGameSocketToken()
    }, GAME_ACCESS_TOKEN_REFRESH_INTERVAL_MS)

    socket.connect()

    return () => {
      window.clearInterval(heartbeatId)
      window.clearInterval(presenceId)
      window.clearInterval(authRefreshId)
      socket.off()
      socket.disconnect()

      if (socketRef.current === socket) {
        socketRef.current = null
      }
    }
  }, [
    authHydration.data,
    authUser.data?.id,
    authRefreshTick,
    disconnectSocket,
    requestGameEvent,
    gameId,
  ])

  const runCommand = useCallback(
    async (event: string, payload: Record<string, unknown> = {}) => {
      setCommandPending(true)
      setErrorMessage(null)

      try {
        const response = await requestGameEvent<GameCommandStateResponse>(
          event,
          GAME_SOCKET_EVENTS.state,
          { gameId, ...payload },
        )

        setState(response.state)
        setErrorMessage(null)

        if (response.events?.length) {
          setEvents((current) =>
            mergeGameEvents(current, createLiveEventItems(response.events!)),
          )
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? getGameSocketErrorMessage(error.message)
            : 'Game command failed.',
        )
      } finally {
        setCommandPending(false)
      }
    },
    [gameId, requestGameEvent],
  )

  return {
    status,
    state,
    access,
    roomPlayerId,
    currentPlayer,
    isCurrentTurn,
    presence,
    events,
    errorMessage,
    commandPending,
    rollAndMove: () => runCommand(GAME_SOCKET_EVENTS.rollAndMove),
    buyProperty: () => runCommand(GAME_SOCKET_EVENTS.buyProperty),
    declinePropertyPurchase: () =>
      runCommand(GAME_SOCKET_EVENTS.declinePropertyPurchase),
    placeAuctionBid: (amount: number) =>
      runCommand(GAME_SOCKET_EVENTS.placeAuctionBid, { amount }),
    passAuctionBid: () => runCommand(GAME_SOCKET_EVENTS.passAuctionBid),
    payDebt: () => runCommand(GAME_SOCKET_EVENTS.payDebt),
    payJailFine: () => runCommand(GAME_SOCKET_EVENTS.payJailFine),
    declareBankruptcy: () => runCommand(GAME_SOCKET_EVENTS.declareBankruptcy),
    buildProperty: (tileKey: string) =>
      runCommand(GAME_SOCKET_EVENTS.buildProperty, { tileKey }),
    sellBuilding: (tileKey: string) =>
      runCommand(GAME_SOCKET_EVENTS.sellBuilding, { tileKey }),
    mortgageProperty: (tileKey: string) =>
      runCommand(GAME_SOCKET_EVENTS.mortgageProperty, { tileKey }),
    unmortgageProperty: (tileKey: string) =>
      runCommand(GAME_SOCKET_EVENTS.unmortgageProperty, { tileKey }),
    endTurn: () => runCommand(GAME_SOCKET_EVENTS.endTurn),
  }
}
