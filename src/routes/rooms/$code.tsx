import { createFileRoute } from '@tanstack/react-router'
import { RoomPage } from '#/pages/rooms/room-page'

export const Route = createFileRoute('/rooms/$code')({
  component: RoomRoute,
})

function RoomRoute() {
  const { code } = Route.useParams()

  return <RoomPage code={code} />
}
