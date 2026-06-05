import { createFileRoute } from '@tanstack/react-router'
import { VerifyEmailPage } from '#/pages/auth/verify-email-page'

export const Route = createFileRoute('/auth/verify-email')({
  component: VerifyEmailPage,
})
