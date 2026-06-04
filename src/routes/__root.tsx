import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { APP_ASSETS, APP_DESCRIPTION, APP_NAME } from '#/config/app.constants'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: APP_NAME,
      },
      {
        name: 'description',
        content: APP_DESCRIPTION,
      },
      {
        property: 'og:title',
        content: APP_NAME,
      },
      {
        property: 'og:description',
        content: APP_DESCRIPTION,
      },
      {
        property: 'og:image',
        content: APP_ASSETS.openGraphImage,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: APP_ASSETS.favicon,
      },
      {
        rel: 'apple-touch-icon',
        href: APP_ASSETS.logo,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
