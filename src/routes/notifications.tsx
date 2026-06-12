import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '#/components/auth/protected-route'
import { authenticatedRail } from '#/lib/auth/auth.rail'
import { NotificationsPage } from '#/pages/notifications/notifications-page'

export const Route = createFileRoute('/notifications')({
  component: NotificationsRoute,
})

function NotificationsRoute() {
  return (
    <ProtectedRoute rail={authenticatedRail}>
      <NotificationsPage />
    </ProtectedRoute>
  )
}
