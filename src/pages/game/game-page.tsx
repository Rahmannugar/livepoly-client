import {
  ArrowLeftIcon,
  BuildingsIcon,
  DiceFiveIcon,
  HourglassMediumIcon,
  ListChecksIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { APP_NAME } from '#/config/app.constants'
import type { ReactNode } from 'react'

type GamePageProps = {
  gameId: string
}

const boardTiles = [
  'Start',
  'Lekki',
  'Chance',
  'Abuja',
  'Tax',
  'Rail',
  'Ibadan',
  'Card',
  'Kano',
  'Jail',
  'Enugu',
  'Utility',
  'PH',
  'Chance',
  'Asaba',
  'Park',
]

const tablePlayers = [
  { name: 'You', status: 'Ready', money: '₦1,500' },
  { name: 'Nova', status: 'Thinking', money: '₦1,420' },
  { name: 'Midas', status: 'Waiting', money: '₦1,310' },
  { name: 'Echo', status: 'Waiting', money: '₦1,270' },
]

export function GamePage({ gameId }: GamePageProps) {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-7">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-7xl flex-col gap-5">
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
                Game {gameId.slice(0, 8)}
              </p>
            </div>
          </div>

          <ThemeToggle />
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)_20rem]">
          <aside className="grid gap-3 lg:content-start">
            <GamePanel title="Players" icon={UsersIcon}>
              <div className="grid gap-2">
                {tablePlayers.map((player) => (
                  <div
                    key={player.name}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[var(--sea-ink)]">
                        {player.name}
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-[var(--sea-ink-soft)]">
                        {player.status}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-black text-[var(--sea-ink)]">
                      {player.money}
                    </span>
                  </div>
                ))}
              </div>
            </GamePanel>

            <GamePanel title="Table state" icon={ShieldCheckIcon}>
              <div className="grid gap-2 text-sm font-bold text-[var(--sea-ink-soft)]">
                <p>Turn 1</p>
                <p>Classic board</p>
                <p>Waiting for synced state</p>
              </div>
            </GamePanel>
          </aside>

          <section className="rounded-[34px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_78%,transparent)] p-4 shadow-[0_28px_90px_rgba(4,12,15,0.18)] backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="app-kicker">Board</p>
                <h1 className="display-title mt-2 text-4xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-5xl">
                  The table is loading.
                </h1>
              </div>
              <span className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-xs font-black text-[var(--sea-ink)]">
                <HourglassMediumIcon weight="bold" className="h-4 w-4" />
                Syncing
              </span>
            </div>

            <div className="grid aspect-square max-h-[min(62vh,48rem)] w-full grid-cols-4 gap-2 rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:gap-3 sm:p-4">
              {boardTiles.map((tile, index) => (
                <div
                  key={`${tile}-${index}`}
                  className="grid min-h-0 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--bg-base)] p-2 text-center text-[clamp(0.64rem,2.5vw,0.95rem)] font-black text-[var(--sea-ink)]"
                >
                  {tile}
                </div>
              ))}
            </div>
          </section>

          <aside className="grid gap-3 lg:content-start">
            <GamePanel title="Actions" icon={DiceFiveIcon}>
              <button
                type="button"
                disabled
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] opacity-70 shadow-[0_14px_30px_rgba(23,58,64,0.18)] disabled:cursor-not-allowed"
              >
                Roll dice
              </button>
              <p className="mt-3 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                Gameplay controls will unlock when realtime state is connected.
              </p>
            </GamePanel>

            <GamePanel title="Properties" icon={BuildingsIcon}>
              <p className="text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                Owned streets, buildings, and rent details will appear here.
              </p>
            </GamePanel>

            <GamePanel title="Events" icon={ListChecksIcon}>
              <div className="grid gap-2 text-sm font-bold text-[var(--sea-ink-soft)]">
                <p>Connected to game shell.</p>
                <p>Waiting for recovered events.</p>
              </div>
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
