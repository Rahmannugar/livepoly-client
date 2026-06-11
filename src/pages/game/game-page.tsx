import { ArrowLeftIcon, SpinnerGapIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import '#/components/game/game.css'
import { GameActionsPanel, type PrimaryGameAction } from '#/components/game/game-actions-panel'
import { GameBoard } from '#/components/game/game-board'
import { GameCardReveal } from '#/components/game/game-card-reveal'
import { GameResultsPanel } from '#/components/game/game-results-panel'
import {
  BankerPanel,
  EventsPanel,
  GameStatePanel,
  PlayersPanel,
  PropertiesPanel,
} from '#/components/game/game-panels'
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
  formatCash,
  gameTiles,
  getMinimumAuctionBid,
  getPlayerName,
  getTilePurchasePrice,
} from '#/lib/game/game-board'
import {
  formatRemainingMatchTime,
  getRemainingMatchTimeMs,
} from '#/lib/game/game-time'
import type { GameAuction, GameDebt, GamePlayer } from '#/lib/game/game.types'
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
  const turnConsequence = getTurnConsequence({
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
  const primaryAction = getPrimaryAction({
    access: game.access,
    isCurrentTurn: game.isCurrentTurn,
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
    game.isCurrentTurn &&
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
              isCurrentTurn={game.isCurrentTurn}
            />

            <GameBoard
              state={state}
              access={game.access}
              isCurrentTurn={game.isCurrentTurn}
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
              isCurrentTurn={game.isCurrentTurn}
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

function getTurnConsequence({
  phase,
  tile,
  currentTurnPlayer,
  recentEvent,
}: {
  phase?: string
  tile: (typeof gameTiles)[number] | null
  currentTurnPlayer: GamePlayer | null
  recentEvent: { type: string; payload: Record<string, unknown> } | undefined
}) {
  if (phase === 'finished') {
    return 'The game has ended. Final results are being saved.'
  }

  if (phase === 'cancelled') {
    return 'This game was cancelled and no more moves can be made.'
  }

  if (
    currentTurnPlayer?.playerType === 'bot' &&
    (phase === 'awaiting_first_turn' ||
      phase === 'awaiting_roll' ||
      phase === 'awaiting_turn_end' ||
      phase === 'awaiting_property_decision' ||
      phase === 'awaiting_auction_bid' ||
      phase === 'awaiting_debt_resolution')
  ) {
    return `${getPlayerName(currentTurnPlayer)} is making an automated move.`
  }

  if (phase === 'awaiting_property_decision' && tile) {
    const price = getTilePurchasePrice(tile)

    return price
      ? `${tile.name} is unowned. Buy it for ${formatCash(price)} or send it to auction.`
      : `${tile.name} is waiting for your decision.`
  }

  if (phase === 'awaiting_auction_bid' && tile) {
    return `${tile.name} is in auction. Bid or pass when it is your chance.`
  }

  if (phase === 'awaiting_debt_resolution') {
    return 'A payment is due before the game can continue.'
  }

  if (recentEvent?.type === 'rent_paid') {
    return 'Rent was paid on the landed property.'
  }

  if (recentEvent?.type === 'tax_paid') {
    return 'Tax was paid. The turn can continue.'
  }

  if (
    recentEvent?.type === 'card_drawn' ||
    recentEvent?.type === 'card_applied'
  ) {
    return 'A card was drawn and resolved.'
  }

  if (recentEvent?.type === 'player_landed_on_tile' && tile) {
    return `${tile.name} is the latest landed square.`
  }

  if (phase === 'awaiting_turn_end') {
    return 'The move is settled. End the turn when ready.'
  }

  if (phase === 'awaiting_first_turn' || phase === 'awaiting_roll') {
    return 'Roll the dice to move around the game.'
  }

  return 'Waiting for the next game update.'
}

function getPrimaryAction({
  access,
  isCurrentTurn,
  phase,
  status,
  hasState,
  pendingTileName,
  roomPlayerId,
  currentTurnPlayer,
  currentPlayerInJail,
  shouldCurrentPlayerPlayAgain,
  auction,
  debt,
  gameExpired,
}: {
  access: string | null
  isCurrentTurn: boolean
  phase?: string
  status: string
  hasState: boolean
  pendingTileName?: string
  roomPlayerId: string | null
  currentTurnPlayer: GamePlayer | null
  currentPlayerInJail: boolean
  shouldCurrentPlayerPlayAgain: boolean
  auction?: GameAuction | null
  debt?: GameDebt | null
  gameExpired: boolean
}): PrimaryGameAction {
  if (!hasState && (status === 'connecting' || status === 'connected')) {
    return {
      command: null,
      enabled: false,
      label: 'Joining game',
      copy: 'Opening the live game connection.',
    }
  }

  if (status === 'disconnected') {
    return {
      command: null,
      enabled: false,
      label: 'Reconnecting',
      copy: 'Trying to restore the live game connection.',
    }
  }

  if (!hasState && status === 'error') {
    return {
      command: null,
      enabled: false,
      label: 'Unavailable',
      copy: 'This game could not be opened right now.',
    }
  }

  if (hasState && status !== 'joined') {
    return {
      command: null,
      enabled: false,
      label:
        status === 'disconnected'
          ? 'Reconnecting'
          : status === 'error'
            ? 'Connection needed'
            : 'Syncing',
      copy:
        status === 'error'
          ? 'Restore the live connection before making another move.'
          : 'Keeping the game state in sync before the next move.',
    }
  }

  if (access === 'spectator') {
    return {
      command: null,
      enabled: false,
      label: 'Watching game',
      copy: 'Spectators can watch the game but cannot make moves.',
    }
  }

  if (phase === 'finished' || phase === 'cancelled') {
    return {
      command: null,
      enabled: false,
      label: phase === 'cancelled' ? 'Cancelled' : 'Game over',
      copy:
        phase === 'cancelled'
          ? 'This game was cancelled.'
          : 'Final results are being saved.',
    }
  }

  if (gameExpired) {
    return {
      command: null,
      enabled: false,
      label: 'Finishing',
      copy: 'Time is up. Waiting for final results.',
    }
  }

  if (phase === 'awaiting_auction_bid' && auction) {
    const hasPassed = Boolean(
      roomPlayerId && auction.passedRoomPlayerIds.includes(roomPlayerId),
    )
    const canBid = Boolean(
      roomPlayerId &&
        auction.activeRoomPlayerIds.includes(roomPlayerId) &&
        !hasPassed,
    )

    return {
      command: null,
      enabled: false,
      label: canBid ? 'Bid or pass' : hasPassed ? 'Passed' : 'Auction live',
      copy: canBid
        ? 'Raise the bid or pass in the auction controls.'
        : hasPassed
          ? 'You have passed in this auction.'
          : 'Waiting for active bidders.',
    }
  }

  if (phase === 'awaiting_debt_resolution' && debt) {
    const isDebtor = roomPlayerId === debt.roomPlayerId

    return {
      command: null,
      enabled: false,
      label: isDebtor ? 'Debt due' : 'Debt pending',
      copy: isDebtor
        ? 'Resolve this payment before the game can continue.'
        : 'Waiting for the indebted player to resolve payment.',
    }
  }

  if (!isCurrentTurn) {
    if (currentTurnPlayer?.playerType === 'bot') {
      return {
        command: null,
        enabled: false,
        label: 'Bot turn',
        copy: `${getPlayerName(currentTurnPlayer)} is making an automated move.`,
      }
    }

    return {
      command: null,
      enabled: false,
      label: 'Waiting',
      copy:
        phase === 'awaiting_property_decision'
          ? 'Waiting for the active player to decide on the property.'
          : phase === 'awaiting_turn_end'
            ? 'Waiting for the active player to end the turn.'
            : 'Waiting for the active player.',
    }
  }

  if (phase === 'awaiting_first_turn' || phase === 'awaiting_roll') {
    if (currentPlayerInJail) {
      return {
        command: null,
        enabled: false,
        label: 'Jail turn',
        copy: 'Roll doubles or pay the fine in the jail controls.',
      }
    }

    return {
      command: 'roll',
      enabled: true,
      label: 'Roll dice',
      copy:
        phase === 'awaiting_first_turn'
          ? 'Roll to start your first move.'
          : 'Roll to move and resolve the tile you land on.',
    }
  }

  if (phase === 'awaiting_turn_end') {
    return {
      command: 'endTurn',
      enabled: true,
      label: 'End turn',
      copy: shouldCurrentPlayerPlayAgain
        ? 'You rolled doubles. End this move to keep your turn.'
        : 'Your move is settled. Pass play to the next player.',
    }
  }

  if (phase === 'awaiting_property_decision') {
    return {
      command: 'propertyDecision',
      enabled: true,
      label: 'Buy or auction',
      copy: pendingTileName
        ? `Buy ${pendingTileName} or send it to auction.`
        : 'Choose whether to buy this property or send it to auction.',
    }
  }

  return {
    command: null,
    enabled: false,
    label: 'Resolving',
    copy: phase
      ? `Resolving ${phase.replaceAll('_', ' ')}.`
      : 'Waiting for the next game state.',
  }
}
