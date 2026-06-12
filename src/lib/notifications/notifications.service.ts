import { apiClient } from '#/lib/client/apiClient'
import { NOTIFICATIONS_LIMIT } from './notifications.constants'
import type {
  NotificationItem,
  NotificationsPageResponse,
} from './notifications.types'

export function listNotifications(cursor?: string | null) {
  const params = new URLSearchParams({ limit: String(NOTIFICATIONS_LIMIT) })

  if (cursor) {
    params.set('cursor', cursor)
  }

  return apiClient<NotificationsPageResponse>(
    `/notifications?${params.toString()}`,
  )
}

export function markNotificationAsRead(notificationId: string) {
  return apiClient<NotificationItem>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  })
}

export function markAllNotificationsAsRead() {
  return apiClient<{ message?: string }>('/notifications/read-all', {
    method: 'PATCH',
  })
}

export function getNotificationsStreamUrl() {
  return '/notifications/stream'
}
