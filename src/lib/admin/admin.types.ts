import type { UserRole, UserStatus } from '#/lib/auth/auth.types'

export type AdminUserResponse = {
  user: {
    id: string
    email: string
    username: string
    role: UserRole
    status: UserStatus
  }
}
