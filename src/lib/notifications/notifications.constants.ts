export const NOTIFICATIONS_LIMIT = 50

export const NOTIFICATIONS_REFETCH_INTERVAL_MS = 30_000

export const NOTIFICATIONS_STREAM_RECONNECT_DELAYS_MS = [
  1_000, 2_000, 5_000, 10_000,
] as const

export const NOTIFICATIONS_QUERY_KEYS = {
  list: ['notifications', 'list'] as const,
}
