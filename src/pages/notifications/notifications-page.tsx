import {
  ArrowClockwiseIcon,
  BellIcon,
  CheckCircleIcon,
  ChartLineUpIcon,
  GiftIcon,
  InfoIcon,
  UserPlusIcon,
} from '@phosphor-icons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useToast } from '#/components/common/toast'
import { APP_NAME } from '#/config/app.constants'
import {
  useNotificationMutations,
  useNotifications,
} from '#/lib/notifications/useNotifications'
import type {
  NotificationItem,
  NotificationType,
} from '#/lib/notifications/notifications.types'

const notificationIcons: Record<NotificationType, typeof BellIcon> = {
  friend_request: UserPlusIcon,
  friend_accepted: CheckCircleIcon,
  room_invite: GiftIcon,
  leaderboard: ChartLineUpIcon,
  game_finished: CheckCircleIcon,
  turn_reminder: BellIcon,
  system: InfoIcon,
}

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getNotificationTarget(notification: NotificationItem) {
  if (notification.data?.gameId) {
    return {
      to: '/games/$gameId' as const,
      params: { gameId: notification.data.gameId },
      label: 'Open game',
    }
  }

  if (notification.data?.roomCode) {
    return {
      to: '/rooms/$code' as const,
      params: { code: notification.data.roomCode },
      label: 'Open room',
    }
  }

  if (
    notification.type === 'friend_request' ||
    notification.type === 'friend_accepted'
  ) {
    return {
      to: '/friends' as const,
      params: undefined,
      label: 'Open friends',
    }
  }

  return null
}

export function NotificationsPage() {
  const notifications = useNotifications()
  const mutations = useNotificationMutations()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const items =
    notifications.data?.pages.flatMap((page) => page.items) ?? []
  const unreadCount = items.filter((notification) => !notification.read).length

  function markAsRead(notificationId: string) {
    mutations.markAsRead.mutate(notificationId, {
      onError: (error) =>
        showToast({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Could not mark notification as read.',
        }),
    })
  }

  function markAllAsRead() {
    mutations.markAllAsRead.mutate(undefined, {
      onSuccess: () =>
        showToast({ kind: 'success', message: 'Notifications marked read.' }),
      onError: (error) =>
        showToast({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Could not update notifications.',
        }),
    })
  }

  function openNotification(notification: NotificationItem) {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    const target = getNotificationTarget(notification)

    if (!target) {
      return
    }

    if (target.to === '/games/$gameId') {
      navigate({ to: target.to, params: target.params })
      return
    }

    if (target.to === '/rooms/$code') {
      navigate({ to: target.to, params: target.params })
      return
    }

    navigate({ to: target.to })
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-5xl content-center gap-7">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="display-title text-3xl font-semibold text-[var(--sea-ink)] sm:text-4xl"
          >
            {APP_NAME}
          </Link>
          <Link to="/" className="app-link text-sm">
            Home
          </Link>
        </header>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="app-kicker">Notifications</p>
            <h1 className="display-title mt-2 text-5xl font-semibold leading-tight text-[var(--sea-ink)] sm:text-6xl">
              What needs your attention.
            </h1>
            <p className="mt-4 text-lg leading-8 text-[var(--sea-ink-soft)]">
              Friend requests, room invites, game starts, and match updates.
            </p>
          </div>

          <button
            type="button"
            disabled={!unreadCount || mutations.markAllAsRead.isPending}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-black text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={markAllAsRead}
          >
            Mark all read
          </button>
        </div>

        <section className="grid gap-3">
          {notifications.isLoading ? (
            <>
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </>
          ) : null}

          {notifications.isError ? (
            <article className="rounded-[28px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-6 shadow-[0_18px_45px_rgba(8,28,32,0.1)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-black text-[var(--sea-ink)]">
                    Could not load notifications.
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
                    {notifications.error instanceof Error
                      ? notifications.error.message
                      : 'Try again in a moment.'}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)]"
                  onClick={() => void notifications.refetch()}
                >
                  <ArrowClockwiseIcon weight="bold" className="h-4 w-4" />
                  Retry
                </button>
              </div>
            </article>
          ) : null}

          {items.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              isMarkingRead={mutations.markAsRead.isPending}
              onOpen={() => openNotification(notification)}
              onMarkRead={() => markAsRead(notification.id)}
            />
          ))}

          {!notifications.isLoading && !notifications.isError && !items.length ? (
            <article className="rounded-[28px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-6 text-center shadow-[0_18px_45px_rgba(8,28,32,0.1)] backdrop-blur-xl">
              <BellIcon
                weight="bold"
                className="mx-auto h-8 w-8 text-[var(--sea-ink-soft)]"
              />
              <p className="mt-4 text-base font-black text-[var(--sea-ink)]">
                Nothing new yet.
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--sea-ink-soft)]">
                Invites, requests, and game updates will show here.
              </p>
            </article>
          ) : null}

          {notifications.hasNextPage ? (
            <button
              type="button"
              disabled={notifications.isFetchingNextPage}
              className="mx-auto mt-2 inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-black text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void notifications.fetchNextPage()}
            >
              {notifications.isFetchingNextPage ? 'Loading...' : 'Load more'}
            </button>
          ) : null}
        </section>
      </section>
    </main>
  )
}

