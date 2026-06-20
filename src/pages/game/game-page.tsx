import {
  BankIcon,
  BuildingsIcon,
  HandshakeIcon,
  ListChecksIcon,
  MapPinIcon,
  TrophyIcon,
  XIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import '#/components/game/game.css'
import { useToast } from '#/components/common/toast'
import { GameActionsPanel } from '#/components/game/game-actions-panel'
import { AuctionStatusPanel } from '#/components/game/game-auction-status-panel'
import { GameCardReveal } from '#/components/game/game-card-reveal'
import { GameResultsPanel } from '#/components/game/game-results-panel'
import { BankerPanel } from '#/components/game/game-banker-panel'
import { EventsPanel } from '#/components/game/game-events-panel'
import { GameMatchTimer } from '#/components/game/game-match-timer'
import { GamePageHeader } from '#/components/game/game-page-header'
import { PlayersPanel } from '#/components/game/game-players-panel'
import { PropertiesPanel } from '#/components/game/game-properties-panel'
import { GameStatePanel } from '#/components/game/game-state-panel'
import { GameStage } from '#/components/game/game-stage'
import { TileInfoSheet } from '#/components/game/game-tile-info'
import { TradePanel } from '#/components/game/game-trade-panel'
import { useGamePage } from '#/lib/game/useGamePage'
import { findPlayer, getPlayerName } from '#/lib/game/game-board'
import type { GameEventLogItem, GamePlayer } from '#/lib/game/game.types'
import { leaveRoom } from '#/lib/rooms/rooms.service'
import { ROOMS_QUERY_KEYS } from '#/lib/rooms/rooms.constants'

type GamePageProps = {
  gameId: string
}

export function GamePage({ gameId }: GamePageProps) {
  const model = useGamePage(gameId)
  const { game, state } = model
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const lastErrorToastRef = useRef<string | null>(null)
  const gameOpenedAtRef = useRef(Date.now())
  const lastTradeToastEventKeyRef = useRef<string | null>(null)
  const [activeSidePanel, setActiveSidePanel] = useState<
    'banker' | 'properties' | 'trade' | 'events' | 'results' | null
  >(null)
  const leaveGame = useMutation({
    mutationFn: leaveRoom,
    onSuccess: () => {
      queryClient.setQueryData(ROOMS_QUERY_KEYS.currentRoom, null)
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEYS.liveRooms })
      void navigate({ to: '/' })
    },
  })
  const hasResultsPanel = model.shouldLoadGameResult
  const activeAuction =
    state?.phase === 'awaiting_auction_bid' && state.auction
      ? state.auction
      : null
  const visibleErrorMessage = getVisibleGameErrorMessage(
    game.errorMessage,
    state?.players ?? [],
    game.roomPlayerId,
  )

  useEffect(() => {
    if (
      !visibleErrorMessage ||
      visibleErrorMessage === lastErrorToastRef.current
    ) {
      return
    }

    lastErrorToastRef.current = visibleErrorMessage
    showToast({
      kind: 'error',
      message: visibleErrorMessage,
    })
  }, [showToast, visibleErrorMessage])

  useEffect(() => {
    const tradeEvent = model.recentEvents.find((event) =>
      isTradeOutcomeEvent(event.type),
    )

    if (!tradeEvent) {
      return
    }

    const eventKey = `${tradeEvent.sequence ?? 'live'}:${tradeEvent.type}:${tradeEvent.createdAt}`

    if (lastTradeToastEventKeyRef.current === eventKey) {
      return
    }

    lastTradeToastEventKeyRef.current = eventKey

    if (new Date(tradeEvent.createdAt).getTime() <= gameOpenedAtRef.current) {
      return
    }

    const tradeToast = getTradeOutcomeToast(
      tradeEvent,
      state?.players ?? [],
      game.roomPlayerId,
    )

    if (tradeToast) {
      showToast(tradeToast)
    }
  }, [game.roomPlayerId, model.recentEvents, showToast, state?.players])

  return (
    <main className="min-h-screen px-4 py-5 sm:px-7">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[112rem] flex-col gap-5">
        <GamePageHeader
          roomCode={state?.roomCode}
          gameId={gameId}
          canLeave={Boolean(state?.roomCode)}
          isLeaving={leaveGame.isPending}
          onLeave={() => {
            if (state?.roomCode) {
              leaveGame.mutate(state.roomCode)
            }
          }}
        />
        <GameMatchTimer remainingMatchTimeMs={model.remainingMatchTimeMs} />

        <div className="grid flex-1 gap-4 xl:grid-cols-[17rem_minmax(0,1fr)_26rem] 2xl:grid-cols-[18rem_minmax(56rem,1fr)_29rem]">
          <aside className="order-3 grid gap-3 md:grid-cols-2 xl:order-1 xl:grid-cols-1 xl:content-start">
            <PlayersPanel state={state} roomPlayerId={game.roomPlayerId} />
            <GameStatePanel
              state={state}
              playersOnline={game.presence?.playersOnline ?? 0}
            />
          </aside>

          <GameStage
            state={state}
            access={game.access}
            status={game.status}
            currentTurnPlayer={model.currentTurnPlayer}
            activeTile={model.activeTile}
            turnConsequence={model.turnConsequence}
            isCurrentTurn={model.isUserTurn}
            isRollingDice={model.isRollingDice}
            remainingTurnTimeMs={model.remainingTurnTimeMs}
            onSelectTile={(tile) => model.selectTile(tile.key)}
          />

          <aside className="order-2 grid grid-cols-2 gap-2 sm:gap-3 xl:order-3 xl:grid-cols-1 xl:content-start">
            <AnimatePresence initial={false}>
              {hasResultsPanel ? (
                <motion.div
                  key="results-summary"
                  className="col-span-2 xl:col-span-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <GameResultsPanel
                    result={model.gameResult.data}
                    isLoading={model.gameResult.isFetching}
                    errorMessage={
                      model.gameResult.error instanceof Error
                        ? model.gameResult.error.message
                        : null
                    }
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {activeAuction ? (
                <motion.div
                  key="auction-panel"
                  className="col-span-2 xl:col-span-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <AuctionStatusPanel
                    auction={activeAuction}
                    players={state?.players ?? []}
                    events={game.events}
                    roomPlayerId={game.roomPlayerId}
                    tileName={model.auctionTile?.name ?? activeAuction.tileKey}
                    minimumBid={model.minimumAuctionBid}
                    commandPending={game.commandPending}
                    onPlaceBid={(amount) => void game.placeAuctionBid(amount)}
                    onPass={() => void game.passAuctionBid()}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {!activeAuction ? (
                <motion.div
                  key="actions-panel"
                  className="col-span-2 xl:col-span-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <GameActionsPanel
                    primaryAction={model.primaryAction}
                    commandPending={game.commandPending}
                    gameExpired={model.gameExpired}
                    errorMessage={visibleErrorMessage}
                    debt={
                      state?.phase === 'awaiting_debt_resolution'
                        ? state.debt
                        : null
                    }
                    players={state?.players ?? []}
                    roomPlayerId={game.roomPlayerId}
                    currentPlayer={game.currentPlayer}
                    currentPlayerInJail={model.currentPlayerInJail}
                    isCurrentTurn={model.isUserTurn}
                    phase={state?.phase}
                    tradeOffer={state?.tradeOffer}
                    pendingTile={model.pendingTile ?? null}
                    pendingProperty={model.pendingProperty}
                    onRollAndMove={() => void game.rollAndMove()}
                    onEndTurn={() => void game.endTurn()}
                    onBuyProperty={() => void game.buyProperty()}
                    onDeclinePropertyPurchase={() =>
                      void game.declinePropertyPurchase()
                    }
                    onPayDebt={() => void game.payDebt()}
                    onManageProperties={() => setActiveSidePanel('properties')}
                    onPayJailFine={() => void game.payJailFine()}
                    onUseGetOutOfJailCard={() =>
                      void game.useGetOutOfJailCard()
                    }
                    onDeclareBankruptcy={() => void game.declareBankruptcy()}
                    onAcceptTrade={(tradeId) => void game.acceptTrade(tradeId)}
                    onRejectTrade={(tradeId) => void game.rejectTrade(tradeId)}
                    onCancelTrade={(tradeId) => void game.cancelTrade(tradeId)}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {model.activeTile ? (
              <GameSidePanelLauncher
                icon={MapPinIcon}
                title="Square"
                copy={model.activeTile.name}
                onClick={() => {
                  if (model.activeTile) {
                    model.selectTile(model.activeTile.key)
                  }
                }}
              />
            ) : null}

            <GameSidePanelLauncher
              icon={BankIcon}
              title="Banker"
              copy="Table calls and latest move"
              onClick={() => setActiveSidePanel('banker')}
            />
            {hasResultsPanel ? (
              <GameSidePanelLauncher
                icon={TrophyIcon}
                title="Results"
                copy="Final places and net worth"
                onClick={() => setActiveSidePanel('results')}
              />
            ) : (
              <>
                {game.access === 'player' ? (
                  <GameSidePanelLauncher
                    icon={HandshakeIcon}
                    title="Trade"
                    copy={
                      state?.tradeOffer
                        ? 'An offer is awaiting a response'
                        : 'Make an offer to another player'
                    }
                    onClick={() => setActiveSidePanel('trade')}
                  />
                ) : null}
                <GameSidePanelLauncher
                  icon={BuildingsIcon}
                  title="Properties"
                  copy="Build, mortgage, and review ownership"
                  onClick={() => setActiveSidePanel('properties')}
                />
              </>
            )}
            <GameSidePanelLauncher
              icon={ListChecksIcon}
              title="Events"
              copy="Recent rolls, bids, payments, and moves"
              onClick={() => setActiveSidePanel('events')}
            />
          </aside>
        </div>
        <AnimatePresence>
          {model.visibleCardReveal ? (
            <GameCardReveal
              card={model.visibleCardReveal}
              playerName={model.visibleCardRevealPlayerName}
              onClose={model.dismissVisibleCardReveal}
            />
          ) : null}
        </AnimatePresence>
        <TileInfoSheet
          open={Boolean(model.selectedTile)}
          tile={model.selectedTile}
          property={model.selectedTileProperty}
          owner={model.selectedTileOwner}
          onClose={model.clearSelectedTile}
        />
        <AnimatePresence>
          {activeSidePanel ? (
            <GameSidePanelDialog
              key="game-side-panel-dialog"
              title={getSidePanelTitle(activeSidePanel)}
              onClose={() => setActiveSidePanel(null)}
            >
              {activeSidePanel === 'banker' ? (
                <BankerPanel
                  phase={state?.phase}
                  currentTurnPlayer={model.currentTurnPlayer}
                  roomPlayerId={game.roomPlayerId}
                  activeTile={model.activeTile}
                  events={model.recentEvents}
                  players={state?.players ?? []}
                />
              ) : activeSidePanel === 'results' ? (
                <GameResultsPanel
                  result={model.gameResult.data}
                  isLoading={model.gameResult.isFetching}
                  errorMessage={
                    model.gameResult.error instanceof Error
                      ? model.gameResult.error.message
                      : null
                  }
                />
              ) : activeSidePanel === 'properties' ? (
                <PropertiesPanel
                  properties={model.ownedProperties}
                  players={state?.players ?? []}
                  roomPlayerId={game.roomPlayerId}
                  canManageProperties={model.canManageProperties}
                  canLiquidateProperties={model.canLiquidateProperties}
                  commandPending={game.commandPending}
                  onBuild={(tileKey) => void game.buildProperty(tileKey)}
                  onSellBuilding={(tileKey) => void game.sellBuilding(tileKey)}
                  onMortgage={(tileKey) => void game.mortgageProperty(tileKey)}
                  onUnmortgage={(tileKey) =>
                    void game.unmortgageProperty(tileKey)
                  }
                />
              ) : activeSidePanel === 'trade' ? (
                <TradePanel
                  properties={model.ownedProperties}
                  players={state?.players ?? []}
                  roomPlayerId={game.roomPlayerId}
                  tradeOffer={state?.tradeOffer}
                  canCreateTrade={model.canManageProperties}
                  commandPending={game.commandPending}
                  onProposeTrade={(input) => void game.proposeTrade(input)}
                  onAcceptTrade={(tradeId) => void game.acceptTrade(tradeId)}
                  onRejectTrade={(tradeId) => void game.rejectTrade(tradeId)}
                  onCancelTrade={(tradeId) => void game.cancelTrade(tradeId)}
                />
              ) : activeSidePanel === 'events' ? (
                <EventsPanel
                  events={model.recentEvents}
                  players={state?.players ?? []}
                />
              ) : null}
            </GameSidePanelDialog>
          ) : null}
        </AnimatePresence>
      </section>
    </main>
  )
}

function GameSidePanelLauncher({
  icon: IconComponent,
  title,
  copy,
  onClick,
}: {
  icon: Icon
  title: string
  copy: string
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      className="group flex min-h-[4.75rem] min-w-0 items-center gap-2 rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-2 text-left shadow-[0_14px_42px_rgba(4,12,15,0.1)] backdrop-blur-xl transition hover:translate-y-[-1px] focus-visible:border-[var(--primary)] sm:min-h-[5.25rem] sm:gap-3 sm:rounded-2xl sm:p-3 xl:min-h-[5rem] xl:p-3.5"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--sea-ink)] sm:h-10 sm:w-10 sm:rounded-2xl xl:h-11 xl:w-11">
        <IconComponent weight="bold" className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="display-title block truncate text-base font-semibold text-[var(--sea-ink)] sm:text-lg">
          {title}
        </span>
        <span className="mt-0.5 block line-clamp-2 text-[0.72rem] font-bold leading-4 text-[var(--sea-ink-soft)] sm:text-xs sm:leading-4 xl:text-sm xl:leading-5">
          {copy}
        </span>
      </span>
    </motion.button>
  )
}

function GameSidePanelDialog({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div aria-live="polite">
      <button
        type="button"
        aria-label={`Close ${title}`}
        className="game-decision-backdrop fixed inset-0 z-40 bg-[rgba(4,12,15,0.46)] backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="game-decision-sheet fixed inset-x-0 bottom-0 z-50 mx-auto grid max-h-[min(86vh,46rem)] w-full gap-3 overflow-y-auto rounded-t-[28px] border border-[var(--line)] bg-[var(--bg-base)] p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_28px_90px_rgba(4,12,15,0.34)] md:bottom-auto md:left-1/2 md:top-1/2 md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px] md:p-4"
      >
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            aria-label={`Close ${title}`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] transition hover:translate-y-[-1px]"
            onClick={onClose}
          >
            <XIcon weight="bold" className="h-4 w-4" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

function getSidePanelTitle(
  panel: 'banker' | 'properties' | 'trade' | 'events' | 'results' | null,
) {
  if (panel === 'banker') return 'Banker'
  if (panel === 'properties') return 'Properties'
  if (panel === 'trade') return 'Trade'
  if (panel === 'events') return 'Events'
  if (panel === 'results') return 'Results'

  return 'Game view'
}

function getVisibleGameErrorMessage(
  errorMessage: string | null,
  players: GamePlayer[],
  roomPlayerId: string | null,
) {
  if (
    errorMessage === 'You are not part of this game.' &&
    roomPlayerId &&
    findPlayer(players, roomPlayerId)
  ) {
    return null
  }

  return errorMessage
}

function isTradeOutcomeEvent(type: string) {
  return (
    type === 'trade_accepted' ||
    type === 'trade_rejected' ||
    type === 'trade_cancelled'
  )
}

function getTradeOutcomeToast(
  event: GameEventLogItem,
  players: GamePlayer[],
  roomPlayerId: string | null,
) {
  const fromRoomPlayerId = getEventPlayerId(event, 'fromRoomPlayerId')
  const toRoomPlayerId = getEventPlayerId(event, 'toRoomPlayerId')

  if (
    !roomPlayerId ||
    (roomPlayerId !== fromRoomPlayerId && roomPlayerId !== toRoomPlayerId)
  ) {
    return null
  }

  const otherRoomPlayerId =
    roomPlayerId === fromRoomPlayerId ? toRoomPlayerId : fromRoomPlayerId
  const otherPlayer = findPlayer(players, otherRoomPlayerId)
  const otherPlayerName = otherPlayer
    ? getPlayerName(otherPlayer)
    : 'the other player'

  if (event.type === 'trade_accepted') {
    return {
      kind: 'success' as const,
      message: `Trade with ${otherPlayerName} accepted.`,
    }
  }

  if (event.type === 'trade_rejected') {
    return {
      kind: 'info' as const,
      message: `Trade with ${otherPlayerName} rejected.`,
    }
  }

  return {
    kind: 'info' as const,
    message: `Trade with ${otherPlayerName} cancelled.`,
  }
}

function getEventPlayerId(event: GameEventLogItem, key: string) {
  const value = event.payload[key]

  return typeof value === 'string' ? value : null
}
