import { DiceFiveIcon } from '@phosphor-icons/react'
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
  onPlaceAuctionBid: () => void
  onPassAuctionBid: () => void
  onPayDebt: () => void
  onPayJailFine: () => void
  onDeclareBankruptcy: () => void
}) {
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

  return (
    <GamePanel title="Actions" icon={DiceFiveIcon}>
      {shouldShowActiveTile ? (
        <div className="mb-4">
          <TileInfoPanel
            tile={activeTile}
            label={activeTileLabel}
            property={activeProperty}
            owner={activeOwner}
          />
        </div>
      ) : null}

      {gameClosed || gameExpired ? (
        <PrimaryActionButton
          primaryAction={primaryAction}
          commandPending={commandPending}
          onRollAndMove={onRollAndMove}
          onEndTurn={onEndTurn}
        />
      ) : debt ? (
        <DebtActions
          debt={debt}
          players={players}
          roomPlayerId={roomPlayerId}
          commandPending={commandPending}
          onPayDebt={onPayDebt}
          onDeclareBankruptcy={onDeclareBankruptcy}
        />
      ) : shouldShowJailActions ? (
        <JailActions
          player={currentPlayer}
          commandPending={commandPending}
          onRoll={onRollAndMove}
          onPayFine={onPayJailFine}
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
          onPlaceBid={onPlaceAuctionBid}
          onPass={onPassAuctionBid}
        />
      ) : primaryAction.command === 'propertyDecision' ? (
        <>
          <div className="hidden md:block">
            <PropertyDecisionActions
              tile={pendingTile}
              property={pendingProperty}
              commandPending={commandPending}
              onBuyProperty={onBuyProperty}
              onDeclinePropertyPurchase={onDeclinePropertyPurchase}
            />
          </div>
          <div className="md:hidden">
            <PrimaryActionButton
              primaryAction={{
                ...primaryAction,
                enabled: false,
                label: 'Choose below',
                copy: 'Use the property decision sheet at the bottom of the screen.',
              }}
              commandPending={commandPending}
              onRollAndMove={onRollAndMove}
              onEndTurn={onEndTurn}
            />
          </div>
        </>
      ) : (
        <PrimaryActionButton
          primaryAction={primaryAction}
          commandPending={commandPending}
          onRollAndMove={onRollAndMove}
          onEndTurn={onEndTurn}
        />
      )}

      <div className="mt-3 grid gap-2 text-sm font-bold text-[var(--sea-ink-soft)]">
        {!isSpecializedAction ? <p>{primaryAction.copy}</p> : null}
        {errorMessage ? <p className="text-red-500">{errorMessage}</p> : null}
      </div>
    </GamePanel>
  )
}
