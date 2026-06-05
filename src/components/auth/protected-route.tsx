import { useEffect, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Rail } from 'authrail'
import { useAuth } from '#/lib/auth/useAuth'
import type { AuthRailContext } from '#/lib/auth/auth.rail'

type ProtectedRouteProps = {
  rail: Rail<AuthRailContext>
  children: ReactNode
}

export function ProtectedRoute({ rail, children }: ProtectedRouteProps) {
  const auth = useAuth()
  const navigate = useNavigate()
  const isHydrated = auth.hydration.data
  const user = auth.currentUser.data ?? null

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    async function evaluateAccess() {
      const result = await rail.evaluate({ user })

      if (result.decision.type === 'redirect') {
        navigate({ to: result.decision.to })
        return
      }

      if (result.decision.type === 'deny') {
        navigate({ to: '/auth/login' })
      }
    }

    void evaluateAccess()
  }, [isHydrated, navigate, rail, user])

  if (!isHydrated) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <p className="display-title text-3xl font-semibold text-[var(--sea-ink)]">
          Setting the table...
        </p>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return children
}
