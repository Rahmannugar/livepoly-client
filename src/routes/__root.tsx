import { createRootRoute } from '@tanstack/react-router'
import { APP_ASSETS, APP_DESCRIPTION, APP_NAME } from '#/config/app.constants'
import { NotFoundPage } from '#/pages/not-found-page'
import appCss from '../styles.css?url'
import { RootDocument } from './-root-document'

export const Route = createRootRoute({
  notFoundComponent: NotFoundPage,
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
    ],
  }),
  shellComponent: RootDocument,
})
