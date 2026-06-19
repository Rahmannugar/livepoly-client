import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '#/components/auth/protected-route'
import { authenticatedRail } from '#/lib/auth/auth.rail'
import { GamePage } from '#/pages/game/game-page'

export const Route = createFileRoute('/games/$gameId')({
  component: GameRoute,
})

function GameRoute() {
  const { gameId } = Route.useParams()

  return (
    <ProtectedRoute rail={authenticatedRail}>
      <GamePage gameId={gameId} />
    </ProtectedRoute>
  )
}
