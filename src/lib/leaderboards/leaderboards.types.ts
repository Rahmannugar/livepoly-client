import type { LeaderboardPeriod } from './leaderboards.constants'

export type LeaderboardEntry = {
  rank: number
  userId: string
  username: string
  avatarUrl: string | null
  rating: number
  gamesPlayed: number
  wins: number
  averagePlacement: number
}

export type LeaderboardResponse = {
  period: LeaderboardPeriod
  periodStart: string
  periodEnd: string
  entries: LeaderboardEntry[]
}
