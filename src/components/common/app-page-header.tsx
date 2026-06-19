import { Link } from '@tanstack/react-router'
import { APP_NAME } from '#/config/app.constants'
import { GlobalNotificationButton } from './global-notification-button'

type AppPageHeaderProps = {
  showHomeLink?: boolean
}

export function AppPageHeader({ showHomeLink = true }: AppPageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3">
      <Link
        to="/"
        className="display-title min-w-0 text-2xl font-semibold leading-none text-[var(--sea-ink)] min-[420px]:text-3xl sm:text-4xl"
      >
        {APP_NAME}
      </Link>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <GlobalNotificationButton />
        {showHomeLink ? (
          <Link to="/" className="app-link text-sm">
            Home
          </Link>
        ) : null}
      </div>
    </header>
  )
}
