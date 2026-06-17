import { BankIcon } from '@phosphor-icons/react'
import {
  formatEventSummary,
  getPlayerName,
  type GameTile,
} from '#/lib/game/game-board'
import type {
  GameEventLogItem,
  GamePhase,
  GamePlayer,
} from '#/lib/game/game.types'
import { GamePanel } from './game-primitives'

export function BankerPanel({
  phase,
  currentTurnPlayer,
  roomPlayerId,
  activeTile,
  events,
  players,
}: {
  phase: GamePhase | undefined
  currentTurnPlayer: GamePlayer | null
  roomPlayerId: string | null
  activeTile: GameTile | null
  events: GameEventLogItem[]
  players: GamePlayer[]
}) {
  const latestEvent = events[0] ?? null

  return (
    <GamePanel title="Banker" icon={BankIcon} collapsible={false}>
      <div className="grid gap-3">
        <div className="rounded-2xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--primary)_10%,var(--surface))] p-4">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
            Table call
          </p>
          <p className="mt-2 text-sm font-black leading-6 text-[var(--sea-ink)]">
            {getBankerCall({
              phase,
              currentTurnPlayer,
              roomPlayerId,
              activeTile,
            })}
          </p>
        </div>

        {latestEvent ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
              Latest move
            </p>
            <p className="mt-2 text-sm font-black leading-6 text-[var(--sea-ink)]">
              {formatEventSummary(latestEvent, players)}
            </p>
          </div>
        ) : (
          <p className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
            The banker will call out rolls, payments, purchases, auctions, and
            turn changes as the game moves.
          </p>
        )}
      </div>
    </GamePanel>
  )
}

function getBankerCall({
  phase,
  currentTurnPlayer,
  roomPlayerId,
  activeTile,
}: {
  phase: GamePhase | undefined
  currentTurnPlayer: GamePlayer | null
  roomPlayerId: string | null
  activeTile: GameTile | null
}) {
  if (phase === 'finished') {
    return 'Game over. Results are being counted.'
  }

  if (phase === 'cancelled') {
    return 'This game has been cancelled.'
  }

  if (!currentTurnPlayer) {
    return 'The table is being prepared.'
  }

  const playerName = getPlayerName(currentTurnPlayer)
  const isYou = currentTurnPlayer.roomPlayerId === roomPlayerId
  const actor = isYou ? 'You' : playerName
  const tileName = activeTile?.name

  if (phase === 'awaiting_first_turn' || phase === 'awaiting_roll') {
    return isYou
      ? 'Your dice are ready. Roll to move.'
      : `${actor} ${currentTurnPlayer.playerType === 'bot' ? 'is calculating a roll.' : 'is up to roll.'}`
  }

  if (phase === 'awaiting_property_decision') {
    return tileName
      ? `${actor} must decide whether to buy ${tileName} or send it to auction.`
      : `${actor} must decide whether to buy the property or send it to auction.`
  }

  if (phase === 'awaiting_auction_bid') {
    return tileName
      ? `${tileName} is in auction. Bidders can raise or pass.`
      : 'An auction is live. Bidders can raise or pass.'
  }

  if (phase === 'awaiting_debt_resolution') {
    return `${actor} must settle a payment before play continues.`
  }

  if (phase === 'awaiting_turn_end') {
    return isYou
      ? 'Your move has settled. End the turn when ready.'
      : `${actor} needs to end the turn.`
  }

  return 'The table is between moves.'
}
