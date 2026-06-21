import { useMutation } from '@tanstack/react-query'
import * as adminService from './admin.service'

export function useRestoreDeletedUser() {
  return useMutation({
    mutationFn: adminService.restoreDeletedUser,
  })
}
