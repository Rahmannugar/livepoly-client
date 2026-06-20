import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '#/components/auth/protected-route'
import { authenticatedRail } from '#/lib/auth/auth.rail'
import { MatchDetailsPage } from '#/pages/matches/match-details-page'

export const Route = createFileRoute('/matches_/$gameId')({
  component: MatchDetailsRoute,
})

function MatchDetailsRoute() {
  const { gameId } = Route.useParams()

  return (
    <ProtectedRoute rail={authenticatedRail}>
      <MatchDetailsPage gameId={gameId} />
    </ProtectedRoute>
  )
}
