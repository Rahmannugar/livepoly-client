import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '#/components/auth/protected-route'
import { adminRail } from '#/lib/auth/auth.rail'
import { AdminUsersPage } from '#/pages/admin/admin-users-page'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersRoute,
})

function AdminUsersRoute() {
  return (
    <ProtectedRoute rail={adminRail}>
      <AdminUsersPage />
    </ProtectedRoute>
  )
}
