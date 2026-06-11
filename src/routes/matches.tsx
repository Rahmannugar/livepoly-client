import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '#/components/auth/protected-route'
import { authenticatedRail } from '#/lib/auth/auth.rail'
import { MatchesPage } from '#/pages/matches/matches-page'

export const Route = createFileRoute('/matches')({
  component: MatchesRoute,
})

function MatchesRoute() {
  return (
    <ProtectedRoute rail={authenticatedRail}>
      <MatchesPage />
    </ProtectedRoute>
  )
}
