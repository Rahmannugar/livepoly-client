import { QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Scripts } from '@tanstack/react-router'
import { GlobalNotificationButton } from '#/components/common/global-notification-button'
import { ToastProvider } from '#/components/common/toast'
import { queryClient } from '#/lib/client/queryClient'
import { AuthHydrator } from '#/lib/auth/auth-hydrator'
import { NotificationsStream } from '#/lib/notifications/notifications-stream'
import { ThemeProvider } from '#/lib/theme/theme-provider'

export function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastProvider>
              <AuthHydrator>
                <NotificationsStream />
                <GlobalNotificationButton />
                {children}
              </AuthHydrator>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
