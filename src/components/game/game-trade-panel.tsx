import { HandshakeIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { findPlayer, getPlayerName } from '#/lib/game/game-board'
import type {
  GamePlayer,
  GameProperty,
  GameTradeOffer,
} from '#/lib/game/game.types'
import { GamePanel } from './game-primitives'
import { TradeOfferActions, TradeProposalForm } from './game-trade-actions'

type ProposeTradeInput = {
  toRoomPlayerId: string
  offeredCash: number
  requestedCash: number
  offeredPropertyKeys: string[]
  requestedPropertyKeys: string[]
}

export type TradeOutcomeFeedback = {
  kind: 'success' | 'info'
  message: string
}

export function TradePanel({
  properties,
  players,
  roomPlayerId,
  tradeOffer,
  canCreateTrade,
  commandPending,
  initialCounterTargetRoomPlayerId,
  outcomeFeedback,
  onProposeTrade,
  onAcceptTrade,
  onRejectTrade,
  onCancelTrade,
}: {
  properties: GameProperty[]
  players: GamePlayer[]
  roomPlayerId: string | null
  tradeOffer: GameTradeOffer | null | undefined
  canCreateTrade: boolean
  commandPending: boolean
  initialCounterTargetRoomPlayerId?: string | null
  outcomeFeedback?: TradeOutcomeFeedback | null
  onProposeTrade: (input: ProposeTradeInput) => void
  onAcceptTrade: (tradeId: string) => void
  onRejectTrade: (tradeId: string) => void
  onCancelTrade: (tradeId: string) => void
}) {
  const isInvolved = Boolean(
    tradeOffer &&
    roomPlayerId &&
    (tradeOffer.fromRoomPlayerId === roomPlayerId ||
      tradeOffer.toRoomPlayerId === roomPlayerId),
  )
  const [counterTargetRoomPlayerId, setCounterTargetRoomPlayerId] = useState<
    string | null
  >(initialCounterTargetRoomPlayerId ?? null)

  useEffect(() => {
    if (!initialCounterTargetRoomPlayerId) {
      return
    }

    setCounterTargetRoomPlayerId(initialCounterTargetRoomPlayerId)
  }, [initialCounterTargetRoomPlayerId])

  useEffect(() => {
    if (tradeOffer) {
      return
    }

    if (!counterTargetRoomPlayerId) {
      return
    }

    const targetStillActive = players.some(
      (player) =>
        player.roomPlayerId === counterTargetRoomPlayerId && !player.bankrupt,
    )

    if (!targetStillActive) {
      setCounterTargetRoomPlayerId(null)
    }
  }, [counterTargetRoomPlayerId, players, tradeOffer])

  return (
    <GamePanel title="Trade" icon={HandshakeIcon} collapsible={false}>
      {tradeOffer && isInvolved ? (
        <TradeOfferActions
          tradeOffer={tradeOffer}
          players={players}
          roomPlayerId={roomPlayerId}
          commandPending={commandPending}
          onAccept={onAcceptTrade}
          onReject={onRejectTrade}
          onCancel={onCancelTrade}
          onCounter={() => {
            setCounterTargetRoomPlayerId(tradeOffer.fromRoomPlayerId)
            onRejectTrade(tradeOffer.id)
          }}
        />
      ) : tradeOffer ? (
        <TradeInProgress tradeOffer={tradeOffer} players={players} />
      ) : (
        <TradeProposalForm
          properties={properties}
          players={players}
          roomPlayerId={roomPlayerId}
          commandPending={commandPending}
          disabled={!canCreateTrade}
          disabledReason={
            canCreateTrade
              ? undefined
              : 'Trades are paused while this action resolves.'
          }
          initialTargetRoomPlayerId={counterTargetRoomPlayerId}
          onProposeTrade={(input) => {
            setCounterTargetRoomPlayerId(null)
            onProposeTrade(input)
          }}
        />
      )}
      {outcomeFeedback ? (
        <div
          role="status"
          className={`mt-3 rounded-xl border px-4 py-3 text-sm font-black leading-5 sm:rounded-2xl ${
            outcomeFeedback.kind === 'success'
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200'
              : 'border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)]'
          }`}
        >
          {outcomeFeedback.message}
        </div>
      ) : null}
    </GamePanel>
  )
}

function TradeInProgress({
  tradeOffer,
  players,
}: {
  tradeOffer: GameTradeOffer
  players: GamePlayer[]
}) {
  const sender = findPlayer(players, tradeOffer.fromRoomPlayerId)
  const recipient = findPlayer(players, tradeOffer.toRoomPlayerId)

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 sm:rounded-2xl sm:p-4">
      <p className="app-kicker">Offer in progress</p>
      <p className="mt-2 text-sm font-black leading-6 text-[var(--sea-ink)]">
        {sender ? getPlayerName(sender) : 'A player'} sent an offer to{' '}
        {recipient ? getPlayerName(recipient) : 'another player'}.
      </p>
      <p className="mt-1 text-sm font-bold leading-5 text-[var(--sea-ink-soft)]">
        Waiting for a response.
      </p>
    </div>
  )
}
