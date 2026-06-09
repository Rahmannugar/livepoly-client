import { SpinnerGapIcon } from '@phosphor-icons/react'
import { findPlayer, formatCash, getPlayerName } from '#/lib/game/game-board'
import type { GameAuction, GamePlayer } from '#/lib/game/game.types'
import { StatePill } from './game-primitives'

export function AuctionActions({
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
  const activeBidderCount =
    auction.activeRoomPlayerIds.length - auction.passedRoomPlayerIds.length
  const statusCopy = canBid
    ? 'You can raise the bid or pass.'
    : hasPassed
      ? 'You have passed. Waiting for the auction to finish.'
      : 'Waiting for active bidders.'

  return (
    <div className="game-auction-panel grid gap-4">
      <div>
        <p className="app-kicker">Auction</p>
        <h3 className="display-title mt-2 text-3xl font-semibold text-[var(--sea-ink)]">
          {tileName}
        </h3>
        <p className="mt-2 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          Current bid is {formatCash(auction.currentBid)}.{' '}
          {highestBidder
            ? `${getPlayerName(highestBidder)} leads.`
            : 'No one has bid yet.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatePill label="Minimum" value={formatCash(minimumBid)} />
        <StatePill label="Active" value={`${activeBidderCount}`} />
        <StatePill
          label="Leading"
          value={highestBidder ? getPlayerName(highestBidder) : 'No bid'}
        />
        <StatePill
          label="Passed"
          value={`${auction.passedRoomPlayerIds.length}`}
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
            onBidAmountChange(
              Number.parseInt(event.target.value, 10) || minimumBid,
            )
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

      <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
        {statusCopy}
      </p>
    </div>
  )
}
