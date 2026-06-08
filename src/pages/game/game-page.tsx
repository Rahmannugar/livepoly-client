import { ArrowLeftIcon, SpinnerGapIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { GameActionsPanel, type PrimaryGameAction } from '#/components/game/game-actions-panel'
import { GameBoard } from '#/components/game/game-board'
import {
  EventsPanel,
  GameStatePanel,
  PlayersPanel,
  PropertiesPanel,
} from '#/components/game/game-panels'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { APP_NAME } from '#/config/app.constants'
import {
  findPlayer,
  gameTiles,
  getMinimumAuctionBid,
  getPlayerName,
} from '#/lib/game/game-board'
import {
  formatRemainingMatchTime,
  getRemainingMatchTimeMs,
} from '#/lib/game/game-time'
import { useGame } from '#/lib/game/useGame'

type GamePageProps = {
  gameId: string
}

export function GamePage({ gameId }: GamePageProps) {
  const game = useGame(gameId)
  const state = game.state
  const [auctionBidAmount, setAuctionBidAmount] = useState(10)
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now())
  const currentTurnPlayer = state
    ? findPlayer(state.players, state.currentTurnRoomPlayerId)
    : null
  const ownedProperties = state
    ? state.properties.filter((property) => property.ownerRoomPlayerId)
    : []
  const recentEvents = game.events.slice(0, 5)
  const pendingTile = state?.pendingTileKey
    ? gameTiles.find((tile) => tile.key === state.pendingTileKey)
    : null
  const auctionTile = state?.auction
    ? gameTiles.find((tile) => tile.key === state.auction?.tileKey)
    : null
  const primaryAction = getPrimaryAction({
    access: game.access,
    isCurrentTurn: game.isCurrentTurn,
    phase: state?.phase,
    status: game.status,
    hasState: Boolean(state),
    pendingTileName: pendingTile?.name,
  })
  const isRollingDice =
    game.commandPending && primaryAction.command === 'roll'
  const minimumAuctionBid = getMinimumAuctionBid(state?.auction)
  const remainingMatchTimeMs = getRemainingMatchTimeMs(
    state?.expiresAt,
    currentTimeMs,
  )
  const currentPlayerInJail = Boolean(game.currentPlayer?.inJail)

  useEffect(() => {
    if (state?.auction) {
      setAuctionBidAmount(getMinimumAuctionBid(state.auction))
    }
  }, [state?.auction?.currentBid, state?.auction?.tileKey])

  useEffect(() => {
    if (!state?.expiresAt || state.phase === 'finished') {
      return
    }

    setCurrentTimeMs(Date.now())

    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(Date.now())
    }, 1_000)

    return () => window.clearInterval(intervalId)
  }, [state?.expiresAt, state?.phase])

  return (
    <main className="min-h-screen px-4 py-5 sm:px-7">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[112rem] flex-col gap-5">
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              aria-label="Back home"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] transition hover:translate-y-[-1px]"
            >
              <ArrowLeftIcon weight="bold" className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <p className="display-title truncate text-3xl font-semibold leading-none text-[var(--sea-ink)] sm:text-4xl">
                {APP_NAME}
              </p>
              <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
                Game {state?.roomCode ?? gameId.slice(0, 8)}
              </p>
            </div>
          </div>

          <ThemeToggle />
        </header>

        <div className="mx-auto flex w-fit min-w-36 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-center shadow-[0_18px_45px_rgba(4,12,15,0.14)]">
          <span className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
            Time
          </span>
          <span className="ml-3 text-lg font-black text-[var(--sea-ink)]">
            {formatRemainingMatchTime(remainingMatchTimeMs)}
          </span>
        </div>

        <div className="grid flex-1 gap-4 xl:grid-cols-[17rem_minmax(0,1fr)_17rem] 2xl:grid-cols-[19rem_minmax(58rem,1fr)_18rem]">
          <aside className="order-2 grid gap-3 md:grid-cols-2 xl:order-1 xl:grid-cols-1 xl:content-start">
            <PlayersPanel state={state} roomPlayerId={game.roomPlayerId} />
            <GameStatePanel
              state={state}
              playersOnline={game.presence?.playersOnline ?? 0}
            />
          </aside>

          <section className="order-1 rounded-[34px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_78%,transparent)] p-3 shadow-[0_28px_90px_rgba(4,12,15,0.18)] backdrop-blur-xl sm:p-5 xl:order-2">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="display-title text-4xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-5xl">
                  {currentTurnPlayer
                    ? `${getPlayerName(currentTurnPlayer)} is up.`
                    : 'Opening the game.'}
                </h1>
              </div>
              <span className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-xs font-black capitalize text-[var(--sea-ink)]">
                {game.status === 'connecting' ? (
                  <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
                ) : null}
                {game.status}
              </span>
            </div>

            <GameBoard
              state={state}
              access={game.access}
              isCurrentTurn={game.isCurrentTurn}
              isRollingDice={isRollingDice}
            />
          </section>

          <aside className="order-3 grid gap-3 md:grid-cols-2 xl:order-3 xl:grid-cols-1 xl:content-start">
            <GameActionsPanel
              primaryAction={primaryAction}
              commandPending={game.commandPending}
              errorMessage={game.errorMessage}
              debt={
                state?.phase === 'awaiting_debt_resolution'
                  ? state.debt
                  : null
              }
              auction={
                state?.phase === 'awaiting_auction_bid'
                  ? state.auction
                  : null
              }
              players={state?.players ?? []}
              roomPlayerId={game.roomPlayerId}
              currentPlayer={game.currentPlayer}
              currentPlayerInJail={currentPlayerInJail}
              isCurrentTurn={game.isCurrentTurn}
              auctionTileName={auctionTile?.name ?? null}
              auctionBidAmount={auctionBidAmount}
              minimumAuctionBid={minimumAuctionBid}
              onAuctionBidAmountChange={setAuctionBidAmount}
              onRollAndMove={() => void game.rollAndMove()}
              onEndTurn={() => void game.endTurn()}
              onBuyProperty={() => void game.buyProperty()}
              onDeclinePropertyPurchase={() =>
                void game.declinePropertyPurchase()
              }
              onPlaceAuctionBid={() => void game.placeAuctionBid(auctionBidAmount)}
              onPassAuctionBid={() => void game.passAuctionBid()}
              onPayDebt={() => void game.payDebt()}
              onPayJailFine={() => void game.payJailFine()}
              onDeclareBankruptcy={() => void game.declareBankruptcy()}
            />

            <PropertiesPanel
              properties={ownedProperties}
              players={state?.players ?? []}
              roomPlayerId={game.roomPlayerId}
              commandPending={game.commandPending}
              onBuild={(tileKey) => void game.buildProperty(tileKey)}
              onSellBuilding={(tileKey) => void game.sellBuilding(tileKey)}
              onMortgage={(tileKey) => void game.mortgageProperty(tileKey)}
              onUnmortgage={(tileKey) => void game.unmortgageProperty(tileKey)}
            />

            <EventsPanel events={recentEvents} players={state?.players ?? []} />
          </aside>
        </div>
      </section>
    </main>
  )
}

