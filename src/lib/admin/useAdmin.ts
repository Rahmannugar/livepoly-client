import { useMutation } from '@tanstack/react-query'
import * as adminService from './admin.service'

export function useUpdateUserStatus() {
  return useMutation({
    mutationFn: ({
      username,
      status,
    }: {
      username: string
      status: 'active' | 'suspended'
    }) => adminService.updateUserStatus(username, status),
  })
}

export function useRestoreDeletedUser() {
  return useMutation({
    mutationFn: adminService.restoreDeletedUser,
  })
}