function NotificationSkeleton() {
  return (
    <article className="rounded-[28px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)] p-5 shadow-[0_18px_45px_rgba(8,28,32,0.1)] backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-2xl bg-[color-mix(in_oklab,var(--sea-ink-soft)_20%,transparent)]" />
        <div className="grid flex-1 gap-3">
          <div className="h-5 w-2/5 animate-pulse rounded-full bg-[color-mix(in_oklab,var(--sea-ink-soft)_20%,transparent)]" />
          <div className="h-4 w-4/5 animate-pulse rounded-full bg-[color-mix(in_oklab,var(--sea-ink-soft)_16%,transparent)]" />
          <div className="h-3 w-32 animate-pulse rounded-full bg-[color-mix(in_oklab,var(--sea-ink-soft)_14%,transparent)]" />
        </div>
      </div>
    </article>
  )
}

function NotificationCard({
  notification,
  isMarkingRead,
  onOpen,
  onMarkRead,
}: {
  notification: NotificationItem
  isMarkingRead: boolean
  onOpen: () => void
  onMarkRead: () => void
}) {
  const Icon = notificationIcons[notification.type]
  const target = getNotificationTarget(notification)

  return (
    <article
      className={[
        'rounded-[28px] border p-5 shadow-[0_18px_45px_rgba(8,28,32,0.1)] backdrop-blur-xl transition',
        notification.read
          ? 'border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_74%,transparent)]'
          : 'border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_12%,var(--bg-base))]',
      ].join(' ')}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-start gap-4 text-left"
          onClick={onOpen}
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--sea-ink)]">
            <Icon weight="bold" className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-lg font-black text-[var(--sea-ink)]">
                {notification.title}
              </span>
              {!notification.read ? (
                <span className="rounded-full bg-[var(--primary)] px-2 py-1 text-[0.65rem] font-black uppercase text-[var(--primary-foreground)]">
                  New
                </span>
              ) : null}
            </span>
            <span className="mt-1 block text-sm font-semibold leading-6 text-[var(--sea-ink-soft)]">
              {notification.body}
            </span>
            <span className="mt-2 block text-xs font-bold text-[var(--sea-ink-soft)]">
              {formatNotificationDate(notification.createdAt)}
            </span>
          </span>
        </button>

        <div className="flex shrink-0 flex-wrap gap-2">
          {target ? (
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)]"
              onClick={onOpen}
            >
              {target.label}
            </button>
          ) : null}
          {!notification.read ? (
            <button
              type="button"
              disabled={isMarkingRead}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--line)] px-4 text-sm font-black text-[var(--sea-ink)] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onMarkRead}
            >
              Mark read
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
