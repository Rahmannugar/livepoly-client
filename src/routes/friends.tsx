import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '#/components/auth/protected-route'
import { authenticatedRail } from '#/lib/auth/auth.rail'
import { FriendsPage } from '#/pages/friends/friends-page'

export const Route = createFileRoute('/friends')({
  component: FriendsRoute,
})

function FriendsRoute() {
  return (
    <ProtectedRoute rail={authenticatedRail}>
      <FriendsPage />
    </ProtectedRoute>
  )
}
