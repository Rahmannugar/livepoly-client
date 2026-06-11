import { apiClient } from '#/lib/client/apiClient'
import { USER_MATCHES_LIMIT, USER_SEARCH_LIMIT } from './users.constants'
import type {
  SearchUsersInput,
  UserMatchHistoryResponse,
  UserProfile,
  UserSearchResponse,
} from './users.types'

export function getCurrentUserProfile() {
  return apiClient<UserProfile>('/users/me')
}

export function getUserProfile(username: string) {
  return apiClient<UserProfile>(`/users/${encodeURIComponent(username)}`)
}

export function searchUsers(input: SearchUsersInput) {
  const params = new URLSearchParams({
    query: input.query,
    limit: String(input.limit ?? USER_SEARCH_LIMIT),
  })

  if (input.cursor) {
    params.set('cursor', input.cursor)
  }

  return apiClient<UserSearchResponse>(`/users/search?${params.toString()}`)
}

export function getUserMatches(username: string) {
  const params = new URLSearchParams({
    limit: String(USER_MATCHES_LIMIT),
  })

  return apiClient<UserMatchHistoryResponse>(
    `/users/${encodeURIComponent(username)}/matches?${params.toString()}`,
  )
}
