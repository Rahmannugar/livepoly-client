export type Friendship = {
  id: string
  requesterId: string
  addresseeId: string
  status: 'pending' | 'accepted' | 'blocked'
  createdAt: string
  updatedAt: string
}

export type FriendSummary = {
  friendshipId: string
  userId: string
  email: string
  username: string
  avatarObjectKey: string | null
  createdAt: string
  updatedAt: string
}

export type FriendRequestSummary = {
  friendshipId: string
  requesterId: string
  addresseeId: string
  requesterUsername: string
  requesterAvatarObjectKey: string | null
  addresseeUsername: string
  addresseeAvatarObjectKey: string | null
  status: 'pending'
  createdAt: string
  updatedAt: string
}

export type FriendsListResponse = {
  items: FriendSummary[]
  nextCursor: string | null
}

export type FriendRequestListResponse = {
  items: FriendRequestSummary[]
  nextCursor: string | null
}

export type FriendRequestsResponse = {
  incoming: FriendRequestListResponse
  outgoing: FriendRequestListResponse
}
