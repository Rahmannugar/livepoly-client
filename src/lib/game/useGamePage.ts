import { useEffect, useRef, useState } from 'react'
import { getLatestCardRevealFromEvents } from './game-cards'
import type { GameCardMetadata } from './game-cards'
import {
  findPlayer,
  gameTiles,
  getMinimumAuctionBid,
  getPlayerName,
} from './game-board'
import { getRemainingMatchTimeMs } from './game-time'
import { getGameTurnConsequence, getPrimaryGameAction } from './game-view'
import { useGame } from './useGame'
import { useGameResult } from './useGameResult'

export function useGamePage(gameId: string) {
  const game = useGame(gameId)
  const state = game.state
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now())
  const gameOpenedAtRef = useRef(Date.now())
  const cardRevealReadyRef = useRef(false)
  const lastCardRevealIdRef = useRef<string | null>(null)
  const [visibleCardRevealId, setVisibleCardRevealId] = useState<string | null>(
    null,
  )
  const [selectedTileKey, setSelectedTileKey] = useState<string | null>(null)

  const currentTurnPlayer = state
    ? findPlayer(state.players, state.currentTurnRoomPlayerId)
    : null
  const isUserTurn = Boolean(
    state &&
    game.roomPlayerId &&
    state.currentTurnRoomPlayerId === game.roomPlayerId,
  )
  const ownedProperties = state
    ? state.properties.filter((property) => property.ownerRoomPlayerId)
    : []
  const recentEvents = game.events.slice(0, 5)
  const latestCardReveal = getLatestCardRevealFromEvents(game.events)
  const pendingTile = state?.pendingTileKey
    ? gameTiles.find((tile) => tile.key === state.pendingTileKey)
    : null
  const auctionTile = state?.auction
    ? gameTiles.find((tile) => tile.key === state.auction?.tileKey)
    : null
  const currentPlayerTile =
    currentTurnPlayer && Number.isInteger(currentTurnPlayer.position)
      ? gameTiles.find((tile) => tile.index === currentTurnPlayer.position)
      : null
  const activeTile = pendingTile ?? auctionTile ?? currentPlayerTile ?? null
  const activeProperty = activeTile
    ? (state?.properties.find(
        (property) => property.tileKey === activeTile.key,
      ) ?? null)
    : null
  const activeOwner = activeProperty?.ownerRoomPlayerId
    ? findPlayer(state?.players ?? [], activeProperty.ownerRoomPlayerId)
    : null
  const selectedTile = selectedTileKey
    ? (gameTiles.find((tile) => tile.key === selectedTileKey) ?? null)
    : null
  const selectedTileProperty = selectedTile
    ? (state?.properties.find(
        (property) => property.tileKey === selectedTile.key,
      ) ?? null)
    : null
  const selectedTileOwner = selectedTileProperty?.ownerRoomPlayerId
    ? findPlayer(state?.players ?? [], selectedTileProperty.ownerRoomPlayerId)
    : null
  const pendingProperty = pendingTile
    ? (state?.properties.find(
        (property) => property.tileKey === pendingTile.key,
      ) ?? null)
    : null
  const activeTileLabel = pendingTile
    ? 'Landed square'
    : auctionTile
      ? 'Auction square'
      : 'Square'
  const turnConsequence = getGameTurnConsequence({
    phase: state?.phase,
    tile: activeTile,
    currentTurnPlayer,
    recentEvent: recentEvents[0],
  })
  const currentPlayerInJail = Boolean(game.currentPlayer?.inJail)
  const minimumAuctionBid = getMinimumAuctionBid(state?.auction)
  const remainingMatchTimeMs = getRemainingMatchTimeMs(
    state?.expiresAt,
    currentTimeMs,
  )
  const remainingTurnTimeMs = getRemainingMatchTimeMs(
    state?.phase === 'awaiting_auction_bid'
      ? (state.auction?.bidExpiresAt ?? state.turnExpiresAt)
      : state?.turnExpiresAt,
    currentTimeMs,
  )
  const gameExpired = Boolean(
    state?.expiresAt &&
    remainingMatchTimeMs !== null &&
    remainingMatchTimeMs <= 0,
  )
  const primaryAction = getPrimaryGameAction({
    access: game.access,
    isCurrentTurn: isUserTurn,
    phase: state?.phase,
    status: game.status,
    hasState: Boolean(state),
    pendingTileName: pendingTile?.name,
    roomPlayerId: game.roomPlayerId,
    currentTurnPlayer,
    currentPlayerInJail,
    shouldCurrentPlayerPlayAgain: Boolean(state?.shouldCurrentPlayerPlayAgain),
    auction: state?.auction,
    debt: state?.debt,
    gameExpired,
  })
  const isRollingDice = game.commandPending && primaryAction.command === 'roll'
  const gameClosed = state?.phase === 'finished' || state?.phase === 'cancelled'
  const shouldLoadGameResult = gameClosed || gameExpired
  const gameResult = useGameResult(gameId, shouldLoadGameResult)
  const canManageProperties =
    !gameClosed &&
    !gameExpired &&
    isUserTurn &&
    state?.phase === 'awaiting_turn_end' &&
    game.status === 'joined'
  const canLiquidateProperties = Boolean(
    canManageProperties ||
    (!gameClosed &&
      !gameExpired &&
      isUserTurn &&
      state?.phase === 'awaiting_debt_resolution' &&
      state.debt?.roomPlayerId === game.roomPlayerId &&
      game.status === 'joined'),
  )

  useEffect(() => {
    if (gameClosed) {
      return
    }

    setCurrentTimeMs(Date.now())

    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(Date.now())
    }, 1_000)

    return () => window.clearInterval(intervalId)
  }, [state?.expiresAt, state?.turnExpiresAt, gameClosed])

  useEffect(() => {
    const latestCardRevealId = latestCardReveal?.id ?? null

    if (!cardRevealReadyRef.current) {
      cardRevealReadyRef.current = true
      lastCardRevealIdRef.current = latestCardRevealId
      return
    }

    if (!latestCardRevealId) {
      lastCardRevealIdRef.current = null
      setVisibleCardRevealId(null)
      return
    }

    if (
      new Date(latestCardReveal.createdAt).getTime() <= gameOpenedAtRef.current
    ) {
      lastCardRevealIdRef.current = latestCardRevealId
      setVisibleCardRevealId(null)
      return
    }

    if (latestCardRevealId !== lastCardRevealIdRef.current) {
      lastCardRevealIdRef.current = latestCardRevealId
      setVisibleCardRevealId(latestCardRevealId)
    }
  }, [latestCardReveal?.createdAt, latestCardReveal?.id])

  const visibleCardReveal: GameCardMetadata | null =
    latestCardReveal && latestCardReveal.id === visibleCardRevealId
      ? latestCardReveal.card
      : null
  const visibleCardRevealPlayer =
    latestCardReveal && latestCardReveal.id === visibleCardRevealId
      ? findPlayer(state?.players ?? [], latestCardReveal.roomPlayerId)
      : null

  return {
    game,
    state,
    currentTurnPlayer,
    isUserTurn,
    ownedProperties,
    recentEvents,
    pendingTile,
    auctionTile,
    activeTile,
    activeProperty,
    activeOwner,
    selectedTile,
    selectedTileProperty,
    selectedTileOwner,
    pendingProperty,
    activeTileLabel,
    turnConsequence,
    currentPlayerInJail,
    minimumAuctionBid,
    remainingMatchTimeMs,
    remainingTurnTimeMs,
    gameExpired,
    primaryAction,
    isRollingDice,
    gameClosed,
    shouldLoadGameResult,
    gameResult,
    canManageProperties,
    canLiquidateProperties,
    visibleCardReveal,
    visibleCardRevealPlayerName: visibleCardRevealPlayer
      ? getPlayerName(visibleCardRevealPlayer)
      : null,
    selectTile: (tileKey: string) => setSelectedTileKey(tileKey),
    clearSelectedTile: () => setSelectedTileKey(null),
    dismissVisibleCardReveal: () => setVisibleCardRevealId(null),
  }
}
