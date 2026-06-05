import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { AuthLayout } from '#/components/auth/auth-layout'
import { useToast } from '#/components/common/toast'
import { useAuth } from '#/lib/auth/useAuth'

type OAuthCallbackSearch = {
  error?: string
}

export function OAuthCallbackPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as OAuthCallbackSearch
  const { showToast } = useToast()
  const hasHandledCallback = useRef(false)

  useEffect(() => {
    if (hasHandledCallback.current) {
      return
    }

    hasHandledCallback.current = true

    if (search.error) {
      showToast({
        kind: 'error',
        message: 'OAuth sign in could not be completed.',
      })
      navigate({ to: '/auth/login' })
      return
    }

    auth.refreshSession.mutate(undefined, {
      onSuccess: () => {
        showToast({
          kind: 'success',
          message: 'Signed in successfully.',
        })
        navigate({ to: '/' })
      },
      onError: (error) => {
        showToast({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Could not finish OAuth sign in.',
        })
        navigate({ to: '/auth/login' })
      },
    })
  }, [auth.refreshSession, navigate, search.error, showToast])

  return (
    <AuthLayout
      title="Signing you in."
      subtitle="Checking your account and sending you back to the board."
      footer={null}
    >
      <div className="rounded-[26px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_78%,transparent)] p-5 text-center shadow-[0_22px_60px_rgba(8,28,32,0.14)] backdrop-blur-xl sm:p-6">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--primary)]" />
      </div>
    </AuthLayout>
  )
}
