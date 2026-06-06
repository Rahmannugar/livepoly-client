import { createFileRoute } from '@tanstack/react-router'
import { GamePage } from '#/pages/game/game-page'

export const Route = createFileRoute('/games/$gameId')({
  component: GameRoute,
})

function GameRoute() {
  const { gameId } = Route.useParams()

  return <GamePage gameId={gameId} />
}
