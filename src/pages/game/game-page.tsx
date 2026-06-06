import {
  AirplaneTiltIcon,
  ArrowLeftIcon,
  BankIcon,
  BuildingsIcon,
  CarIcon,
  CurrencyDollarIcon,
  DiceFiveIcon,
  DropIcon,
  LightningIcon,
  ListChecksIcon,
  PoliceCarIcon,
  QuestionIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  SpinnerGapIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { APP_NAME } from '#/config/app.constants'
import { useGame } from '#/lib/game/useGame'
import type {
  GameEventLogItem,
  GamePlayer,
  GameProperty,
  GameState,
} from '#/lib/game/game.types'
import type { Icon } from '@phosphor-icons/react'
import type { CSSProperties, ReactNode } from 'react'

type GamePageProps = {
  gameId: string
}

type GameTile = {
  index: number
  key: string
  name: string
  shortName?: string
  kind: string
  setKey?: string
}

const gameTiles: GameTile[] = [
  { index: 0, key: 'go', name: 'Go', kind: 'go' },
  { index: 1, key: 'nigeria', name: 'Nigeria', kind: 'property', setKey: 'brown' },
  { index: 2, key: 'world_fund_1', name: 'World Fund', kind: 'world_fund' },
  { index: 3, key: 'ghana', name: 'Ghana', kind: 'property', setKey: 'brown' },
  { index: 4, key: 'income_tax', name: 'Income Tax', kind: 'tax' },
  { index: 5, key: 'lagos_airport', name: 'Lagos Airport', kind: 'airport' },
  { index: 6, key: 'south_africa', name: 'South Africa', shortName: 'S. Africa', kind: 'property', setKey: 'light_blue' },
  { index: 7, key: 'chance_1', name: 'Chance', kind: 'chance' },
  { index: 8, key: 'egypt', name: 'Egypt', kind: 'property', setKey: 'light_blue' },
  { index: 9, key: 'morocco', name: 'Morocco', kind: 'property', setKey: 'light_blue' },
  { index: 10, key: 'jail', name: 'Jail', kind: 'jail' },
  { index: 11, key: 'brazil', name: 'Brazil', kind: 'property', setKey: 'pink' },
  { index: 12, key: 'electric_company', name: 'Electric Company', kind: 'utility' },
  { index: 13, key: 'argentina', name: 'Argentina', kind: 'property', setKey: 'pink' },
  { index: 14, key: 'mexico', name: 'Mexico', kind: 'property', setKey: 'pink' },
  { index: 15, key: 'new_york_airport', name: 'New York Airport', kind: 'airport' },
  { index: 16, key: 'usa', name: 'USA', kind: 'property', setKey: 'orange' },
  { index: 17, key: 'world_fund_2', name: 'World Fund', kind: 'world_fund' },
  { index: 18, key: 'canada', name: 'Canada', kind: 'property', setKey: 'orange' },
  { index: 19, key: 'jamaica', name: 'Jamaica', kind: 'property', setKey: 'orange' },
  { index: 20, key: 'free_parking', name: 'Free Parking', kind: 'free_parking' },
  { index: 21, key: 'uk', name: 'United Kingdom', shortName: 'UK', kind: 'property', setKey: 'red' },
  { index: 22, key: 'chance_2', name: 'Chance', kind: 'chance' },
  { index: 23, key: 'france', name: 'France', kind: 'property', setKey: 'red' },
  { index: 24, key: 'spain', name: 'Spain', kind: 'property', setKey: 'red' },
  { index: 25, key: 'london_airport', name: 'London Airport', kind: 'airport' },
  { index: 26, key: 'germany', name: 'Germany', kind: 'property', setKey: 'yellow' },
  { index: 27, key: 'italy', name: 'Italy', kind: 'property', setKey: 'yellow' },
  { index: 28, key: 'water_works', name: 'Water Works', kind: 'utility' },
  { index: 29, key: 'netherlands', name: 'Netherlands', shortName: 'Netherl.', kind: 'property', setKey: 'yellow' },
  { index: 30, key: 'go_to_jail', name: 'Go To Jail', kind: 'go_to_jail' },
  { index: 31, key: 'india', name: 'India', kind: 'property', setKey: 'green' },
  { index: 32, key: 'china', name: 'China', kind: 'property', setKey: 'green' },
  { index: 33, key: 'world_fund_3', name: 'World Fund', kind: 'world_fund' },
  { index: 34, key: 'japan', name: 'Japan', kind: 'property', setKey: 'green' },
  { index: 35, key: 'tokyo_airport', name: 'Tokyo Airport', kind: 'airport' },
  { index: 36, key: 'chance_3', name: 'Chance', kind: 'chance' },
  { index: 37, key: 'south_korea', name: 'South Korea', shortName: 'Korea', kind: 'property', setKey: 'dark_blue' },
  { index: 38, key: 'luxury_tax', name: 'Luxury Tax', kind: 'tax' },
  { index: 39, key: 'australia', name: 'Australia', kind: 'property', setKey: 'dark_blue' },
]

const propertySetColors: Record<string, string> = {
  brown: '#8f5b38',
  light_blue: '#78c7df',
  pink: '#d05da8',
  orange: '#f39a3d',
  red: '#d94b4b',
  yellow: '#efcf4f',
  green: '#2d9b68',
  dark_blue: '#3154a3',
}

export function GamePage({ gameId }: GamePageProps) {
  const game = useGame(gameId)
  const state = game.state
  const currentTurnPlayer = state
    ? findPlayer(state.players, state.currentTurnRoomPlayerId)
    : null
  const ownedProperties = state
    ? state.properties.filter((property) => property.ownerRoomPlayerId)
    : []
  const recentEvents = game.events.slice(0, 5)
  const primaryAction = getPrimaryAction({
    access: game.access,
    isCurrentTurn: game.isCurrentTurn,
    phase: state?.phase,
  })
  const isRollingDice =
    game.commandPending && primaryAction.command === 'roll'

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

        <div className="grid flex-1 gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_17rem] 2xl:grid-cols-[16rem_minmax(58rem,1fr)_18rem]">
          <aside className="order-2 grid gap-3 md:grid-cols-2 xl:order-1 xl:grid-cols-1 xl:content-start">
            <GamePanel title="Players" icon={UsersIcon}>
              <div className="grid gap-2">
                {(state?.players ?? []).map((player) => (
                  <PlayerRow
                    key={player.roomPlayerId}
                    player={player}
                    isCurrentTurn={
                      state?.currentTurnRoomPlayerId === player.roomPlayerId
                    }
                    isYou={game.roomPlayerId === player.roomPlayerId}
                  />
                ))}

                {!state ? <LoadingBlock label="Joining game" /> : null}
              </div>
            </GamePanel>

            <GamePanel title="Game state" icon={ShieldCheckIcon}>
              <div className="grid grid-cols-2 gap-2 text-sm font-bold text-[var(--sea-ink-soft)]">
                <StatePill label="Turn" value={state ? String(state.turnNumber) : '...'} />
                <StatePill label="Mode" value={state?.mode ?? '...'} />
                <StatePill label="Phase" value={formatPhase(state?.phase)} />
                <StatePill
                  label="Online"
                  value={`${game.presence?.playersOnline ?? 0} players`}
                />
              </div>
            </GamePanel>
          </aside>

          <section className="order-1 rounded-[34px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_78%,transparent)] p-3 shadow-[0_28px_90px_rgba(4,12,15,0.18)] backdrop-blur-xl sm:p-5 xl:order-2">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="app-kicker">Game</p>
                <h1 className="display-title mt-2 text-4xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-5xl">
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

            <div className="mx-auto w-full overflow-x-auto pb-1">
              <div className="grid aspect-square w-full min-w-[34rem] grid-cols-11 grid-rows-11 gap-1 rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-2 sm:min-w-[42rem] sm:gap-1.5 sm:p-3 lg:min-w-0 2xl:gap-2 2xl:p-4">
                <div className="col-start-2 col-end-11 row-start-2 row-end-11 grid place-items-center rounded-[24px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_82%,transparent)] p-5 text-center">
                  <div>
                    <p className="app-kicker">Room {state?.roomCode ?? '...'}</p>
                    <DiceRollDisplay
                      dice={state?.lastDiceRoll}
                      isRolling={isRollingDice}
                    />
                    <p className="display-title mt-3 text-4xl font-semibold text-[var(--sea-ink)]">
                      {isRollingDice ? 'Rolling...' : formatDice(state?.lastDiceRoll)}
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                      {game.access === 'spectator'
                        ? 'Watching this game live.'
                        : game.isCurrentTurn
                          ? 'Your move.'
                          : 'Waiting for the next move.'}
                    </p>
                  </div>
                </div>

                {gameTiles.map((tile) => (
                  <GameTileCell
                    key={tile.key}
                    tile={tile}
                    players={getPlayersOnTile(state, tile.index)}
                    owner={getTileOwner(state, tile.key)}
                    currentTurnRoomPlayerId={state?.currentTurnRoomPlayerId ?? null}
                  />
                ))}
              </div>
            </div>
          </section>

          <aside className="order-3 grid gap-3 md:grid-cols-2 xl:order-3 xl:grid-cols-1 xl:content-start">
            <GamePanel title="Actions" icon={DiceFiveIcon}>
              <button
                type="button"
                disabled={!primaryAction.enabled || game.commandPending}
                className={`game-command-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
                  game.commandPending ? 'game-command-button--active' : ''
                }`}
                onClick={() => {
                  if (primaryAction.command === 'roll') {
                    void game.rollAndMove()
                    return
                  }

                  if (primaryAction.command === 'endTurn') {
                    void game.endTurn()
                  }
                }}
              >
                {game.commandPending ? (
                  <SpinnerGapIcon weight="bold" className="h-4 w-4 animate-spin" />
                ) : null}
                {game.commandPending ? 'Sending...' : primaryAction.label}
              </button>
              <div className="mt-3 grid gap-2 text-sm font-bold text-[var(--sea-ink-soft)]">
                <p>{primaryAction.copy}</p>
                {game.errorMessage ? (
                  <p className="text-red-500">{game.errorMessage}</p>
                ) : null}
              </div>
            </GamePanel>

            <GamePanel title="Properties" icon={BuildingsIcon}>
              <PropertyList
                properties={ownedProperties}
                players={state?.players ?? []}
              />
            </GamePanel>

            <GamePanel title="Events" icon={ListChecksIcon}>
              <EventList events={recentEvents} />
            </GamePanel>
          </aside>
        </div>
      </section>
    </main>
  )
}

