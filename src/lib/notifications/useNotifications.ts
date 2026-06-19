import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from '#/lib/auth/useAuth'
import {
  NOTIFICATIONS_QUERY_KEYS,
  NOTIFICATIONS_REFETCH_INTERVAL_MS,
} from './notifications.constants'
import * as notificationsService from './notifications.service'

export function useNotifications() {
  const auth = useAuth()
  const canFetchNotifications = auth.hydration.data && !!auth.currentUser.data

  return useInfiniteQuery({
    queryKey: NOTIFICATIONS_QUERY_KEYS.list,
    queryFn: ({ pageParam }) =>
      notificationsService.listNotifications(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchInterval: NOTIFICATIONS_REFETCH_INTERVAL_MS,
    enabled: canFetchNotifications,
  })
}

export function useUnreadNotificationCount() {
  const notifications = useNotifications()

  return {
    ...notifications,
    count:
      notifications.data?.pages.reduce(
        (pageCount, page) =>
          pageCount +
          page.items.reduce(
            (count, notification) => count + (notification.read ? 0 : 1),
            0,
          ),
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
