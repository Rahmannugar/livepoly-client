import { useQuery } from '@tanstack/react-query'
import {
  LEADERBOARDS_QUERY_KEYS,
  type LeaderboardPeriod,
} from './leaderboards.constants'
import * as leaderboardsService from './leaderboards.service'

export function useLeaderboard(period: LeaderboardPeriod) {
  return useQuery({
    queryKey: LEADERBOARDS_QUERY_KEYS.period(period),
    queryFn: () => leaderboardsService.getLeaderboard(period),
  })
}
