import { SpinnerGapIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { findPlayer, formatCash, getPlayerName } from '#/lib/game/game-board'
import type { GameAuction, GamePlayer } from '#/lib/game/game.types'
import { StatePill } from './game-primitives'

export function AuctionActions({
  auction,
  players,
  roomPlayerId,
  tileName,
  minimumBid,
  availableCash,
  commandPending,
  onPlaceBid,
  onPass,
}: {
  auction: GameAuction
  players: GamePlayer[]
  roomPlayerId: string | null
  tileName: string
  minimumBid: number
  availableCash: number | null
  commandPending: boolean
  onPlaceBid: (amount: number) => void
  onPass: () => void
}) {
  const [bidInputValue, setBidInputValue] = useState('')
  const highestBidder = findPlayer(players, auction.highestBidderRoomPlayerId)
  const currentBidder = findPlayer(players, auction.currentBidderRoomPlayerId)
  const parsedBidAmount = Number.parseInt(bidInputValue, 10)
  const bidIsAffordable =
    availableCash === null || parsedBidAmount <= availableCash
  const bidIsValid =
    Number.isFinite(parsedBidAmount) &&
    parsedBidAmount >= minimumBid &&
    bidIsAffordable
  const hasPassed = Boolean(
    roomPlayerId && auction.passedRoomPlayerIds.includes(roomPlayerId),
  )
  const canBid = Boolean(
    roomPlayerId &&
    auction.currentBidderRoomPlayerId === roomPlayerId &&
    !hasPassed,
  )
  const activeBidderCount = auction.activeRoomPlayerIds.filter(
    (activeRoomPlayerId) =>
      !auction.passedRoomPlayerIds.includes(activeRoomPlayerId),
  ).length
  const turnCopy = canBid
    ? `Your turn to bid on ${tileName}.`
    : hasPassed
      ? `You passed on ${tileName}.`
      : currentBidder
        ? `${getPlayerName(currentBidder)} is deciding on ${tileName}.`
        : `The auction for ${tileName} is settling.`
  useEffect(() => {
    if (!canBid) {
      setBidInputValue('')
      return
    }
  }, [canBid])

  function normalizeBidInput() {
    if (!bidIsValid) {
      return null
    }

    setBidInputValue(String(parsedBidAmount))
    return parsedBidAmount
  }

  return (
    <div className="game-auction-panel grid gap-4">
      <div>
        <p className="app-kicker">Auction</p>
        <h3 className="display-title mt-1 text-2xl font-semibold text-[var(--sea-ink)] sm:text-3xl">
          {tileName}
        </h3>
        <p className="mt-2 text-sm font-black leading-6 text-[var(--sea-ink)] sm:text-base">
          {turnCopy}
        </p>
        <p className="mt-1 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
          {auction.currentBid > 0
            ? `Current bid is ${formatCash(auction.currentBid)}.`
            : 'No bid yet.'}{' '}
          {highestBidder ? `${getPlayerName(highestBidder)} leads.` : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatePill
          label="Current"
          value={
            auction.currentBid > 0 ? formatCash(auction.currentBid) : 'None'
          }
        />
        <StatePill label="Next bid" value={formatCash(minimumBid)} />
        <StatePill
          label="Leading"
          value={highestBidder ? getPlayerName(highestBidder) : 'No bid'}
        />
        <StatePill label="Still in" value={`${activeBidderCount}`} />
      </div>

      <label className="grid gap-2 text-sm font-black text-[var(--sea-ink)]">
        Bid amount
        {availableCash !== null ? (
          <span className="text-xs font-bold text-[var(--sea-ink-soft)]">
            {formatCash(availableCash)} available
          </span>
        ) : null}
        <input
          type="text"
          inputMode="numeric"
          disabled={!canBid || commandPending}
          value={bidInputValue}
          onChange={(event) => {
            const nextValue = event.target.value.replace(/\D/g, '')

            setBidInputValue(nextValue)
          }}
          onBlur={normalizeBidInput}
          placeholder={formatCash(minimumBid)}
          className="h-12 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 text-base font-bold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-70"
        />
        {canBid &&
        bidInputValue &&
        Number.isFinite(parsedBidAmount) &&
        !bidIsAffordable ? (
          <span className="text-xs font-black text-red-500">
            You only have {formatCash(availableCash)}.
          </span>
        ) : canBid && bidInputValue && !bidIsValid ? (
          <span className="text-xs font-black text-red-500">
            Enter at least {formatCash(minimumBid)}.
          </span>
        ) : null}
      </label>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!canBid || commandPending || !bidIsValid}
          className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
            commandPending ? 'game-command-button--active' : ''
          }`}
          onClick={() => {
            const normalizedBidAmount = normalizeBidInput()

            if (normalizedBidAmount !== null) {
              onPlaceBid(normalizedBidAmount)
            }
          }}
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
    </div>
  )
}
