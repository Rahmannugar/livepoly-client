import { DiceFiveIcon, SpinnerGapIcon } from '@phosphor-icons/react'
import {
  findPlayer,
  formatDebtReason,
  formatMoney,
  getPlayerName,
} from '#/lib/game/game-board'
import type { GameAuction, GameDebt, GamePlayer } from '#/lib/game/game.types'
import { GamePanel, StatePill } from './game-primitives'

export type PrimaryGameAction = {
  command: 'roll' | 'endTurn' | 'propertyDecision' | null
  enabled: boolean
  label: string
  copy: string
}

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
        <PropertyDecisionActions
          commandPending={commandPending}
          onBuyProperty={onBuyProperty}
          onDeclinePropertyPurchase={onDeclinePropertyPurchase}
        />
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

function PropertyDecisionActions({
  commandPending,
  onBuyProperty,
  onDeclinePropertyPurchase,
}: {
  commandPending: boolean
  onBuyProperty: () => void
  onDeclinePropertyPurchase: () => void
}) {
  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={commandPending}
        className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
          commandPending ? 'game-command-button--active' : ''
        }`}
        onClick={onBuyProperty}
      >
        {commandPending ? (
          <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
        ) : null}
        Buy property
      </button>
      <button
        type="button"
        disabled={commandPending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
        onClick={onDeclinePropertyPurchase}
      >
        Start auction
      </button>
    </div>
  )
}

function PrimaryActionButton({
  primaryAction,
  commandPending,
  onRollAndMove,
  onEndTurn,
}: {
  primaryAction: PrimaryGameAction
  commandPending: boolean
  onRollAndMove: () => void
  onEndTurn: () => void
}) {
  return (
    <button
      type="button"
      disabled={!primaryAction.enabled || commandPending}
      className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-bold shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed ${
        primaryAction.enabled
          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
          : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)]'
      } ${commandPending ? 'game-command-button--active' : ''}`}
      onClick={() => {
        if (primaryAction.command === 'roll') {
          onRollAndMove()
          return
        }

        if (primaryAction.command === 'endTurn') {
          onEndTurn()
        }
      }}
    >
      {commandPending ? (
        <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
      ) : null}
      {commandPending ? 'Sending...' : primaryAction.label}
    </button>
  )
}

