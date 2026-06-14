import {
  BankIcon,
  BuildingsIcon,
  ListChecksIcon,
  TrophyIcon,
  XIcon,
  type Icon,
} from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import '#/components/game/game.css'
import { GameActionsPanel } from '#/components/game/game-actions-panel'
import { GameCardReveal } from '#/components/game/game-card-reveal'
import { GameResultsPanel } from '#/components/game/game-results-panel'
import { BankerPanel } from '#/components/game/game-banker-panel'
import { EventsPanel } from '#/components/game/game-events-panel'
import { GameMatchTimer } from '#/components/game/game-match-timer'
import { GamePageHeader } from '#/components/game/game-page-header'
import { PlayersPanel } from '#/components/game/game-players-panel'
import { PropertiesPanel } from '#/components/game/game-properties-panel'
import { GameStatePanel } from '#/components/game/game-state-panel'
import { GameStage } from '#/components/game/game-stage'
import {
  MobilePropertyDecisionSheet,
  TileInfoSheet,
} from '#/components/game/game-tile-info'
import { useGamePage } from '#/lib/game/useGamePage'

type GamePageProps = {
  gameId: string
}

export function GamePage({ gameId }: GamePageProps) {
  const model = useGamePage(gameId)
  const { game, state } = model
  const [activeSidePanel, setActiveSidePanel] = useState<
    'banker' | 'properties' | 'events' | 'results' | null
  >(null)
  const hasResultsPanel = model.shouldLoadGameResult

  return (
    <main className="min-h-screen px-4 py-5 sm:px-7">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[112rem] flex-col gap-5">
        <GamePageHeader roomCode={state?.roomCode} gameId={gameId} />
        <GameMatchTimer remainingMatchTimeMs={model.remainingMatchTimeMs} />

        <div className="grid flex-1 gap-4 xl:grid-cols-[17rem_minmax(0,1fr)_17rem] 2xl:grid-cols-[19rem_minmax(58rem,1fr)_18rem]">
          <aside className="order-2 grid gap-3 md:grid-cols-2 xl:order-1 xl:grid-cols-1 xl:content-start">
            <PlayersPanel state={state} roomPlayerId={game.roomPlayerId} />
            <GameStatePanel
              state={state}
              playersOnline={game.presence?.playersOnline ?? 0}
            />
          </aside>

          <GameStage
            state={state}
            access={game.access}
            status={game.status}
            currentTurnPlayer={model.currentTurnPlayer}
            activeTile={model.activeTile}
            turnConsequence={model.turnConsequence}
            isCurrentTurn={model.isUserTurn}
            isRollingDice={model.isRollingDice}
            remainingTurnTimeMs={model.remainingTurnTimeMs}
            onSelectTile={(tile) => model.selectTile(tile.key)}
          />

          <aside className="order-3 grid gap-3 md:grid-cols-2 xl:order-3 xl:grid-cols-1 xl:content-start">
            <GameActionsPanel
              primaryAction={model.primaryAction}
              commandPending={game.commandPending}
              gameExpired={model.gameExpired}
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
              currentPlayerInJail={model.currentPlayerInJail}
              isCurrentTurn={model.isUserTurn}
              phase={state?.phase}
              auctionTileName={model.auctionTile?.name ?? null}
              pendingTile={model.pendingTile ?? null}
              pendingProperty={model.pendingProperty}
              activeTile={model.activeTile}
              activeProperty={model.activeProperty}
              activeOwner={model.activeOwner}
              activeTileLabel={model.activeTileLabel}
              auctionBidAmount={model.auctionBidAmount}
              minimumAuctionBid={model.minimumAuctionBid}
              onAuctionBidAmountChange={model.setAuctionBidAmount}
              onRollAndMove={() => void game.rollAndMove()}
              onEndTurn={() => void game.endTurn()}
              onBuyProperty={() => void game.buyProperty()}
              onDeclinePropertyPurchase={() =>
                void game.declinePropertyPurchase()
              }
              onPlaceAuctionBid={(amount) => void game.placeAuctionBid(amount)}
              onPassAuctionBid={() => void game.passAuctionBid()}
              onPayDebt={() => void game.payDebt()}
              onPayJailFine={() => void game.payJailFine()}
              onDeclareBankruptcy={() => void game.declareBankruptcy()}
            />

            <GameSidePanelLauncher
              icon={BankIcon}
              title="Banker"
              copy="Table calls and latest move."
              onClick={() => setActiveSidePanel('banker')}
            />
            {hasResultsPanel ? (
              <GameSidePanelLauncher
                icon={TrophyIcon}
                title="Results"
                copy="Final places and net worth."
                onClick={() => setActiveSidePanel('results')}
              />
            ) : (
              <GameSidePanelLauncher
                icon={BuildingsIcon}
                title="Properties"
                copy="Owned squares and turn-only management."
                onClick={() => setActiveSidePanel('properties')}
              />
            )}
            <GameSidePanelLauncher
              icon={ListChecksIcon}
              title="Events"
              copy="Recent rolls, bids, payments, and moves."
              onClick={() => setActiveSidePanel('events')}
            />
          </aside>
        </div>
        <MobilePropertyDecisionSheet
          open={model.showMobilePropertyDecision}
          tile={model.pendingTile ?? null}
          property={model.pendingProperty}
          commandPending={game.commandPending}
          onBuyProperty={() => void game.buyProperty()}
          onDeclinePropertyPurchase={() =>
            void game.declinePropertyPurchase()
          }
        />
        <GameCardReveal
          card={model.visibleCardReveal}
          onClose={model.dismissVisibleCardReveal}
        />
        <TileInfoSheet
          open={Boolean(model.selectedTile)}
          tile={model.selectedTile}
          property={model.selectedTileProperty}
          owner={model.selectedTileOwner}
          onClose={model.clearSelectedTile}
        />
        <GameSidePanelDialog
          title={getSidePanelTitle(activeSidePanel)}
          open={Boolean(activeSidePanel)}
          onClose={() => setActiveSidePanel(null)}
        >
          {activeSidePanel === 'banker' ? (
            <BankerPanel
              phase={state?.phase}
              currentTurnPlayer={model.currentTurnPlayer}
              roomPlayerId={game.roomPlayerId}
              activeTile={model.activeTile}
              events={model.recentEvents}
              players={state?.players ?? []}
            />
          ) : activeSidePanel === 'results' ? (
            <GameResultsPanel
              result={model.gameResult.data}
              isLoading={model.gameResult.isFetching}
              errorMessage={
                model.gameResult.error instanceof Error
                  ? model.gameResult.error.message
                  : null
              }
            />
          ) : activeSidePanel === 'properties' ? (
            <PropertiesPanel
              properties={model.ownedProperties}
              players={state?.players ?? []}
              roomPlayerId={game.roomPlayerId}
              canManageProperties={model.canManageProperties}
              commandPending={game.commandPending}
              onBuild={(tileKey) => void game.buildProperty(tileKey)}
              onSellBuilding={(tileKey) => void game.sellBuilding(tileKey)}
              onMortgage={(tileKey) => void game.mortgageProperty(tileKey)}
              onUnmortgage={(tileKey) => void game.unmortgageProperty(tileKey)}
            />
          ) : activeSidePanel === 'events' ? (
            <EventsPanel
              events={model.recentEvents}
              players={state?.players ?? []}
            />
          ) : null}
        </GameSidePanelDialog>
      </section>
    </main>
  )
}

