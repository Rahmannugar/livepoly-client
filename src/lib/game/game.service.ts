import { apiClient } from '#/lib/client/apiClient'
import type { GameResult } from './game.types'

export function getGameResult(gameId: string) {
  return apiClient<GameResult | null>(
    `/games/${encodeURIComponent(gameId)}/result`,
  )
}
