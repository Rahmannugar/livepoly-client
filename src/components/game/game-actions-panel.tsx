import { DiceFiveIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  GameAuction,
  GameDebt,
  GamePhase,
  GamePlayer,
  GameProperty,
} from '#/lib/game/game.types'
import type { GameTile } from '#/lib/game/game-board'
import { AuctionActions } from './game-auction-actions'
import { DebtActions } from './game-debt-actions'
import { JailActions } from './game-jail-actions'
import { GamePanel } from './game-primitives'
import {
  PrimaryActionButton,
  PropertyDecisionActions,
  type PrimaryGameAction,
} from './game-primary-actions'
import { TileInfoPanel } from './game-tile-info'

export type { PrimaryGameAction } from './game-primary-actions'

export function GameActionsPanel({
  primaryAction,
  commandPending,
  gameExpired,
  errorMessage,
  debt,
  auction,
  players,
  roomPlayerId,
  currentPlayer,
  currentPlayerInJail,
  isCurrentTurn,
  phase,
  auctionTileName,
  pendingTile,
  pendingProperty,
  activeTile,
  activeProperty,
  activeOwner,
  activeTileLabel,
  auctionBidAmount,
  minimumAuctionBid,
  onAuctionBidAmountChange,
  onRollAndMove,
  onEndTurn,
  onBuyProperty,
  onDeclinePropertyPurchase,
  onPlaceAuctionBid,
  onPassAuctionBid,
  onPayDebt,
  onPayJailFine,
  onDeclareBankruptcy,
}: {
  primaryAction: PrimaryGameAction
  commandPending: boolean
  gameExpired: boolean
  errorMessage: string | null
  debt: GameDebt | null | undefined
  auction: GameAuction | null | undefined
  players: GamePlayer[]
  roomPlayerId: string | null
  currentPlayer: GamePlayer | null
  currentPlayerInJail: boolean
  isCurrentTurn: boolean
  phase: GamePhase | undefined
  auctionTileName: string | null
  pendingTile: GameTile | null
  pendingProperty: GameProperty | null
  activeTile: GameTile | null
  activeProperty: GameProperty | null
  activeOwner: GamePlayer | null
  activeTileLabel: string
  auctionBidAmount: number
  minimumAuctionBid: number
  onAuctionBidAmountChange: (amount: number) => void
  onRollAndMove: () => void
  onEndTurn: () => void
  onBuyProperty: () => void
  onDeclinePropertyPurchase: () => void
  onPlaceAuctionBid: (amount: number) => void
  onPassAuctionBid: () => void
  onPayDebt: () => void
  onPayJailFine: () => void
  onDeclareBankruptcy: () => void
}) {
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const gameClosed = phase === 'finished' || phase === 'cancelled'
  const shouldShowActiveTile =
    !gameClosed &&
    Boolean(activeTile) &&
    primaryAction.command !== 'propertyDecision'
  const shouldShowJailActions = Boolean(
    !gameClosed &&
    currentPlayerInJail &&
      isCurrentTurn &&
      (phase === 'awaiting_first_turn' || phase === 'awaiting_roll'),
  )
  const isSpecializedAction =
    Boolean(debt) ||
    shouldShowJailActions ||
    Boolean(auction) ||
    primaryAction.command === 'propertyDecision'
  const canOpenActionSheet = Boolean(
    !gameClosed &&
      !gameExpired &&
      (isSpecializedAction || primaryAction.enabled),
  )
  const actionSheetTitle = useMemo(() => {
    if (debt) return 'Settle payment'
    if (shouldShowJailActions) return 'Jail move'
    if (auction) return 'Auction'
    if (primaryAction.command === 'propertyDecision') return 'Property decision'
    return primaryAction.label
  }, [auction, debt, primaryAction.command, primaryAction.label, shouldShowJailActions])

  useEffect(() => {
    if (!canOpenActionSheet) {
      setActionSheetOpen(false)
    }
  }, [canOpenActionSheet])

  const runAndClose = (handler: () => void) => {
    handler()
    setActionSheetOpen(false)
  }

  const actionControls = (
    <>
      {shouldShowActiveTile ? (
        <div className="mb-4">
          <TileInfoPanel
            tile={activeTile}
            label={activeTileLabel}
            property={activeProperty}
            owner={activeOwner}
            defaultCollapsed={isSpecializedAction}
          />
        </div>
      ) : null}

      {gameClosed || gameExpired ? (
        <PrimaryActionButton
          primaryAction={primaryAction}
          commandPending={commandPending}
          onRollAndMove={() => runAndClose(onRollAndMove)}
          onEndTurn={() => runAndClose(onEndTurn)}
        />
      ) : debt ? (
        <DebtActions
          debt={debt}
          players={players}
          roomPlayerId={roomPlayerId}
          commandPending={commandPending}
          onPayDebt={() => runAndClose(onPayDebt)}
          onDeclareBankruptcy={() => runAndClose(onDeclareBankruptcy)}
        />
      ) : shouldShowJailActions ? (
        <JailActions
          player={currentPlayer}
          commandPending={commandPending}
          onRoll={() => runAndClose(onRollAndMove)}
          onPayFine={() => runAndClose(onPayJailFine)}
        />
      ) : auction ? (
        <AuctionActions
          auction={auction}
          players={players}
          roomPlayerId={roomPlayerId}
          tileName={auctionTileName ?? auction.tileKey}
          bidAmount={auctionBidAmount}
          minimumBid={minimumAuctionBid}
          commandPending={commandPending}
          onBidAmountChange={onAuctionBidAmountChange}
          onPlaceBid={(amount) => {
            onPlaceAuctionBid(amount)
            setActionSheetOpen(false)
          }}
          onPass={() => runAndClose(onPassAuctionBid)}
        />
      ) : primaryAction.command === 'propertyDecision' ? (
        <PropertyDecisionActions
          tile={pendingTile}
          property={pendingProperty}
          commandPending={commandPending}
          onBuyProperty={() => runAndClose(onBuyProperty)}
          onDeclinePropertyPurchase={() =>
            runAndClose(onDeclinePropertyPurchase)
          }
        />
      ) : (
        <PrimaryActionButton
          primaryAction={primaryAction}
          commandPending={commandPending}
          onRollAndMove={() => runAndClose(onRollAndMove)}
          onEndTurn={() => runAndClose(onEndTurn)}
        />
      )}
    </>
  )

  return (
    <GamePanel title="Actions" icon={DiceFiveIcon} collapsible={false}>
      {canOpenActionSheet ? (
        <button
          type="button"
          className="game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px]"
          onClick={() => setActionSheetOpen(true)}
        >
          {actionSheetTitle}
        </button>
      ) : (
        <PrimaryActionButton
          primaryAction={primaryAction}
          commandPending={commandPending}
          onRollAndMove={onRollAndMove}
          onEndTurn={onEndTurn}
        />
      )}

      <div className="mt-3 grid gap-2 text-sm font-bold text-[var(--sea-ink-soft)]">
        <p>{primaryAction.copy}</p>
        {errorMessage ? <p className="text-red-500">{errorMessage}</p> : null}
      </div>

      {actionSheetOpen ? (
        <GameActionSheet
          title={actionSheetTitle}
          onClose={() => setActionSheetOpen(false)}
        >
          {actionControls}
        </GameActionSheet>
      ) : null}
    </GamePanel>
  )
}

function GameActionSheet({
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
        aria-label="Close action"
        className="game-decision-backdrop fixed inset-0 z-40 bg-[rgba(4,12,15,0.46)] backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="game-decision-sheet fixed inset-x-3 bottom-3 z-50 mx-auto grid max-h-[min(84vh,44rem)] w-auto max-w-2xl gap-4 overflow-y-auto rounded-[28px] border border-[var(--line)] bg-[var(--bg-base)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_28px_90px_rgba(4,12,15,0.34)] md:inset-x-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="app-kicker">Action</p>
            <h3 className="display-title mt-1 truncate text-3xl font-semibold text-[var(--sea-ink)]">
              {title}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Close action"
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
