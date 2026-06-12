import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  NOTIFICATIONS_QUERY_KEYS,
  NOTIFICATIONS_REFETCH_INTERVAL_MS,
} from './notifications.constants'
import * as notificationsService from './notifications.service'

export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEYS.list,
    queryFn: notificationsService.listNotifications,
    refetchInterval: NOTIFICATIONS_REFETCH_INTERVAL_MS,
  })
}

export function useUnreadNotificationCount() {
  const notifications = useNotifications()

  return {
    ...notifications,
    count:
      notifications.data?.items.reduce(
        (count, notification) => count + (notification.read ? 0 : 1),
        0,
      ) ?? 0,
  }
}

export function useNotificationMutations() {
  const queryClient = useQueryClient()

  function invalidateNotifications() {
    void queryClient.invalidateQueries({
      queryKey: NOTIFICATIONS_QUERY_KEYS.list,
    })
  }

  return {
    markAsRead: useMutation({
      mutationFn: notificationsService.markNotificationAsRead,
      onSuccess: invalidateNotifications,
    }),
    markAllAsRead: useMutation({
      mutationFn: notificationsService.markAllNotificationsAsRead,
      onSuccess: invalidateNotifications,
    }),
  }
}
