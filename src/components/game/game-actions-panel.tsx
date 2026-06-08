import { DiceFiveIcon } from '@phosphor-icons/react'
import type { GameAuction, GameDebt, GamePlayer } from '#/lib/game/game.types'
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

export type { PrimaryGameAction } from './game-primary-actions'

export function GameActionsPanel({
  primaryAction,
  commandPending,
  errorMessage,
  debt,
  auction,
  players,
  roomPlayerId,
  currentPlayer,
  currentPlayerInJail,
  isCurrentTurn,
  auctionTileName,
  pendingTile,
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
  errorMessage: string | null
  debt: GameDebt | null | undefined
  auction: GameAuction | null | undefined
  players: GamePlayer[]
  roomPlayerId: string | null
  currentPlayer: GamePlayer | null
  currentPlayerInJail: boolean
  isCurrentTurn: boolean
  auctionTileName: string | null
  pendingTile: GameTile | null
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
  return (
    <GamePanel title="Actions" icon={DiceFiveIcon}>
      {debt ? (
        <DebtActions
          debt={debt}
          players={players}
          roomPlayerId={roomPlayerId}
          commandPending={commandPending}
          onPayDebt={onPayDebt}
          onDeclareBankruptcy={onDeclareBankruptcy}
        />
      ) : currentPlayerInJail && isCurrentTurn ? (
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
                label: 'Decision ready',
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
        <p>{primaryAction.copy}</p>
        {errorMessage ? <p className="text-red-500">{errorMessage}</p> : null}
      </div>
    </GamePanel>
  )
}
