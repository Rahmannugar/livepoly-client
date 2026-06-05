import { QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Scripts } from '@tanstack/react-router'
import { ToastProvider } from '#/components/common/toast'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { queryClient } from '#/lib/client/queryClient'
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
              <div className="fixed right-5 top-5 z-50 hidden sm:block">
                <ThemeToggle />
              </div>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