function getPrimaryAction({
  access,
  isCurrentTurn,
  phase,
  status,
  hasState,
  pendingTileName,
}: {
  access: string | null
  isCurrentTurn: boolean
  phase?: string
  status: string
  hasState: boolean
  pendingTileName?: string
}): PrimaryGameAction {
  if (!hasState && (status === 'connecting' || status === 'connected')) {
    return {
      command: null,
      enabled: false,
      label: 'Joining game',
      copy: 'Opening the live game connection.',
    }
  }

  if (status === 'disconnected') {
    return {
      command: null,
      enabled: false,
      label: 'Reconnecting',
      copy: 'Trying to restore the live game connection.',
    }
  }

  if (!hasState && status === 'error') {
    return {
      command: null,
      enabled: false,
      label: 'Unavailable',
      copy: 'This game could not be opened right now.',
    }
  }

  if (access === 'spectator') {
    return {
      command: null,
      enabled: false,
      label: 'Watching game',
      copy: 'Spectators can watch the game but cannot make moves.',
    }
  }

  if (!isCurrentTurn) {
    return {
      command: null,
      enabled: false,
      label: 'Waiting',
      copy: 'Waiting for the active player.',
    }
  }

  if (phase === 'awaiting_first_turn' || phase === 'awaiting_roll') {
    return {
      command: 'roll',
      enabled: true,
      label: 'Roll dice',
      copy: 'Roll to move and resolve the tile you land on.',
    }
  }

  if (phase === 'awaiting_turn_end') {
    return {
      command: 'endTurn',
      enabled: true,
      label: 'End turn',
      copy: 'Your move is settled. Pass play to the next player.',
    }
  }

  if (phase === 'awaiting_property_decision') {
    return {
      command: 'propertyDecision',
      enabled: true,
      label: 'Property decision',
      copy: pendingTileName
        ? `Choose whether to buy ${pendingTileName} or send it to auction.`
        : 'Choose whether to buy this property or send it to auction.',
    }
  }

  return {
    command: null,
    enabled: false,
    label: 'No action',
    copy: 'The game is resolving the current move.',
  }
}
