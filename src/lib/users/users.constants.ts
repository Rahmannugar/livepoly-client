export const USER_SEARCH_MIN_LENGTH = 2

export const USER_SEARCH_LIMIT = 50

export const USER_MATCHES_LIMIT = 50

export const USER_AVATAR_MAX_BYTES = 10 * 1024 * 1024

export const USER_AVATAR_ALLOWED_TYPES = [
  'image/webp',
  'image/jpeg',
  'image/png',
] as const

export const USERS_QUERY_KEYS = {
  me: ['users', 'me'],
  search: (query: string) => ['users', 'search', query],
  matches: (username: string) => ['users', 'matches', username],
} as const
