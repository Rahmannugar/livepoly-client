import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '#/components/auth/protected-route'
import { authenticatedRail } from '#/lib/auth/auth.rail'
import { LeaderboardPage } from '#/pages/leaderboard/leaderboard-page'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardRoute,
})

function LeaderboardRoute() {
  return (
    <ProtectedRoute rail={authenticatedRail}>
      <LeaderboardPage />
    </ProtectedRoute>
  )
}
