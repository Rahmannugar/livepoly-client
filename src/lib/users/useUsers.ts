import { useQuery } from '@tanstack/react-query'
import {
  USER_MATCHES_LIMIT,
  USER_SEARCH_LIMIT,
  USER_SEARCH_MIN_LENGTH,
  USERS_QUERY_KEYS,
} from './users.constants'
import * as usersService from './users.service'

export function useCurrentUserProfile(enabled = true) {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.me,
    queryFn: usersService.getCurrentUserProfile,
    enabled,
  })
}

export function useUserProfile(username: string | null | undefined) {
  const normalizedUsername = username?.trim().toLowerCase() ?? ''

  return useQuery({
    queryKey: USERS_QUERY_KEYS.profile(normalizedUsername),
    queryFn: () => usersService.getUserProfile(normalizedUsername),
    enabled: normalizedUsername.length > 0,
  })
}

export function useUserMatches(username: string | null | undefined) {
  const normalizedUsername = username?.trim().toLowerCase() ?? ''

  return useQuery({
    queryKey: [...USERS_QUERY_KEYS.matches(normalizedUsername), USER_MATCHES_LIMIT],
    queryFn: () => usersService.getUserMatches(normalizedUsername),
    enabled: normalizedUsername.length > 0,
  })
}

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
