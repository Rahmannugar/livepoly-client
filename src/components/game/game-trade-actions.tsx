import { useMemo, useState } from 'react'
import {
  findPlayer,
  formatCash,
  gameTiles,
  getPlayerName,
} from '#/lib/game/game-board'
import type {
  GamePlayer,
  GameProperty,
  GameTradeOffer,
} from '#/lib/game/game.types'

type ProposeTradeInput = {
  toRoomPlayerId: string
  offeredCash: number
  requestedCash: number
  offeredPropertyKeys: string[]
  requestedPropertyKeys: string[]
}

export function TradeOfferActions({
  tradeOffer,
  players,
  roomPlayerId,
  commandPending,
  onAccept,
  onReject,
  onCancel,
}: {
  tradeOffer: GameTradeOffer
  players: GamePlayer[]
  roomPlayerId: string | null
  commandPending: boolean
  onAccept: (tradeId: string) => void
  onReject: (tradeId: string) => void
  onCancel: (tradeId: string) => void
}) {
  const fromPlayer = findPlayer(players, tradeOffer.fromRoomPlayerId)
  const toPlayer = findPlayer(players, tradeOffer.toRoomPlayerId)
  const fromPlayerName = getTradePlayerName(fromPlayer)
  const toPlayerName = getTradePlayerName(toPlayer)
  const isTarget = roomPlayerId === tradeOffer.toRoomPlayerId
  const isSender = roomPlayerId === tradeOffer.fromRoomPlayerId

  return (
    <div className="grid gap-4">
      <div>
        <p className="app-kicker">Trade</p>
        <h3 className="display-title mt-1 text-3xl font-semibold text-[var(--sea-ink)]">
          {isTarget
            ? `${fromPlayerName} made an offer.`
            : isSender
              ? `Offer sent to ${toPlayerName}.`
              : `${fromPlayerName} offered ${toPlayerName} a trade.`}
        </h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <TradeSide
          label={`${fromPlayerName} gives`}
          cash={tradeOffer.offeredCash}
          tileKeys={tradeOffer.offeredPropertyKeys}
        />
        <TradeSide
          label={`${toPlayerName} gives`}
          cash={tradeOffer.requestedCash}
          tileKeys={tradeOffer.requestedPropertyKeys}
        />
      </div>

      <p className="text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
        Houses and hotels are sold before traded properties move. Mortgages
        stay with the property.
      </p>

      {isTarget ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={commandPending}
            className="game-command-button inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => onAccept(tradeOffer.id)}
          >
            Accept trade
          </button>
          <button
            type="button"
            disabled={commandPending}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => onReject(tradeOffer.id)}
          >
            Reject
          </button>
        </div>
      ) : isSender ? (
        <button
          type="button"
          disabled={commandPending}
          className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
          onClick={() => onCancel(tradeOffer.id)}
        >
          Cancel offer
        </button>
      ) : null}
    </div>
  )
}

