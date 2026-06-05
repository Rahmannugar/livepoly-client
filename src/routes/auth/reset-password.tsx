import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordPage } from '#/pages/auth/reset-password-page'

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
})
