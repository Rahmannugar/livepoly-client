import { blockIf, createRail, requireAuth, requireRole } from 'authrail'
import type { AuthUser } from './auth.types'

export type AuthRailContext = {
  user: AuthUser | null
}

export const authenticatedRail = createRail<AuthRailContext>(
  'authenticated',
  [
    requireAuth('/auth/login'),
    blockIf((context) => context.user?.status === 'suspended'),
  ],
)

export const adminRail = createRail<AuthRailContext>('admin', [
  requireAuth('/auth/login'),
  requireRole('admin'),
  blockIf((context) => context.user?.status === 'suspended'),
])
