import { useQuery } from '@tanstack/react-query'
import { GAME_QUERY_KEYS } from './game.constants'
import { getGameResult } from './game.service'

export function useGameResult(gameId: string, enabled: boolean) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.result(gameId),
    queryFn: () => getGameResult(gameId),
    enabled,
    refetchInterval: (query) => (query.state.data === null ? 2_000 : false),
  })
}
