import { apiClient } from '#/lib/client/apiClient'
import type { AdminUserResponse } from './admin.types'

export function restoreDeletedUser(username: string) {
  return apiClient<AdminUserResponse>(
    `/admin/users/${encodeURIComponent(username)}/restore`,
    { method: 'PATCH' },
  )
}