function JailActions({
  player,
  commandPending,
  onRoll,
  onPayFine,
}: {
  player: GamePlayer | null
  commandPending: boolean
  onRoll: () => void
  onPayFine: () => void
}) {
  const canPayFine = Boolean(player && player.cash >= 50)

  return (
    <div className="game-jail-panel grid gap-4">
      <div>
        <p className="app-kicker">Jail</p>
        <h3 className="display-title mt-2 text-3xl font-semibold text-[var(--sea-ink)]">
          Roll doubles or pay $50.
        </h3>
        <p className="mt-2 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          You can try rolling doubles. After three failed attempts, the fine is
          forced if you can afford it.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatePill
          label="Attempts"
          value={`${player?.jailTurnCount ?? 0}/3`}
        />
        <StatePill
          label="Cash"
          value={player ? `$${formatMoney(player.cash)}` : '...'}
        />
      </div>

      <div className="grid gap-2">
        <button
          type="button"
          disabled={commandPending}
          className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
            commandPending ? 'game-command-button--active' : ''
          }`}
          onClick={onRoll}
        >
          {commandPending ? (
            <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
          ) : null}
          Roll for doubles
        </button>
        <button
          type="button"
          disabled={!canPayFine || commandPending}
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
          onClick={onPayFine}
        >
          Pay $50 fine
        </button>
      </div>

      {!canPayFine ? (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          You need $50 cash to pay the fine.
        </p>
      ) : null}
    </div>
  )
}

function AuctionActions({
  auction,
  players,
  roomPlayerId,
  tileName,
  bidAmount,
  minimumBid,
  commandPending,
  onBidAmountChange,
  onPlaceBid,
  onPass,
}: {
  auction: GameAuction
  players: GamePlayer[]
  roomPlayerId: string | null
  tileName: string
  bidAmount: number
  minimumBid: number
  commandPending: boolean
  onBidAmountChange: (amount: number) => void
  onPlaceBid: () => void
  onPass: () => void
}) {
  const highestBidder = findPlayer(players, auction.highestBidderRoomPlayerId)
  const hasPassed = Boolean(
    roomPlayerId && auction.passedRoomPlayerIds.includes(roomPlayerId),
  )
  const canBid = Boolean(
    roomPlayerId &&
      auction.activeRoomPlayerIds.includes(roomPlayerId) &&
      !hasPassed,
  )

  return (
    <div className="game-auction-panel grid gap-4">
      <div>
        <p className="app-kicker">Auction</p>
        <h3 className="display-title mt-2 text-3xl font-semibold text-[var(--sea-ink)]">
          {tileName}
        </h3>
        <p className="mt-2 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          Current bid is ${formatMoney(auction.currentBid)}.{' '}
          {highestBidder
            ? `${getPlayerName(highestBidder)} leads.`
            : 'No one has bid yet.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatePill label="Minimum" value={`$${formatMoney(minimumBid)}`} />
        <StatePill
          label="Active"
          value={`${auction.activeRoomPlayerIds.length - auction.passedRoomPlayerIds.length}`}
        />
      </div>

      <label className="grid gap-2 text-sm font-black text-[var(--sea-ink)]">
        Bid amount
        <input
          type="number"
          min={minimumBid}
          step={10}
          disabled={!canBid || commandPending}
          value={bidAmount}
          onChange={(event) =>
            onBidAmountChange(Number.parseInt(event.target.value, 10) || minimumBid)
          }
          className="h-12 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 text-base font-bold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-70"
        />
      </label>

      <div className="grid gap-2">
        <button
          type="button"
          disabled={!canBid || commandPending || bidAmount < minimumBid}
          className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
            commandPending ? 'game-command-button--active' : ''
          }`}
          onClick={onPlaceBid}
        >
          {commandPending ? (
            <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
          ) : null}
          Place bid
        </button>
        <button
          type="button"
          disabled={!canBid || commandPending}
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
          onClick={onPass}
        >
          Pass
        </button>
      </div>

      {!canBid ? (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          {hasPassed
            ? 'You have passed in this auction.'
            : 'Waiting for active bidders.'}
        </p>
      ) : null}
    </div>
  )
}

function DebtActions({
  debt,
  players,
  roomPlayerId,
  commandPending,
  onPayDebt,
  onDeclareBankruptcy,
}: {
  debt: GameDebt
  players: GamePlayer[]
  roomPlayerId: string | null
  commandPending: boolean
  onPayDebt: () => void
  onDeclareBankruptcy: () => void
}) {
  const debtor = findPlayer(players, debt.roomPlayerId)
  const creditor = findPlayer(players, debt.creditorRoomPlayerId)
  const isDebtor = roomPlayerId === debt.roomPlayerId
  const canPay = Boolean(isDebtor && debtor && debtor.cash >= debt.amount)
  const creditorName = creditor ? getPlayerName(creditor) : 'the bank'

  return (
    <div className="game-debt-panel grid gap-4">
      <div>
        <p className="app-kicker">Debt</p>
        <h3 className="display-title mt-2 text-3xl font-semibold text-[var(--sea-ink)]">
          ${formatMoney(debt.amount)} due
        </h3>
        <p className="mt-2 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          {debtor ? getPlayerName(debtor) : 'A player'} owes {creditorName} for{' '}
          {formatDebtReason(debt.reason)}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatePill label="Cash" value={debtor ? `$${formatMoney(debtor.cash)}` : '...'} />
        <StatePill label="Owed to" value={creditorName} />
      </div>

      <div className="grid gap-2">
        <button
          type="button"
          disabled={!canPay || commandPending}
          className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
            commandPending ? 'game-command-button--active' : ''
          }`}
          onClick={onPayDebt}
        >
          {commandPending ? (
            <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
          ) : null}
          Pay debt
        </button>
        <button
          type="button"
          disabled={!isDebtor || commandPending}
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-red-500/45 bg-red-500/10 px-5 text-sm font-bold text-red-500 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
          onClick={onDeclareBankruptcy}
        >
          Declare bankruptcy
        </button>
      </div>

      {!isDebtor ? (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          Waiting for {debtor ? getPlayerName(debtor) : 'the indebted player'} to resolve this.
        </p>
      ) : !canPay ? (
        <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          You need more cash. Mortgage a property or declare bankruptcy.
        </p>
      ) : null}
    </div>
  )
}
