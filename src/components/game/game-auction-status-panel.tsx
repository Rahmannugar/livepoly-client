import { GavelIcon } from '@phosphor-icons/react'
import { findPlayer, formatCash, getPlayerName } from '#/lib/game/game-board'
import type {
  GameAuction,
  GameEventLogItem,
  GamePlayer,
} from '#/lib/game/game.types'
import { AuctionBidControls } from './game-auction-actions'
import { GamePanel, PlayerToken, StatePill } from './game-primitives'

export function AuctionStatusPanel({
  auction,
  players,
  events,
  roomPlayerId,
  tileName,
  minimumBid,
  commandPending,
  onPlaceBid,
  onPass,
}: {
  auction: GameAuction
  players: GamePlayer[]
  events: GameEventLogItem[]
  roomPlayerId: string | null
  tileName: string
  minimumBid: number
  commandPending: boolean
  onPlaceBid: (amount: number) => void
  onPass: () => void
}) {
  const currentBidder = findPlayer(players, auction.currentBidderRoomPlayerId)
  const highestBidder = findPlayer(players, auction.highestBidderRoomPlayerId)
  const currentUser = findPlayer(players, roomPlayerId)
  const hasPassed = Boolean(
    roomPlayerId && auction.passedRoomPlayerIds.includes(roomPlayerId),
  )
  const isCurrentBidder = Boolean(
    roomPlayerId && auction.currentBidderRoomPlayerId === roomPlayerId,
  )
  const bidders = getAuctionPlayers(auction, players)
  const latestBids = getLatestBids(events, auction.tileKey)

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
              ? `${currentUser ? getPlayerName(currentUser) : 'You'}, bid or pass.`
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

        <div>
          <p className="app-kicker mb-2">Bidders</p>
          <div className="grid gap-2">
            {bidders.map((player) => (
              <AuctionPlayerRow
                key={player.roomPlayerId}
                player={player}
                auction={auction}
                latestBid={latestBids.get(player.roomPlayerId) ?? null}
              />
            ))}
          </div>
        </div>

        {isCurrentBidder && !hasPassed ? (
          <AuctionBidControls
            auction={auction}
            roomPlayerId={roomPlayerId}
            minimumBid={minimumBid}
            availableCash={currentUser?.cash ?? null}
            commandPending={commandPending}
            onPlaceBid={onPlaceBid}
            onPass={onPass}
          />
        ) : null}
      </div>
    </GamePanel>
  )
}

function AuctionPlayerRow({
  player,
  auction,
  latestBid,
}: {
  player: GamePlayer
  auction: GameAuction
  latestBid: number | null
}) {
  const hasPassed = auction.passedRoomPlayerIds.includes(player.roomPlayerId)
  const isCurrent = auction.currentBidderRoomPlayerId === player.roomPlayerId
  const isLeading = auction.highestBidderRoomPlayerId === player.roomPlayerId
  const status = hasPassed
    ? 'Passed'
    : isCurrent && isLeading
      ? 'Leading · deciding'
      : isCurrent
        ? 'Deciding'
        : isLeading
          ? 'Leading'
          : 'Waiting'
  const bid =
    latestBid ??
    (isLeading && auction.currentBid > 0 ? auction.currentBid : null)

  return (
    <div
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border p-2.5 ${
        isCurrent
          ? 'border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_10%,var(--surface))]'
          : 'border-[var(--line)] bg-[var(--surface)]'
      }`}
    >
      <PlayerToken player={player} isActive={isCurrent} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-black text-[var(--sea-ink)]">
          {getPlayerName(player)}
        </span>
        <span className="block truncate text-xs font-bold text-[var(--sea-ink-soft)]">
          {status}
        </span>
      </span>
      <span className="text-right">
        <span className="block text-xs font-black text-[var(--sea-ink)]">
          {bid === null ? 'No bid' : formatCash(bid)}
        </span>
        <span className="block text-[0.65rem] font-bold text-[var(--sea-ink-soft)]">
          {formatCash(player.cash)} cash
        </span>
      </span>
    </div>
  )
}

function getAuctionPlayers(auction: GameAuction, players: GamePlayer[]) {
  const participantIds = new Set([
    ...auction.activeRoomPlayerIds,
    ...auction.passedRoomPlayerIds,
    auction.currentBidderRoomPlayerId,
    auction.highestBidderRoomPlayerId,
  ])

  participantIds.delete(null)

  return players
    .filter((player) => participantIds.has(player.roomPlayerId))
    .sort((left, right) => left.seatNumber - right.seatNumber)
}

function getLatestBids(events: GameEventLogItem[], tileKey: string) {
  const latestBids = new Map<string, number>()

  for (const event of events) {
    if (event.type !== 'auction_bid_placed') continue
    if (event.payload.tileKey !== tileKey) continue

    const roomPlayerId = event.payload.roomPlayerId
    const amount = event.payload.amount

    if (
      typeof roomPlayerId === 'string' &&
      typeof amount === 'number' &&
      !latestBids.has(roomPlayerId)
    ) {
      latestBids.set(roomPlayerId, amount)
    }
  }

  return latestBids
}