export function TradeProposalForm({
  properties,
  players,
  roomPlayerId,
  commandPending,
  disabled,
  onProposeTrade,
}: {
  properties: GameProperty[]
  players: GamePlayer[]
  roomPlayerId: string | null
  commandPending: boolean
  disabled: boolean
  onProposeTrade: (input: ProposeTradeInput) => void
}) {
  const tradablePlayers = players.filter(
    (player) =>
      player.roomPlayerId !== roomPlayerId &&
      !player.bankrupt &&
      properties.some(
        (property) => property.ownerRoomPlayerId === player.roomPlayerId,
      ),
  )
  const ownProperties = properties.filter(
    (property) => property.ownerRoomPlayerId === roomPlayerId,
  )
  const [targetRoomPlayerId, setTargetRoomPlayerId] = useState(
    tradablePlayers[0]?.roomPlayerId ?? '',
  )
  const [offeredCash, setOfferedCash] = useState('')
  const [requestedCash, setRequestedCash] = useState('')
  const [offeredPropertyKeys, setOfferedPropertyKeys] = useState<string[]>([])
  const [requestedPropertyKeys, setRequestedPropertyKeys] = useState<string[]>(
    [],
  )
  const targetProperties = useMemo(
    () =>
      properties.filter(
        (property) => property.ownerRoomPlayerId === targetRoomPlayerId,
      ),
    [properties, targetRoomPlayerId],
  )
  const canSubmit =
    !disabled &&
    !commandPending &&
    targetRoomPlayerId &&
    (offeredPropertyKeys.length > 0 ||
      requestedPropertyKeys.length > 0 ||
      normalizeCash(offeredCash) > 0 ||
      normalizeCash(requestedCash) > 0)

  if (!roomPlayerId || ownProperties.length === 0 || tradablePlayers.length === 0) {
    return null
  }

  return (
    <form
      className="mt-4 grid gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"
      onSubmit={(event) => {
        event.preventDefault()

        if (!canSubmit) {
          return
        }

        onProposeTrade({
          toRoomPlayerId: targetRoomPlayerId,
          offeredCash: normalizeCash(offeredCash),
          requestedCash: normalizeCash(requestedCash),
          offeredPropertyKeys,
          requestedPropertyKeys,
        })
      }}
    >
      <div>
        <p className="app-kicker">Trade</p>
        <h3 className="display-title mt-1 text-2xl font-semibold text-[var(--sea-ink)]">
          Make an offer
        </h3>
      </div>

      <label className="grid gap-2 text-sm font-black text-[var(--sea-ink)]">
        Player
        <select
          value={targetRoomPlayerId}
          disabled={disabled || commandPending}
          className="h-12 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 text-sm font-bold outline-none transition focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-70"
          onChange={(event) => {
            setTargetRoomPlayerId(event.target.value)
            setRequestedPropertyKeys([])
          }}
        >
          {tradablePlayers.map((player) => (
            <option key={player.roomPlayerId} value={player.roomPlayerId}>
              {getPlayerName(player)}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <TradePropertyPicker
          title="You give"
          cashValue={offeredCash}
          properties={ownProperties}
          selectedPropertyKeys={offeredPropertyKeys}
          disabled={disabled || commandPending}
          onCashChange={setOfferedCash}
          onToggleProperty={(tileKey) =>
            setOfferedPropertyKeys((current) => toggleKey(current, tileKey))
          }
        />
        <TradePropertyPicker
          title="You want"
          cashValue={requestedCash}
          properties={targetProperties}
          selectedPropertyKeys={requestedPropertyKeys}
          disabled={disabled || commandPending}
          onCashChange={setRequestedCash}
          onToggleProperty={(tileKey) =>
            setRequestedPropertyKeys((current) => toggleKey(current, tileKey))
          }
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="game-command-button inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
      >
        Send offer
      </button>
    </form>
  )
}

function TradeSide({
  label,
  cash,
  tileKeys,
}: {
  label: string
  cash: number
  tileKeys: string[]
}) {
  const items = [
    cash > 0 ? formatCash(cash) : null,
    ...tileKeys.map((tileKey) => getTileName(tileKey)),
  ].filter(Boolean)

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
      <p className="app-kicker">{label}</p>
      {items.length ? (
        <ul className="mt-2 grid gap-1 text-sm font-black text-[var(--sea-ink)]">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm font-bold text-[var(--sea-ink-soft)]">
          Nothing
        </p>
      )}
    </div>
  )
}

function TradePropertyPicker({
  title,
  cashValue,
  properties,
  selectedPropertyKeys,
  disabled,
  onCashChange,
  onToggleProperty,
}: {
  title: string
  cashValue: string
  properties: GameProperty[]
  selectedPropertyKeys: string[]
  disabled: boolean
  onCashChange: (value: string) => void
  onToggleProperty: (tileKey: string) => void
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_72%,transparent)] p-3">
      <p className="text-sm font-black text-[var(--sea-ink)]">{title}</p>
      <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--sea-ink-soft)]">
        Cash
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={disabled}
          value={cashValue}
          onChange={(event) => onCashChange(event.target.value.replace(/\D/g, ''))}
          className="h-11 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-black text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="0"
        />
      </label>
      <div className="grid max-h-36 gap-2 overflow-y-auto pr-1">
        {properties.map((property) => {
          const checked = selectedPropertyKeys.includes(property.tileKey)

          return (
            <label
              key={property.tileKey}
              className="flex min-w-0 items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-black text-[var(--sea-ink)]"
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => onToggleProperty(property.tileKey)}
              />
              <span className="min-w-0 truncate">{getTileName(property.tileKey)}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function normalizeCash(value: string) {
  const amount = Number.parseInt(value, 10)

  return Number.isFinite(amount) && amount > 0 ? amount : 0
}

function toggleKey(keys: string[], key: string) {
  return keys.includes(key)
    ? keys.filter((item) => item !== key)
    : [...keys, key]
}

function getTileName(tileKey: string) {
  return gameTiles.find((tile) => tile.key === tileKey)?.name ?? tileKey
}

function getTradePlayerName(player: GamePlayer | null) {
  return player ? getPlayerName(player) : 'Unknown player'
}
