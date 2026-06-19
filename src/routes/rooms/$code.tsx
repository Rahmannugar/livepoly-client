import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '#/components/auth/protected-route'
import { authenticatedRail } from '#/lib/auth/auth.rail'
import { RoomPage } from '#/pages/rooms/room-page'

export const Route = createFileRoute('/rooms/$code')({
  component: RoomRoute,
})

function RoomRoute() {
  const { code } = Route.useParams()

  return (
    <ProtectedRoute rail={authenticatedRail}>
      <RoomPage code={code} />
    </ProtectedRoute>
  )
}
