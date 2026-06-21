import { apiClient } from '#/lib/client/apiClient'
import type { AdminUserResponse } from './admin.types'

export function updateUserStatus(
  username: string,
  status: 'active' | 'suspended',
) {
  return apiClient<AdminUserResponse>(
    `/admin/users/${encodeURIComponent(username)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  )
}

export function restoreDeletedUser(username: string) {
  return apiClient<AdminUserResponse>(
    `/admin/users/${encodeURIComponent(username)}/restore`,
    { method: 'PATCH' },
  )
}
