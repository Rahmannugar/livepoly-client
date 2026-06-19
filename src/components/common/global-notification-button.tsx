import { BellIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '#/lib/auth/useAuth'
import { useUnreadNotificationCount } from '#/lib/notifications/useNotifications'

export function GlobalNotificationButton() {
  const auth = useAuth()
  const notifications = useUnreadNotificationCount()
  const user = auth.currentUser.data

  if (!user) {
    return null
  }

  return (
    <Link
      to="/notifications"
      aria-label="Open notifications"
      className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(8,28,32,0.12)] transition hover:translate-y-[-1px] min-[420px]:h-9 min-[420px]:w-9 sm:h-10 sm:w-10"
    >
      <BellIcon weight="bold" className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
      {notifications.count ? (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--primary)] px-1 text-[0.65rem] font-black text-[var(--primary-foreground)]">
          {notifications.count > 9 ? '9+' : notifications.count}
        </span>
      ) : null}
    </Link>
  )
}
