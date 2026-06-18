import { DiceFiveIcon, SpinnerGapIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  GameAuction,
  GameDebt,
  GamePhase,
  GamePlayer,
  GameProperty,
  GameTradeOffer,
} from '#/lib/game/game.types'
import type { GameTile } from '#/lib/game/game-board'
import { AuctionActions } from './game-auction-actions'
import { DebtActions } from './game-debt-actions'
import { JailActions } from './game-jail-actions'
import { GamePanel } from './game-primitives'
import { TradeOfferActions } from './game-trade-actions'
import {
  PrimaryActionButton,
  PropertyDecisionActions,
  type PrimaryGameAction,
} from './game-primary-actions'

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
  tradeOffer,
  auctionTileName,
  pendingTile,
  pendingProperty,
  minimumAuctionBid,
  onRollAndMove,
  onEndTurn,
  onBuyProperty,
  onDeclinePropertyPurchase,
  onPlaceAuctionBid,
  onPassAuctionBid,
  onPayDebt,
  onPayJailFine,
  onUseGetOutOfJailCard,
  onDeclareBankruptcy,
  onAcceptTrade,
  onRejectTrade,
  onCancelTrade,
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
  tradeOffer: GameTradeOffer | null | undefined
  auctionTileName: string | null
  pendingTile: GameTile | null
  pendingProperty: GameProperty | null
  minimumAuctionBid: number
  onRollAndMove: () => void
  onEndTurn: () => void
  onBuyProperty: () => void
  onDeclinePropertyPurchase: () => void
  onPlaceAuctionBid: (amount: number) => void
  onPassAuctionBid: () => void
  onPayDebt: () => void
  onPayJailFine: () => void
  onUseGetOutOfJailCard: () => void
  onDeclareBankruptcy: () => void
  onAcceptTrade: (tradeId: string) => void
  onRejectTrade: (tradeId: string) => void
  onCancelTrade: (tradeId: string) => void
}) {
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const [lastAutoOpenedActionKey, setLastAutoOpenedActionKey] = useState<
    string | null
  >(null)
  const gameClosed = phase === 'finished' || phase === 'cancelled'
  const actionableTradeOffer = Boolean(
    tradeOffer &&
      roomPlayerId &&
      (tradeOffer.fromRoomPlayerId === roomPlayerId ||
        tradeOffer.toRoomPlayerId === roomPlayerId),
  )
  const shouldShowDebtActions = Boolean(
    debt && roomPlayerId && debt.roomPlayerId === roomPlayerId,
  )
  const shouldShowAuctionActions = Boolean(
    auction &&
      roomPlayerId &&
      auction.currentBidderRoomPlayerId === roomPlayerId &&
      !auction.passedRoomPlayerIds.includes(roomPlayerId),
  )
  const shouldShowJailActions = Boolean(
    !gameClosed &&
    currentPlayerInJail &&
      isCurrentTurn &&
      (phase === 'awaiting_first_turn' || phase === 'awaiting_roll'),
  )
  const isSpecializedAction =
    actionableTradeOffer ||
    shouldShowDebtActions ||
    shouldShowJailActions ||
    shouldShowAuctionActions ||
    primaryAction.command === 'propertyDecision'
  const canOpenActionSheet = Boolean(
    !gameClosed &&
      !gameExpired &&
      (isSpecializedAction || primaryAction.enabled),
  )
  const actionSheetTitle = useMemo(() => {
    if (actionableTradeOffer) return 'Trade offer'
    if (shouldShowDebtActions) return 'Settle payment'
    if (shouldShowJailActions) return 'Jail move'
    if (shouldShowAuctionActions) return 'Auction'
    if (primaryAction.command === 'propertyDecision') return 'Buy or auction'
    return primaryAction.label
  }, [
    actionableTradeOffer,
    primaryAction.command,
    primaryAction.label,
    shouldShowAuctionActions,
    shouldShowDebtActions,
    shouldShowJailActions,
  ])
  const autoActionKey = useMemo(() => {
    if (!canOpenActionSheet) return null

    return [
      primaryAction.command,
      primaryAction.label,
      phase ?? 'none',
      tradeOffer?.id ?? 'no-trade',
      debt?.roomPlayerId ?? 'no-debt',
      auction
        ? [
            auction.tileKey,
            auction.currentBid,
            auction.currentBidderRoomPlayerId ?? 'none',
            auction.highestBidderRoomPlayerId ?? 'none',
            auction.bidExpiresAt ?? 'none',
          ].join(':')
        : 'no-auction',
      pendingTile?.key ?? 'no-pending-tile',
    ].join('|')
  }, [
    auction,
    canOpenActionSheet,
    debt?.roomPlayerId,
    pendingTile?.key,
    phase,
    primaryAction.command,
    primaryAction.label,
    tradeOffer?.id,
  ])

  useEffect(() => {
    if (!canOpenActionSheet) {
      setActionSheetOpen(false)
    }
  }, [canOpenActionSheet])

  useEffect(() => {
    if (!autoActionKey || autoActionKey === lastAutoOpenedActionKey) {
      return
    }

    setActionSheetOpen(true)
    setLastAutoOpenedActionKey(autoActionKey)
  }, [autoActionKey, lastAutoOpenedActionKey])

  const runAndClose = (handler: () => void) => {
    handler()
    setActionSheetOpen(false)
  }

  const actionControls = (
    <>
      {tradeOffer && actionableTradeOffer ? (
        <TradeOfferActions
          tradeOffer={tradeOffer}
          players={players}
          roomPlayerId={roomPlayerId}
          commandPending={commandPending}
          onAccept={(tradeId) => runAndClose(() => onAcceptTrade(tradeId))}
          onReject={(tradeId) => runAndClose(() => onRejectTrade(tradeId))}
          onCancel={(tradeId) => runAndClose(() => onCancelTrade(tradeId))}
        />
      ) : gameClosed || gameExpired ? (
        <PrimaryActionButton
          primaryAction={primaryAction}
          commandPending={commandPending}
          onRollAndMove={() => runAndClose(onRollAndMove)}
          onEndTurn={() => runAndClose(onEndTurn)}
        />
      ) : debt && shouldShowDebtActions ? (
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
          onUseCard={() => runAndClose(onUseGetOutOfJailCard)}
        />
      ) : auction && shouldShowAuctionActions ? (
        <AuctionActions
          auction={auction}
          players={players}
          roomPlayerId={roomPlayerId}
          tileName={auctionTileName ?? auction.tileKey}
          minimumBid={minimumAuctionBid}
          commandPending={commandPending}
          onPlaceBid={(amount) => runAndClose(() => onPlaceAuctionBid(amount))}
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
          disabled={commandPending}
          className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
            commandPending ? 'game-command-button--active' : ''
          }`}
          onClick={() => setActionSheetOpen(true)}
        >
          {commandPending ? (
            <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
          ) : null}
          {commandPending ? 'Playing...' : actionSheetTitle}
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
    <div
      aria-live="polite"
      className="fixed inset-0 z-40 flex items-end justify-center p-0 md:items-center md:p-6"
    >
      <button
        type="button"
        aria-label="Close action"
        className="game-decision-backdrop absolute inset-0 bg-[rgba(4,12,15,0.46)] backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="game-decision-sheet relative z-10 grid max-h-[min(86vh,44rem)] w-full gap-3 overflow-y-auto rounded-t-[28px] border border-[var(--line)] bg-[var(--bg-base)] p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_28px_90px_rgba(4,12,15,0.34)] md:max-w-2xl md:rounded-[28px] md:p-4 xl:max-w-3xl"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="display-title truncate text-3xl font-semibold text-[var(--sea-ink)]">
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
