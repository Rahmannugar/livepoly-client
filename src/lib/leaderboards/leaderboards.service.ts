import { apiClient } from '#/lib/client/apiClient'
import type { LeaderboardPeriod } from './leaderboards.constants'
import type { LeaderboardResponse } from './leaderboards.types'

export function getLeaderboard(period: LeaderboardPeriod) {
  return apiClient<LeaderboardResponse>(`/leaderboards/${period}`)
}