function GamePanel({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof UsersIcon
  children: ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-4 shadow-[0_18px_55px_rgba(4,12,15,0.12)] backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--sea-ink)]">
          <Icon weight="bold" className="h-5 w-5" />
        </span>
        <h2 className="display-title text-2xl font-semibold text-[var(--sea-ink)]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function PlayerRow({
  player,
  isCurrentTurn,
  isYou,
}: {
  player: GamePlayer
  isCurrentTurn: boolean
  isYou: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <PlayerToken player={player} isActive={isCurrentTurn} />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[var(--sea-ink)]">
            {getPlayerName(player)}
            {isYou ? ' (you)' : ''}
          </p>
          <p className="mt-0.5 text-xs font-bold text-[var(--sea-ink-soft)]">
            {isCurrentTurn ? 'Taking turn' : `Tile ${player.position}`}
          </p>
        </div>
      </div>
      <span className="shrink-0 text-xs font-black text-[var(--sea-ink)]">
        ${formatMoney(player.cash)}
      </span>
    </div>
  )
}

function GameTileCell({
  tile,
  players,
  owner,
  currentTurnRoomPlayerId,
}: {
  tile: GameTile
  players: GamePlayer[]
  owner: GamePlayer | null
  currentTurnRoomPlayerId: string | null
}) {
  const TileIcon = getTileIcon(tile)

  return (
    <div
      className={`game-tile relative flex min-h-0 flex-col justify-between overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg-base)] p-1 text-[var(--sea-ink)] sm:rounded-xl sm:p-1.5 2xl:rounded-2xl 2xl:p-2 ${
        TileIcon ? 'game-tile--special' : ''
      }`}
      style={getTileGridStyle(tile.index)}
    >
      {tile.setKey ? (
        <span
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ backgroundColor: propertySetColors[tile.setKey] }}
        />
      ) : null}

      <div className="mt-1 flex min-h-0 flex-col gap-1">
        {TileIcon ? (
          <span className="game-tile__icon">
            <TileIcon weight="duotone" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        ) : null}
        <span className="line-clamp-3 text-[0.52rem] font-black leading-tight sm:text-[0.62rem] xl:text-[0.7rem] 2xl:text-[0.78rem]">
          {getTileLabel(tile)}
        </span>
      </div>

      <div className="flex min-h-5 flex-wrap items-end gap-1">
        {owner ? (
          <span className="rounded-full bg-[var(--surface)] px-1.5 py-0.5 text-[0.55rem] font-black">
            {owner.seatNumber}
          </span>
        ) : null}
        {players.map((player) => (
          <PlayerToken
            key={player.roomPlayerId}
            player={player}
            compact
            isActive={player.roomPlayerId === currentTurnRoomPlayerId}
          />
        ))}
      </div>
    </div>
  )
}

