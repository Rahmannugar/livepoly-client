import { useQuery } from '@tanstack/react-query'
import {
  USER_SEARCH_LIMIT,
  USER_SEARCH_MIN_LENGTH,
  USERS_QUERY_KEYS,
} from './users.constants'
import * as usersService from './users.service'

export function useUserSearch(query: string, enabled = true) {
  const normalizedQuery = query.trim().toLowerCase()

  return useQuery({
    queryKey: USERS_QUERY_KEYS.search(normalizedQuery),
    queryFn: () =>
      usersService.searchUsers({
        query: normalizedQuery,
        limit: USER_SEARCH_LIMIT,
      }),
    enabled: enabled && normalizedQuery.length >= USER_SEARCH_MIN_LENGTH,
  })
}
