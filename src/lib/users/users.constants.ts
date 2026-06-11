export const USER_SEARCH_MIN_LENGTH = 2

export const USER_SEARCH_LIMIT = 50

export const USER_MATCHES_LIMIT = 50

export const USERS_QUERY_KEYS = {
  me: ['users', 'me'],
  search: (query: string) => ['users', 'search', query],
  profile: (username: string) => ['users', 'profile', username],
  matches: (username: string) => ['users', 'matches', username],
} as const
