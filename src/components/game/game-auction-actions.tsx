import { SpinnerGapIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { formatCash } from '#/lib/game/game-board'
import type { GameAuction } from '#/lib/game/game.types'

export function AuctionBidControls({
  auction,
  roomPlayerId,
  minimumBid,
  availableCash,
  commandPending,
  onPlaceBid,
  onPass,
}: {
  auction: GameAuction
  roomPlayerId: string | null
  minimumBid: number
  availableCash: number | null
  commandPending: boolean
  onPlaceBid: (amount: number) => void
  onPass: () => void
}) {
  const [bidInputValue, setBidInputValue] = useState('')
  const parsedBidAmount = Number.parseInt(bidInputValue, 10)
  const canBid = Boolean(
    roomPlayerId &&
    auction.currentBidderRoomPlayerId === roomPlayerId &&
    !auction.passedRoomPlayerIds.includes(roomPlayerId),
  )
  const bidIsAffordable =
    availableCash === null || parsedBidAmount <= availableCash
  const bidIsValid =
    Number.isFinite(parsedBidAmount) &&
    parsedBidAmount >= minimumBid &&
    bidIsAffordable

  useEffect(() => {
    setBidInputValue(canBid ? String(minimumBid) : '')
  }, [canBid, minimumBid])

  return (
    <div className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 sm:rounded-2xl">
      <label className="grid gap-1 text-sm font-black text-[var(--sea-ink)]">
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
          onChange={(event) =>
            setBidInputValue(event.target.value.replace(/\D/g, ''))
          }
          placeholder={formatCash(minimumBid)}
          className="h-11 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 text-base font-bold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-70"
        />
        {bidInputValue &&
        Number.isFinite(parsedBidAmount) &&
        !bidIsAffordable ? (
          <span className="text-xs font-black text-red-400">
            You only have {formatCash(availableCash)}.
          </span>
        ) : bidInputValue && !bidIsValid ? (
          <span className="text-xs font-black text-red-400">
            Enter at least {formatCash(minimumBid)}.
          </span>
        ) : null}
      </label>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!canBid || commandPending || !bidIsValid}
          className={`game-command-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-3 text-sm font-bold text-[var(--primary-foreground)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
            commandPending ? 'game-command-button--active' : ''
          }`}
          onClick={() => onPlaceBid(parsedBidAmount)}
        >
          {commandPending ? (
            <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
          ) : null}
          Bid {bidIsValid ? formatCash(parsedBidAmount) : ''}
        </button>
        <button
          type="button"
          disabled={!canBid || commandPending}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
          onClick={onPass}
        >
          Pass
        </button>
      </div>
    </div>
  )
}
