import { BellIcon } from '@phosphor-icons/react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useAuth } from '#/lib/auth/useAuth'
import { useUnreadNotificationCount } from '#/lib/notifications/useNotifications'

export function GlobalNotificationButton() {
  const auth = useAuth()
  const notifications = useUnreadNotificationCount()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const user = auth.currentUser.data

  if (
    !user ||
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/games/') ||
    pathname.startsWith('/rooms/')
  ) {
    return null
  }

  return (
    <Link
      to="/notifications"
      aria-label="Open notifications"
      className="fixed right-4 top-4 z-[60] grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_88%,transparent)] text-[var(--sea-ink)] shadow-[0_14px_34px_rgba(8,28,32,0.16)] backdrop-blur-xl transition hover:translate-y-[-1px] sm:right-6 sm:top-6"
    >
      <BellIcon weight="bold" className="h-5 w-5" />
      {notifications.count ? (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--primary)] px-1 text-[0.65rem] font-black text-[var(--primary-foreground)]">
          {notifications.count > 9 ? '9+' : notifications.count}
        </span>
      ) : null}
    </Link>
  )
}
