import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '#/components/auth/protected-route'
import { authenticatedRail } from '#/lib/auth/auth.rail'
import { StatsPage } from '#/pages/stats/stats-page'

export const Route = createFileRoute('/stats')({
  component: StatsRoute,
})

function StatsRoute() {
  return (
    <ProtectedRoute rail={authenticatedRail}>
      <StatsPage />
    </ProtectedRoute>
  )
}
