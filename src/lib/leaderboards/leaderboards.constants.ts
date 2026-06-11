export const LEADERBOARDS_QUERY_KEYS = {
  period: (period: LeaderboardPeriod) => ['leaderboards', period],
} as const

export type LeaderboardPeriod = 'weekly' | 'monthly'
