import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { env } from '#/config/env'
import { getAccessToken } from '#/lib/auth/auth.service'
import {
  GAME_HEARTBEAT_INTERVAL_MS,
  GAME_PRESENCE_INTERVAL_MS,
  GAME_SOCKET_ACK_TIMEOUT_MS,
  GAME_SOCKET_EVENTS,
} from './game.constants'
import type {
  GameCommandRejectedEvent,
  GameConnectionStatus,
  GameEventLogItem,
  GameEventsEvent,
  GameEventsRecoveredEvent,
  GameJoinedEvent,
  GamePresenceEvent,
  GameSocketErrorEvent,
  GameState,
  GameStateEvent,
} from './game.types'

type SocketAck<T> = {
  event: string
  data: T
}

export function useGame(gameId: string) {
  const socketRef = useRef<Socket | null>(null)
  const [status, setStatus] = useState<GameConnectionStatus>('connecting')
  const [state, setState] = useState<GameState | null>(null)
  const [access, setAccess] = useState<GameJoinedEvent['access'] | null>(null)
  const [roomPlayerId, setRoomPlayerId] = useState<string | null>(null)
  const [presence, setPresence] = useState<GamePresenceEvent | null>(null)
  const [events, setEvents] = useState<GameEventLogItem[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

        const cleanup = () => {
          window.clearTimeout(timeoutId)
          socket.off(expectedEvent, handleEvent)
        }

        timeoutId = window.setTimeout(() => {
          cleanup()
          reject(new Error('Game server did not respond in time'))
        }, GAME_SOCKET_ACK_TIMEOUT_MS)

        socket.on(expectedEvent, handleEvent)
        socket.emit(event, payload, (response?: SocketAck<TResponse>) => {
          if (response?.data) {
            handleEvent(response.data)
          }
        })
      })
    },
    [gameId],
  )

  useEffect(() => {
    const token = getAccessToken()

    if (!token) {
      setStatus('error')
      setErrorMessage('Sign in again to continue this game.')
      return
    }

    setStatus('connecting')
    setErrorMessage(null)

    const socket = io(`${env.realtimeBaseUrl}/game`, {
      auth: { token },
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 900,
      reconnectionDelayMax: 5_000,
      timeout: 10_000,
    })
    socketRef.current = socket

    async function joinGame() {
      try {
        const joined = await requestGameEvent<GameJoinedEvent>(
          GAME_SOCKET_EVENTS.join,
          GAME_SOCKET_EVENTS.joined,
          { gameId },
        )

        setStatus('joined')
        setAccess(joined.access)
        setRoomPlayerId(joined.roomPlayerId ?? null)
        setState(joined.state)

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
        setStatus('error')
        setErrorMessage(
          error instanceof Error ? error.message : 'Could not join game.',
        )
      }
    }

    socket.on('connect', () => {
      setStatus('connected')
      void joinGame()
    })

    socket.on('disconnect', () => {
      setStatus('disconnected')
    })

    socket.on('connect_error', (error) => {
      setStatus('error')
      setErrorMessage(error.message)
    })

    socket.on(GAME_SOCKET_EVENTS.state, (payload: GameStateEvent) => {
      if (payload.gameId === gameId) {
        setState(payload.state)
      }
    })

    socket.on(GAME_SOCKET_EVENTS.events, (payload: GameEventsEvent) => {
      if (payload.gameId !== gameId) {
        return
      }

      setEvents((current) => [
        ...payload.events.map((event) => ({
          sequence: null,
          type: event.type,
          payload: event,
          createdAt: new Date().toISOString(),
        })),
        ...current,
      ])
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
          setErrorMessage(payload.message)
        }
      },
    )

    socket.on(GAME_SOCKET_EVENTS.error, (payload: GameSocketErrorEvent) => {
      setErrorMessage(payload.message)
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

    return () => {
      window.clearInterval(heartbeatId)
      window.clearInterval(presenceId)
      socket.off()
      socket.disconnect()
      socketRef.current = null
    }
  }, [requestGameEvent, gameId])

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
  }
}
