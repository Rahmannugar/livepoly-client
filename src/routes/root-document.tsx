import { HeadContent, Scripts } from '@tanstack/react-router'
import { ThemeProvider } from '#/lib/theme/theme-provider'

export function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
