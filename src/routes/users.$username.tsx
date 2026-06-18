import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '#/components/auth/protected-route'
import { authenticatedRail } from '#/lib/auth/auth.rail'
import { PublicUserProfilePage } from '#/pages/profile/public-user-profile-page'

export const Route = createFileRoute('/users/$username')({
  component: UserProfileRoute,
})

function UserProfileRoute() {
  const { username } = Route.useParams()

  return (
    <ProtectedRoute rail={authenticatedRail}>
      <PublicUserProfilePage username={username} />
    </ProtectedRoute>
  )
}
