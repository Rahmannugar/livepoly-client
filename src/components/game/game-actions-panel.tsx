import { DiceFiveIcon, SpinnerGapIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  GameDebt,
  GamePhase,
  GamePlayer,
  GameProperty,
  GameTradeOffer,
} from '#/lib/game/game.types'
import type { GameTile } from '#/lib/game/game-board'
import { findPlayer, getPlayerName } from '#/lib/game/game-board'
import { DebtActions } from './game-debt-actions'
import { JailActions } from './game-jail-actions'
import { GamePanel } from './game-primitives'
import { TradeOfferActions } from './game-trade-actions'
import {
  PrimaryActionButton,
  PropertyDecisionActions,
} from './game-primary-actions'
import type { PrimaryGameAction } from './game-primary-actions'

export type { PrimaryGameAction } from './game-primary-actions'

export function GameActionsPanel({
  primaryAction,
  commandPending,
  gameExpired,
  errorMessage,
  debt,
  players,
  roomPlayerId,
  currentPlayer,
  currentPlayerInJail,
  isCurrentTurn,
  phase,
  tradeOffer,
  pendingTile,
  pendingProperty,
  onRollAndMove,
  onEndTurn,
  onBuyProperty,
  onDeclinePropertyPurchase,
  onPayDebt,
  onManageProperties,
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
  players: GamePlayer[]
  roomPlayerId: string | null
  currentPlayer: GamePlayer | null
  currentPlayerInJail: boolean
  isCurrentTurn: boolean
  phase: GamePhase | undefined
  tradeOffer: GameTradeOffer | null | undefined
  pendingTile: GameTile | null
  pendingProperty: GameProperty | null
  onRollAndMove: () => void
  onEndTurn: () => void
  onBuyProperty: () => void
  onDeclinePropertyPurchase: () => void
  onPayDebt: () => void
  onManageProperties: () => void
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
    primaryAction.command === 'propertyDecision'
  const canOpenActionSheet = Boolean(
    !gameClosed && !gameExpired && isSpecializedAction,
  )
  const actionAudiencePlayer = shouldShowDebtActions
    ? findPlayer(players, debt?.roomPlayerId)
    : currentPlayer
  const actionAudience =
    !actionableTradeOffer && actionAudiencePlayer
      ? getPlayerName(actionAudiencePlayer)
      : null
  const actionSheetTitle = useMemo(() => {
    if (actionableTradeOffer) return 'Trade offer'
    if (shouldShowDebtActions) return 'Settle payment'
    if (shouldShowJailActions) return 'Jail move'
    if (primaryAction.command === 'propertyDecision') return 'Buy or auction'
    return primaryAction.label
  }, [
    actionableTradeOffer,
    primaryAction.command,
    primaryAction.label,
    shouldShowDebtActions,
    shouldShowJailActions,
  ])
  const panelTitle = useMemo(() => {
    if (tradeOffer && actionableTradeOffer) return 'Trade'
    if (debt && phase === 'awaiting_debt_resolution') return 'Debt'
    if (primaryAction.command === 'propertyDecision') return 'Property'
    if (shouldShowJailActions) return 'Jail'
    return 'Actions'
  }, [
    actionableTradeOffer,
    debt,
    phase,
    primaryAction.command,
    shouldShowJailActions,
    tradeOffer,
  ])
  const autoActionKey = useMemo(() => {
    if (!canOpenActionSheet) return null

    return [
      primaryAction.command,
      primaryAction.label,
      phase ?? 'none',
      tradeOffer?.id ?? 'no-trade',
      debt?.roomPlayerId ?? 'no-debt',
      pendingTile?.key ?? 'no-pending-tile',
    ].join('|')
  }, [
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
          onManageProperties={() => {
            setActionSheetOpen(false)
            onManageProperties()
          }}
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
    <GamePanel title={panelTitle} icon={DiceFiveIcon} collapsible={false}>
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
        <div className="grid gap-2">
          <PrimaryActionButton
            primaryAction={primaryAction}
            commandPending={commandPending}
            onRollAndMove={onRollAndMove}
            onEndTurn={onEndTurn}
          />
          <p className="text-sm font-bold leading-5 text-[var(--sea-ink-soft)]">
            {actionAudience && isCurrentTurn
              ? `${actionAudience}, ${lowercaseFirst(primaryAction.copy)}`
              : primaryAction.copy}
          </p>
        </div>
      )}

      {errorMessage ? (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-bold leading-5 text-red-200"
        >
          {errorMessage}
        </div>
      ) : null}

      {actionSheetOpen ? (
        <GameActionSheet
          title={actionSheetTitle}
          audience={actionAudience}
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
  audience,
  children,
  onClose,
}: {
  title: string
  audience: string | null
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
            {audience ? <p className="app-kicker">For {audience}</p> : null}
            <h3 className="display-title truncate text-2xl font-semibold text-[var(--sea-ink)] sm:text-3xl">
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

function lowercaseFirst(value: string) {
  return value ? `${value[0].toLowerCase()}${value.slice(1)}` : value
}
