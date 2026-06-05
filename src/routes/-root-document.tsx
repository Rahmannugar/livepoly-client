import { QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Scripts } from '@tanstack/react-router'
import { ToastProvider } from '#/components/common/toast'
import { ThemeToggle } from '#/components/common/theme-toggle'
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
                <div className="global-theme-toggle fixed right-5 top-5 z-50">
                  <ThemeToggle />
                </div>
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