function GameSidePanelLauncher({
  icon: IconComponent,
  title,
  copy,
  onClick,
}: {
  icon: Icon
  title: string
  copy: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="group flex min-w-0 items-center gap-3 rounded-[26px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_76%,transparent)] p-4 text-left shadow-[0_18px_55px_rgba(4,12,15,0.12)] backdrop-blur-xl transition hover:translate-y-[-1px] focus-visible:border-[var(--primary)]"
      onClick={onClick}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--sea-ink)]">
        <IconComponent weight="bold" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="display-title block truncate text-2xl font-semibold text-[var(--sea-ink)]">
          View {title.toLowerCase()}
        </span>
        <span className="mt-1 block line-clamp-2 text-sm font-bold leading-5 text-[var(--sea-ink-soft)]">
          {copy}
        </span>
      </span>
    </button>
  )
}

function GameSidePanelDialog({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  if (!open) {
    return null
  }

  return (
    <div aria-live="polite">
      <button
        type="button"
        aria-label={`Close ${title}`}
        className="game-decision-backdrop fixed inset-0 z-40 bg-[rgba(4,12,15,0.46)] backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="game-decision-sheet fixed inset-x-3 bottom-3 z-50 mx-auto grid max-h-[min(84vh,46rem)] w-auto max-w-2xl gap-4 overflow-y-auto rounded-[28px] border border-[var(--line)] bg-[var(--bg-base)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_28px_90px_rgba(4,12,15,0.34)] md:inset-x-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="app-kicker">Game view</p>
            <h3 className="display-title mt-1 truncate text-3xl font-semibold text-[var(--sea-ink)]">
              {title}
            </h3>
          </div>
          <button
            type="button"
            aria-label={`Close ${title}`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] transition hover:translate-y-[-1px]"
            onClick={onClose}
          >
            <XIcon weight="bold" className="h-4 w-4" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

function getSidePanelTitle(
  panel: 'banker' | 'properties' | 'events' | 'results' | null,
) {
  if (panel === 'banker') return 'Banker'
  if (panel === 'properties') return 'Properties'
  if (panel === 'events') return 'Events'
  if (panel === 'results') return 'Results'

  return 'Game view'
}
