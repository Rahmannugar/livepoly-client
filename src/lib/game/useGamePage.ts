import { useEffect, useState } from 'react'
import { getLatestCardRevealFromEvents, type GameCardMetadata } from './game-cards'
import {
  findPlayer,
  gameTiles,
  getMinimumAuctionBid,
} from './game-board'
import { getRemainingMatchTimeMs } from './game-time'
import { getGameTurnConsequence, getPrimaryGameAction } from './game-view'
import { useGame } from './useGame'
import { useGameResult } from './useGameResult'

export function useGamePage(gameId: string) {
  const game = useGame(gameId)
  const state = game.state
  const [auctionBidAmount, setAuctionBidAmount] = useState(10)
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now())
  const [dismissedCardId, setDismissedCardId] = useState<string | null>(null)

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
    ? (state?.properties.find((property) => property.tileKey === activeTile.key) ??
      null)
    : null
  const activeOwner = activeProperty?.ownerRoomPlayerId
    ? findPlayer(state?.players ?? [], activeProperty.ownerRoomPlayerId)
    : null
  const pendingProperty = pendingTile
    ? (state?.properties.find((property) => property.tileKey === pendingTile.key) ??
      null)
    : null
  const activeTileLabel = pendingTile
    ? 'Landed square'
    : auctionTile
      ? 'Auction square'
      : 'Current square'
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
  const isRollingDice =
    game.commandPending && primaryAction.command === 'roll'
  const gameClosed = state?.phase === 'finished' || state?.phase === 'cancelled'
  const gameResult = useGameResult(gameId, gameClosed)
  const showMobilePropertyDecision =
    !gameClosed &&
    !gameExpired &&
    isUserTurn &&
    state?.phase === 'awaiting_property_decision'

  useEffect(() => {
    if (state?.auction) {
      setAuctionBidAmount(getMinimumAuctionBid(state.auction))
    }
  }, [state?.auction?.currentBid, state?.auction?.tileKey])

  useEffect(() => {
    if (!state?.expiresAt || gameClosed) {
      return
    }

    setCurrentTimeMs(Date.now())

    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(Date.now())
    }, 1_000)

    return () => window.clearInterval(intervalId)
  }, [state?.expiresAt, gameClosed])

  useEffect(() => {
    if (!latestCardReveal) {
      setDismissedCardId(null)
    }
  }, [latestCardReveal])

  const visibleCardReveal: GameCardMetadata | null =
    latestCardReveal && latestCardReveal.id !== dismissedCardId
      ? latestCardReveal.card
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
    pendingProperty,
    activeTileLabel,
    turnConsequence,
    currentPlayerInJail,
    minimumAuctionBid,
    remainingMatchTimeMs,
    gameExpired,
    primaryAction,
    isRollingDice,
    gameClosed,
    gameResult,
    showMobilePropertyDecision,
    auctionBidAmount,
    setAuctionBidAmount,
    visibleCardReveal,
    dismissVisibleCardReveal: () => {
      if (latestCardReveal) {
        setDismissedCardId(latestCardReveal.id)
      }
    },
  }
}
