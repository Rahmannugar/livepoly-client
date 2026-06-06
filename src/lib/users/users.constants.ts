export const USER_SEARCH_MIN_LENGTH = 2

export const USER_SEARCH_LIMIT = 50

export const USERS_QUERY_KEYS = {
  search: (query: string) => ['users', 'search', query],
} as const
