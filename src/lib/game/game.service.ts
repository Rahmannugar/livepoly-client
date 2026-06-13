import { apiClient } from '#/lib/client/apiClient'
import type { ApiClientError } from '#/lib/client/client.types'
import type { GameResult } from './game.types'

export async function getGameResult(gameId: string) {
  try {
    return await apiClient<GameResult | null>(
      `/games/${encodeURIComponent(gameId)}/result`,
    )
  } catch (error) {
    if ((error as ApiClientError).statusCode === 404) {
      return null
    }

    throw error
  }
}
