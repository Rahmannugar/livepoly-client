import { QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Scripts } from '@tanstack/react-router'
import { ToastProvider } from '#/components/common/toast'
import { queryClient } from '#/lib/client/queryClient'
import { AuthHydrator } from '#/lib/auth/auth-hydrator'
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
