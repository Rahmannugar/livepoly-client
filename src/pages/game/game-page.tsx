import { ArrowLeftIcon, SpinnerGapIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import '#/components/game/game.css'
import { GameActionsPanel } from '#/components/game/game-actions-panel'
import { GameBoard } from '#/components/game/game-board'
import { GameCardReveal } from '#/components/game/game-card-reveal'
import { GameResultsPanel } from '#/components/game/game-results-panel'
import { BankerPanel } from '#/components/game/game-banker-panel'
import { EventsPanel } from '#/components/game/game-events-panel'
import { PlayersPanel } from '#/components/game/game-players-panel'
import { PropertiesPanel } from '#/components/game/game-properties-panel'
import { GameStatePanel } from '#/components/game/game-state-panel'
import { MobilePropertyDecisionSheet } from '#/components/game/game-tile-info'
import { GameTurnSummary } from '#/components/game/game-turn-summary'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { APP_NAME } from '#/config/app.constants'
import {
  getLatestCardRevealFromEvents,
  type GameCardMetadata,
} from '#/lib/game/game-cards'
import {
  findPlayer,
  gameTiles,
  getMinimumAuctionBid,
  getPlayerName,
} from '#/lib/game/game-board'
import {
  formatRemainingMatchTime,
  getRemainingMatchTimeMs,
} from '#/lib/game/game-time'
import { getGameTurnConsequence, getPrimaryGameAction } from '#/lib/game/game-view'
import { useGame } from '#/lib/game/useGame'
import { useGameResult } from '#/lib/game/useGameResult'

type GamePageProps = {
  gameId: string
}

export function GamePage({ gameId }: GamePageProps) {
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

  return (
    <main className="min-h-screen px-4 py-5 sm:px-7">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[112rem] flex-col gap-5">
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              aria-label="Back home"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] transition hover:translate-y-[-1px]"
            >
              <ArrowLeftIcon weight="bold" className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <p className="display-title truncate text-3xl font-semibold leading-none text-[var(--sea-ink)] sm:text-4xl">
                {APP_NAME}
              </p>
              <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
                Game {state?.roomCode ?? gameId.slice(0, 8)}
              </p>
            </div>
          </div>

          <ThemeToggle />
        </header>

        <div className="mx-auto flex w-fit min-w-36 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-center shadow-[0_18px_45px_rgba(4,12,15,0.14)]">
          <span className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
            Time
          </span>
          <span className="ml-3 text-lg font-black text-[var(--sea-ink)]">
            {formatRemainingMatchTime(remainingMatchTimeMs)}
          </span>
        </div>

        <div className="grid flex-1 gap-4 xl:grid-cols-[17rem_minmax(0,1fr)_17rem] 2xl:grid-cols-[19rem_minmax(58rem,1fr)_18rem]">
          <aside className="order-2 grid gap-3 md:grid-cols-2 xl:order-1 xl:grid-cols-1 xl:content-start">
            <PlayersPanel state={state} roomPlayerId={game.roomPlayerId} />
            <GameStatePanel
              state={state}
              playersOnline={game.presence?.playersOnline ?? 0}
            />
          </aside>

          <section className="order-1 rounded-[34px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_78%,transparent)] p-3 shadow-[0_28px_90px_rgba(4,12,15,0.18)] backdrop-blur-xl sm:p-5 xl:order-2">
            <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                {gameClosed ? (
                  <h1 className="display-title max-w-full truncate text-4xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-5xl">
                    {state?.phase === 'cancelled'
                      ? 'Game cancelled.'
                      : 'Game over.'}
                  </h1>
                ) : currentTurnPlayer ? (
                  <h1 className="display-title flex max-w-full items-baseline gap-2 text-4xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-5xl">
                    <span
                      className="min-w-0 truncate"
                      title={getPlayerName(currentTurnPlayer)}
                    >
                      {getPlayerName(currentTurnPlayer)}
                    </span>
                    <span className="shrink-0">is up.</span>
                  </h1>
                ) : (
                  <h1 className="display-title max-w-full truncate text-4xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-5xl">
                    Opening the game.
                  </h1>
                )}
              </div>
              <span className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-xs font-black capitalize text-[var(--sea-ink)]">
                {game.status === 'connecting' ? (
                  <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
                ) : null}
                {game.status}
              </span>
            </div>

            <GameTurnSummary
              player={currentTurnPlayer}
              phase={state?.phase}
              dice={state?.lastDiceRoll}
              tile={activeTile}
              consequence={turnConsequence}
              isCurrentTurn={isUserTurn}
            />

            <GameBoard
              state={state}
              access={game.access}
              isCurrentTurn={isUserTurn}
              isRollingDice={isRollingDice}
            />
          </section>

          <aside className="order-3 grid gap-3 md:grid-cols-2 xl:order-3 xl:grid-cols-1 xl:content-start">
            <GameActionsPanel
              primaryAction={primaryAction}
              commandPending={game.commandPending}
              gameExpired={gameExpired}
              errorMessage={game.errorMessage}
              debt={
                state?.phase === 'awaiting_debt_resolution'
                  ? state.debt
                  : null
              }
              auction={
                state?.phase === 'awaiting_auction_bid'
                  ? state.auction
                  : null
              }
              players={state?.players ?? []}
              roomPlayerId={game.roomPlayerId}
              currentPlayer={game.currentPlayer}
              currentPlayerInJail={currentPlayerInJail}
              isCurrentTurn={isUserTurn}
              phase={state?.phase}
              auctionTileName={auctionTile?.name ?? null}
              pendingTile={pendingTile ?? null}
              pendingProperty={pendingProperty}
              activeTile={activeTile}
              activeProperty={activeProperty}
              activeOwner={activeOwner}
              activeTileLabel={activeTileLabel}
              auctionBidAmount={auctionBidAmount}
              minimumAuctionBid={minimumAuctionBid}
              onAuctionBidAmountChange={setAuctionBidAmount}
              onRollAndMove={() => void game.rollAndMove()}
              onEndTurn={() => void game.endTurn()}
              onBuyProperty={() => void game.buyProperty()}
              onDeclinePropertyPurchase={() =>
                void game.declinePropertyPurchase()
              }
              onPlaceAuctionBid={() => void game.placeAuctionBid(auctionBidAmount)}
              onPassAuctionBid={() => void game.passAuctionBid()}
              onPayDebt={() => void game.payDebt()}
              onPayJailFine={() => void game.payJailFine()}
              onDeclareBankruptcy={() => void game.declareBankruptcy()}
            />

            <BankerPanel
              phase={state?.phase}
              currentTurnPlayer={currentTurnPlayer}
              roomPlayerId={game.roomPlayerId}
              activeTile={activeTile}
              events={recentEvents}
              players={state?.players ?? []}
            />

            {gameClosed ? (
              <GameResultsPanel
                result={gameResult.data}
                isLoading={gameResult.isFetching}
                errorMessage={
                  gameResult.error instanceof Error
                    ? gameResult.error.message
                    : null
                }
              />
            ) : (
              <PropertiesPanel
                properties={ownedProperties}
                players={state?.players ?? []}
                roomPlayerId={game.roomPlayerId}
                commandPending={game.commandPending}
                onBuild={(tileKey) => void game.buildProperty(tileKey)}
                onSellBuilding={(tileKey) => void game.sellBuilding(tileKey)}
                onMortgage={(tileKey) => void game.mortgageProperty(tileKey)}
                onUnmortgage={(tileKey) => void game.unmortgageProperty(tileKey)}
              />
            )}

            <EventsPanel events={recentEvents} players={state?.players ?? []} />
          </aside>
        </div>
        <MobilePropertyDecisionSheet
          open={showMobilePropertyDecision}
          tile={pendingTile ?? null}
          property={pendingProperty}
          commandPending={game.commandPending}
          onBuyProperty={() => void game.buyProperty()}
          onDeclinePropertyPurchase={() =>
            void game.declinePropertyPurchase()
          }
        />
        <GameCardReveal
          card={visibleCardReveal}
          onClose={() => {
            if (latestCardReveal) {
              setDismissedCardId(latestCardReveal.id)
            }
          }}
        />
      </section>
    </main>
  )
}
