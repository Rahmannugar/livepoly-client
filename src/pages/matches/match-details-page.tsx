import {
  ClockCounterClockwiseIcon,
  CrownIcon,
  GameControllerIcon,
  MedalIcon,
  TrophyIcon,
} from '@phosphor-icons/react'
import { useRouter } from '@tanstack/react-router'
import { AppPageHeader } from '#/components/common/app-page-header'
import { formatCash } from '#/lib/game/game-board'
import type { GameResult, GameResultPlayer } from '#/lib/game/game.types'
import { useGameResult } from '#/lib/game/useGameResult'

export function MatchDetailsPage({ gameId }: { gameId: string }) {
  const router = useRouter()
  const result = useGameResult(gameId, true)
  const match = result.data
  const winner = match?.players.find(
    (player) => player.roomPlayerId === match.winnerRoomPlayerId,
  )

  return (
    <main className="min-h-screen px-4 py-4 sm:px-8 sm:py-6">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-5xl content-start gap-4 sm:min-h-[calc(100vh-3rem)] sm:gap-7">
        <AppPageHeader />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker">Match details</p>
            <h1 className="display-title mt-1 truncate text-3xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
              {match ? `Room ${match.roomCode}` : 'Loading match.'}
            </h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)] sm:text-lg sm:leading-8">
              Final standings, money, duration, and result reason.
            </p>
          </div>

          <button
            type="button"
            className="app-link w-fit text-sm"
            onClick={() => {
              if (window.history.length > 1) {
                router.history.back()
                return
              }

              void router.navigate({ to: '/stats' })
            }}
          >
            Back
          </button>
        </div>

        {result.error ? (
          <section className="rounded-[22px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-4 shadow-[0_14px_34px_rgba(8,28,32,0.09)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
            <p className="text-base font-black text-red-500">
              Match result is unavailable.
            </p>
            <p className="mt-1 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
              The game may still be saving or the result could not be found.
            </p>
          </section>
        ) : match ? (
          <div className="grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
            <section className="rounded-[22px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--primary)_10%,var(--surface))] p-4 shadow-[0_14px_34px_rgba(8,28,32,0.09)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--sea-ink)]">
                <TrophyIcon weight="bold" className="h-5 w-5" />
              </span>
              <p className="app-kicker mt-5">Winner</p>
              <h2 className="display-title mt-1 text-3xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-5xl">
                {winner ? getPlayerName(winner) : 'No winner'}
              </h2>
              <p className="mt-2 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
                {formatEndReason(match.endReason)} ended this {match.mode} match.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <DetailStat
                  icon={ClockCounterClockwiseIcon}
                  label="Duration"
                  value={formatDuration(match.durationSeconds)}
                />
                <DetailStat
                  icon={GameControllerIcon}
                  label="Mode"
                  value={match.mode}
                />
                <DetailStat
                  icon={MedalIcon}
                  label="Players"
                  value={String(match.players.length)}
                />
                <DetailStat
                  icon={CrownIcon}
                  label="Ended"
                  value={formatCompletedAt(match.completedAt)}
                />
              </div>
            </section>

            <section className="rounded-[22px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-3 shadow-[0_14px_34px_rgba(8,28,32,0.09)] backdrop-blur-xl sm:rounded-[28px] sm:p-5">
              <div className="flex items-center gap-3 px-1 py-1">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--sea-ink)]">
                  <MedalIcon weight="bold" className="h-5 w-5" />
                </span>
                <div>
                  <p className="app-kicker">Final table</p>
                  <h2 className="text-xl font-black text-[var(--sea-ink)]">
                    Placements
                  </h2>
                </div>
              </div>

              <ol className="mt-3 grid gap-2.5">
                {match.players.map((player) => (
                  <li
                    key={player.roomPlayerId}
                    className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--accent)] text-sm font-black text-[var(--accent-ink)]">
                      {player.placement}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-[var(--sea-ink)]">
                        {getPlayerName(player)}
                      </p>
                      <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs font-bold text-[var(--sea-ink-soft)]">
                        <span>{player.playerType}</span>
                        <span>Seat {player.seatNumber}</span>
                        {player.bankruptAt ? <span>Bankrupt</span> : null}
                      </p>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-1 sm:min-w-48">
                      <MoneyValue
                        label="Net worth"
                        value={formatCash(player.finalNetWorth)}
                      />
                      <MoneyValue
                        label="Cash"
                        value={formatCash(player.finalCash)}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        ) : (
          <section className="rounded-[22px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-4 shadow-[0_14px_34px_rgba(8,28,32,0.09)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
            <p className="text-base font-black text-[var(--sea-ink)]">
              Loading match result.
            </p>
            <p className="mt-1 text-sm font-bold leading-6 text-[var(--sea-ink-soft)]">
              Fetching the saved final table.
            </p>
          </section>
        )}
      </section>
    </main>
  )
}

function DetailStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClockCounterClockwiseIcon
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-3">
      <Icon weight="bold" className="h-4.5 w-4.5 text-[var(--sea-ink-soft)]" />
      <p className="app-kicker mt-3">{label}</p>
      <p className="mt-1 truncate text-sm font-black capitalize text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}

function MoneyValue({ label, value }: { label: string; value: string }) {
  return (
    <span className="min-w-0 rounded-xl border border-[var(--line)] px-2.5 py-2">
      <span className="block truncate text-[0.6rem] font-black uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
        {label}
      </span>
      <span className="mt-0.5 block truncate text-sm font-black text-[var(--sea-ink)]">
        {value}
      </span>
    </span>
  )
}

function getPlayerName(player: GameResultPlayer) {
  return player.username ?? player.botName ?? `Seat ${player.seatNumber}`
}

function formatEndReason(reason: GameResult['endReason']) {
  const labels: Record<GameResult['endReason'], string> = {
    bankruptcy: 'Bankruptcy',
    time_elapsed: 'Time elapsed',
    abandoned: 'No players left',
    cancelled: 'Cancelled',
  }

  return labels[reason]
}

function formatDuration(seconds: number) {
  const totalMinutes = Math.max(1, Math.round(seconds / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes}m`
  }

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

function formatCompletedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
