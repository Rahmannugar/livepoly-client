import { GavelIcon } from '@phosphor-icons/react'
import { findPlayer, formatCash, getPlayerName } from '#/lib/game/game-board'
import type { GameAuction, GamePlayer } from '#/lib/game/game.types'
import { GamePanel, StatePill } from './game-primitives'

export function AuctionStatusPanel({
  auction,
  players,
  roomPlayerId,
  tileName,
  minimumBid,
}: {
  auction: GameAuction
  players: GamePlayer[]
  roomPlayerId: string | null
  tileName: string
  minimumBid: number
}) {
  const currentBidder = findPlayer(players, auction.currentBidderRoomPlayerId)
  const highestBidder = findPlayer(players, auction.highestBidderRoomPlayerId)
  const hasPassed = Boolean(
    roomPlayerId && auction.passedRoomPlayerIds.includes(roomPlayerId),
  )
  const isCurrentBidder = Boolean(
    roomPlayerId && auction.currentBidderRoomPlayerId === roomPlayerId,
  )
  const activeBidderCount = auction.activeRoomPlayerIds.filter(
    (activeRoomPlayerId) =>
      !auction.passedRoomPlayerIds.includes(activeRoomPlayerId),
  ).length

  return (
    <GamePanel title="Auction" icon={GavelIcon} collapsible={false}>
      <div className="grid gap-3">
        <div className="rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--primary)_10%,var(--surface))] p-3 sm:rounded-2xl sm:p-4">
          <p className="app-kicker">Live auction</p>
          <h3 className="display-title mt-1 truncate text-2xl font-semibold text-[var(--sea-ink)] sm:text-3xl">
            {tileName}
          </h3>
          <p className="mt-2 text-sm font-black leading-6 text-[var(--sea-ink)]">
            {isCurrentBidder
              ? 'Your chance to bid or pass.'
              : hasPassed
                ? 'You passed. The auction continues.'
                : currentBidder
                  ? `${getPlayerName(currentBidder)} is deciding.`
                  : 'The auction is settling.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StatePill
            label="Current bid"
            value={
              auction.currentBid > 0 ? formatCash(auction.currentBid) : 'None'
            }
          />
          <StatePill label="Next bid" value={formatCash(minimumBid)} />
          <StatePill
            label="Leading"
            value={highestBidder ? getPlayerName(highestBidder) : 'No bid'}
          />
          <StatePill
            label="Now deciding"
            value={currentBidder ? getPlayerName(currentBidder) : 'Settling'}
          />
        </div>
        <p className="text-xs font-bold text-[var(--sea-ink-soft)]">
          {activeBidderCount} still in · {auction.passedRoomPlayerIds.length}{' '}
          passed
        </p>
      </div>
    </GamePanel>
  )
}
