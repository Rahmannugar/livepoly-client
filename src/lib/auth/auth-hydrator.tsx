import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AUTH_QUERY_KEYS } from './auth.constants'
import * as authService from './auth.service'

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hasHydrated = useRef(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (hasHydrated.current) {
      return
    }

    hasHydrated.current = true

    async function hydrateAuth() {
      try {
        const session = await authService.refreshSession()
        queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, session.user)
      } catch {
        authService.clearAccessToken()
        queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.currentUser })
      } finally {
        queryClient.setQueryData(AUTH_QUERY_KEYS.hydration, true)
      }
    }

    void hydrateAuth()
  }, [queryClient])

  return children
}
