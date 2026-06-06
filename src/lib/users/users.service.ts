import { apiClient } from '#/lib/client/apiClient'
import { USER_SEARCH_LIMIT } from './users.constants'
import type { SearchUsersInput, UserSearchResponse } from './users.types'

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