function DiceRollDisplay({
  dice,
  isRolling,
}: {
  dice?: readonly [number, number] | null
  isRolling: boolean
}) {
  const values = dice ?? ([1, 1] as const)

  return (
    <div
      className="dice-display"
      aria-live="polite"
      aria-label={
        isRolling
          ? 'Rolling dice'
          : dice
            ? `Dice rolled ${dice[0]} and ${dice[1]}`
            : 'Dice ready'
      }
    >
      <DieFace value={isRolling ? null : values[0]} isRolling={isRolling} />
      <DieFace value={isRolling ? null : values[1]} isRolling={isRolling} />
    </div>
  )
}

const diePipsByValue: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

function DieFace({
  value,
  isRolling,
}: {
  value: number | null
  isRolling: boolean
}) {
  const filledPips = value ? diePipsByValue[value] : []

  return (
    <span className={`dice-face ${isRolling ? 'dice-face--rolling' : ''}`}>
      {Array.from({ length: 9 }).map((_, index) => (
        <span
          key={index}
          className={`dice-pip ${
            filledPips.includes(index) ? 'dice-pip--filled' : ''
          }`}
        />
      ))}
    </span>
  )
}

function PlayerToken({
  player,
  compact = false,
  isActive = false,
}: {
  player: GamePlayer
  compact?: boolean
  isActive?: boolean
}) {
  return (
    <span
      className={`player-token ${isActive ? 'player-token--active' : ''} ${
        compact
          ? 'grid h-5 w-5 place-items-center rounded-full text-[0.62rem] font-black text-white shadow-sm'
          : 'grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black text-white shadow-sm'
      }`}
      style={{ backgroundColor: getPlayerColor(player.seatNumber) }}
    >
      {player.seatNumber}
    </span>
  )
}

function StatePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.14em]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black capitalize text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm font-bold text-[var(--sea-ink-soft)]">
      <SpinnerGapIcon weight="bold" className="h-5 w-5 animate-spin" />
      {label}
    </div>
  )
}

function PropertyList({
  properties,
  players,
}: {
  properties: GameProperty[]
  players: GamePlayer[]
}) {
  if (properties.length === 0) {
    return (
      <p className="text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
        No properties have been claimed yet.
      </p>
    )
  }

  return (
    <div className="grid max-h-52 gap-2 overflow-y-auto pr-1">
      {properties.slice(0, 8).map((property) => {
        const tile = gameTiles.find((item) => item.key === property.tileKey)
        const owner = findPlayer(players, property.ownerRoomPlayerId)

        return (
          <div
            key={property.tileKey}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[var(--sea-ink)]">
                {tile?.name ?? property.tileKey}
              </p>
              <p className="mt-0.5 text-xs font-bold text-[var(--sea-ink-soft)]">
                {owner ? getPlayerName(owner) : 'Unowned'}
              </p>
            </div>
            <span className="text-xs font-black text-[var(--sea-ink)]">
              {property.hasHotel ? 'Hotel' : `${property.houseCount} houses`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function EventList({ events }: { events: GameEventLogItem[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
        Game events will appear as players move.
      </p>
    )
  }

  return (
    <div className="grid max-h-52 gap-2 overflow-y-auto pr-1">
      {events.map((event, index) => (
        <div
          key={`${event.type}-${event.sequence ?? index}`}
          className="game-event-card rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"
        >
          <p className="text-sm font-black text-[var(--sea-ink)]">
            {formatEventType(event.type)}
          </p>
          <p className="mt-0.5 text-xs font-bold text-[var(--sea-ink-soft)]">
            {new Date(event.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      ))}
    </div>
  )
}

function getTileGridStyle(index: number): CSSProperties {
  if (index <= 10) {
    return { gridRow: 11, gridColumn: 11 - index }
  }

  if (index <= 20) {
    return { gridRow: 21 - index, gridColumn: 1 }
  }

  if (index <= 30) {
    return { gridRow: 1, gridColumn: index - 19 }
  }

  return { gridRow: index - 29, gridColumn: 11 }
}

function getTileLabel(tile: GameTile) {
  return tile.shortName ?? tile.name
}

function getTileIcon(tile: GameTile): Icon | null {
  if (tile.kind === 'airport') {
    return AirplaneTiltIcon
  }

  if (tile.kind === 'chance') {
    return QuestionIcon
  }

  if (tile.kind === 'world_fund') {
    return BankIcon
  }

  if (tile.kind === 'tax') {
    return ReceiptIcon
  }

  if (tile.kind === 'free_parking') {
    return CarIcon
  }

  if (tile.kind === 'go_to_jail') {
    return PoliceCarIcon
  }

  if (tile.kind === 'go') {
    return CurrencyDollarIcon
  }

  if (tile.key === 'water_works') {
    return DropIcon
  }

  if (tile.key === 'electric_company') {
    return LightningIcon
  }

  return null
}

function getPlayersOnTile(state: GameState | null, position: number) {
  return state?.players.filter((player) => player.position === position) ?? []
}

function getTileOwner(state: GameState | null, tileKey: string) {
  if (!state) {
    return null
  }

  const property = state.properties.find((item) => item.tileKey === tileKey)

  return findPlayer(state.players, property?.ownerRoomPlayerId)
}

function findPlayer(players: GamePlayer[], roomPlayerId?: string | null) {
  if (!roomPlayerId) {
    return null
  }

  return players.find((player) => player.roomPlayerId === roomPlayerId) ?? null
}

function getPlayerName(player: GamePlayer) {
  return player.username ?? player.botName ?? `Seat ${player.seatNumber}`
}

function getPlayerColor(seatNumber: number) {
  const colors = ['#0f766e', '#b45309', '#6d5bd0', '#be123c']
  return colors[(seatNumber - 1) % colors.length]
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatPhase(phase?: string) {
  return phase ? phase.replaceAll('_', ' ') : '...'
}

function formatEventType(type: string) {
  return type.replaceAll('_', ' ')
}

function formatDice(dice?: readonly [number, number] | null) {
  if (!dice) {
    return 'Dice ready'
  }

  return `${dice[0]} + ${dice[1]}`
}

function getPrimaryAction({
  access,
  isCurrentTurn,
  phase,
}: {
  access: string | null
  isCurrentTurn: boolean
  phase?: string
}) {
  if (access === 'spectator') {
    return {
      command: null,
      enabled: false,
      label: 'Watching game',
      copy: 'Spectators can watch the game but cannot make moves.',
    } as const
  }

  if (!isCurrentTurn) {
    return {
      command: null,
      enabled: false,
      label: 'Waiting',
      copy: 'Waiting for the active player.',
    } as const
  }

  if (phase === 'awaiting_roll') {
    return {
      command: 'roll',
      enabled: true,
      label: 'Roll dice',
      copy: 'Roll to move around the game.',
    } as const
  }

  if (phase === 'awaiting_turn_end') {
    return {
      command: 'endTurn',
      enabled: true,
      label: 'End turn',
      copy: 'Pass play to the next player.',
    } as const
  }

  if (phase === 'awaiting_property_decision') {
    return {
      command: null,
      enabled: false,
      label: 'Property decision',
      copy: 'Buying and auction choices come next.',
    } as const
  }

  return {
    command: null,
    enabled: false,
    label: 'No action',
    copy: 'No move is available right now.',
  } as const
}
