import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '#/components/auth/protected-route'
import { authenticatedRail } from '#/lib/auth/auth.rail'
import { ProfilePage } from '#/pages/profile/profile-page'

export const Route = createFileRoute('/profile')({
  component: ProfileRoute,
})

function ProfileRoute() {
  return (
    <ProtectedRoute rail={authenticatedRail}>
      <ProfilePage />
    </ProtectedRoute>
  )
}
