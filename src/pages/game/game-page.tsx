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
import { MobilePropertyDecisionSheet } from '#/components/game/game-tile-info'
import { useGamePage } from '#/lib/game/useGamePage'

type GamePageProps = {
  gameId: string
}

export function GamePage({ gameId }: GamePageProps) {
  const model = useGamePage(gameId)
  const { game, state } = model

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
              onPlaceAuctionBid={() =>
                void game.placeAuctionBid(model.auctionBidAmount)
              }
              onPassAuctionBid={() => void game.passAuctionBid()}
              onPayDebt={() => void game.payDebt()}
              onPayJailFine={() => void game.payJailFine()}
              onDeclareBankruptcy={() => void game.declareBankruptcy()}
            />

            <BankerPanel
              phase={state?.phase}
              currentTurnPlayer={model.currentTurnPlayer}
              roomPlayerId={game.roomPlayerId}
              activeTile={model.activeTile}
              events={model.recentEvents}
              players={state?.players ?? []}
            />

            {model.gameClosed ? (
              <GameResultsPanel
                result={model.gameResult.data}
                isLoading={model.gameResult.isFetching}
                errorMessage={
                  model.gameResult.error instanceof Error
                    ? model.gameResult.error.message
                    : null
                }
              />
            ) : (
              <PropertiesPanel
                properties={model.ownedProperties}
                players={state?.players ?? []}
                roomPlayerId={game.roomPlayerId}
                commandPending={game.commandPending}
                onBuild={(tileKey) => void game.buildProperty(tileKey)}
                onSellBuilding={(tileKey) => void game.sellBuilding(tileKey)}
                onMortgage={(tileKey) => void game.mortgageProperty(tileKey)}
                onUnmortgage={(tileKey) => void game.unmortgageProperty(tileKey)}
              />
            )}

            <EventsPanel
              events={model.recentEvents}
              players={state?.players ?? []}
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
      </section>
    </main>
  )
}
