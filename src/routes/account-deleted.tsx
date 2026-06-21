import { createFileRoute } from '@tanstack/react-router'
import { AccountDeletedPage } from '#/pages/account/account-deleted-page'

export const Route = createFileRoute('/account-deleted')({
  component: AccountDeletedPage,
})
