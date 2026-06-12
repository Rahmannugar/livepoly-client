export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'room_invite'
  | 'game_started'
  | 'game_finished'
  | 'turn_reminder'
  | 'system'

export type NotificationData = {
  friendshipId?: string
  requesterId?: string
  requesterUsername?: string
  requesterAvatarUrl?: string | null
  friendId?: string
  friendUsername?: string
  friendAvatarUrl?: string | null
  roomId?: string
  roomCode?: string
  gameId?: string
  link?: string
}

export type NotificationItem = {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data: NotificationData | null
  read: boolean
  createdAt: string
  readAt: string | null
}

export type NotificationsPageResponse = {
  items: NotificationItem[]
  nextCursor: string | null
}
