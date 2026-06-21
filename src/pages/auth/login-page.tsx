import { DiscordIcon } from '#/components/icons/discord-icon'
import { GoogleIcon } from '#/components/icons/google-icon'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { AuthLayout } from '#/components/auth/auth-layout'
import { PasswordField } from '#/components/auth/password-field'
import { useToast } from '#/components/common/toast'
import type { LoginRequest } from '#/lib/auth/auth.types'
import { useAuth } from '#/lib/auth/useAuth'
import type { ApiClientError } from '#/lib/client/client.types'

function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof Error && 'statusCode' in error
}

export function LoginPage() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { oauth?: string }
  const auth = useAuth()
  const { showToast } = useToast()
  const oauthErrorShownRef = useRef(false)
  const isHydrated = auth.hydration.data
  const currentUser = auth.currentUser.data

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>()

  useEffect(() => {
    if (!isHydrated || !currentUser) {
      return
    }

    navigate({ to: '/', replace: true })
  }, [currentUser, isHydrated, navigate])

  useEffect(() => {
    if (oauthErrorShownRef.current || search.oauth !== 'failed') {
      return
    }

    oauthErrorShownRef.current = true
    showToast({
      kind: 'error',
      message: 'OAuth sign in could not be completed.',
    })
    navigate({ to: '/auth/login', replace: true })
  }, [navigate, search.oauth, showToast])

  function onSubmit(input: LoginRequest) {
    auth.login.mutate(input, {
      onSuccess: () => {
        showToast({ kind: 'success', message: 'Welcome back to LivePoly.' })
        navigate({ to: '/' })
      },
      onError: (error) => {
        if (
          isApiClientError(error) &&
          error.code === 'EMAIL_VERIFICATION_REQUIRED'
        ) {
          showToast({
            kind: 'info',
            message: 'Check your email for a verification code.',
          })
          navigate({
            to: '/auth/verify-email',
            search: { email: input.email.trim().toLowerCase() },
          })
          return
        }

        showToast({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Could not sign you in.',
        })
      },
    })
  }

  if (!isHydrated || currentUser) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <p className="display-title text-3xl font-semibold text-[var(--sea-ink)]">
          Setting the board...
        </p>
      </main>
    )
  }

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Sign in and get back to your rooms, friends, and matches."
      footer={
        <div className="grid gap-1.5">
          <p>
            New here?{' '}
            <Link to="/auth/register" className="app-link">
              Create account
            </Link>
          </p>
          <p>
            <Link to="/auth/forgot-password" className="app-link">
              Forgot password?
            </Link>
          </p>
        </div>
      }
    >
      <div className="rounded-[26px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_78%,transparent)] p-4 shadow-[0_22px_60px_rgba(8,28,32,0.14)] backdrop-blur-xl">
        <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-[var(--sea-ink)]">
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              className="h-10 rounded-2xl border border-[var(--line)] bg-[var(--bg-base)] px-4 text-sm font-semibold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email ? (
              <span className="text-xs font-semibold text-red-500">
                {errors.email.message}
              </span>
            ) : null}
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-[var(--sea-ink)]">
              Password
            </span>
            <PasswordField
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password ? (
              <span className="text-xs font-semibold text-red-500">
                {errors.password.message}
              </span>
            ) : null}
          </label>

          <button
            type="submit"
            disabled={auth.login.isPending}
            className="mt-1 inline-flex h-10 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {auth.login.isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="my-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--line)]" />
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
            or
          </span>
          <div className="h-px flex-1 bg-[var(--line)]" />
        </div>

        <div className="grid gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-3 rounded-full border border-[var(--line)] bg-[var(--bg-base)] px-4 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px]"
            onClick={auth.startGoogleOAuth}
          >
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </button>

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-3 rounded-full border border-[var(--line)] bg-[var(--bg-base)] px-4 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px]"
            onClick={auth.startDiscordOAuth}
          >
            <DiscordIcon className="h-5 w-5 text-[#5865F2]" />
            Continue with Discord
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
