import { apiClient } from '#/lib/client/apiClient'
import { FRIENDS_LIMIT } from './friends.constants'
import type {
  FriendRequestsResponse,
  FriendsListResponse,
  Friendship,
} from './friends.types'

export function listFriends() {
  const params = new URLSearchParams({ limit: String(FRIENDS_LIMIT) })

  return apiClient<FriendsListResponse>(`/friends?${params.toString()}`)
}

export function listFriendRequests() {
  const params = new URLSearchParams({ limit: String(FRIENDS_LIMIT) })

  return apiClient<FriendRequestsResponse>(
    `/friends/requests?${params.toString()}`,
  )
}

export function sendFriendRequest(username: string) {
  return apiClient<Friendship>('/friends/requests', {
    method: 'POST',
    body: { username },
  })
}

export function acceptFriendRequest(friendshipId: string) {
  return apiClient<Friendship>(`/friends/requests/${friendshipId}/accept`, {
    method: 'POST',
  })
}

export function rejectFriendRequest(friendshipId: string) {
  return apiClient<void>(`/friends/requests/${friendshipId}/reject`, {
    method: 'POST',
  })
}

export function cancelFriendRequest(friendshipId: string) {
  return apiClient<void>(`/friends/requests/${friendshipId}/cancel`, {
    method: 'POST',
  })
}

export function removeFriend(friendshipId: string) {
  return apiClient<void>(`/friends/${friendshipId}`, {
    method: 'DELETE',
  })
}
