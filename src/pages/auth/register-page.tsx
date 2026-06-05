import { DiscordIcon } from '#/components/icons/discord-icon'
import { GoogleIcon } from '#/components/icons/google-icon'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { AuthLayout } from '#/components/auth/auth-layout'
import { PasswordField } from '#/components/auth/password-field'
import { useToast } from '#/components/common/toast'
import type { SignupRequest } from '#/lib/auth/auth.types'
import { useAuth } from '#/lib/auth/useAuth'

export function RegisterPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupRequest>()

  function onSubmit(input: SignupRequest) {
    auth.signup.mutate(input, {
      onSuccess: (response) => {
        showToast({
          kind: 'success',
          message:
            response.message ??
            'Account created. Check your email to verify your account.',
        })
        navigate({
          to: '/auth/verify-email',
          search: { email: input.email },
        })
      },
      onError: (error) => {
        showToast({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Could not create your account.',
        })
      },
    })
  }

  return (
    <AuthLayout
      title="Join LivePoly."
      subtitle="Choose your username, join a room, and start making your moves."
      footer={
        <>
          Already playing?{' '}
          <Link to="/auth/login" className="app-link">
            Sign in
          </Link>
        </>
      }
    >
      <div className="rounded-[26px] border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-base)_78%,transparent)] p-4 shadow-[0_22px_60px_rgba(8,28,32,0.14)] backdrop-blur-xl">
        <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-[var(--sea-ink)]">
              Username
            </span>
            <input
              type="text"
              autoComplete="username"
              className="h-10 rounded-2xl border border-[var(--line)] bg-[var(--bg-base)] px-4 text-sm font-semibold text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username ? (
              <span className="text-xs font-semibold text-red-500">
                {errors.username.message}
              </span>
            ) : null}
          </label>

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
              autoComplete="new-password"
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
            disabled={auth.signup.isPending}
            className="mt-1 inline-flex h-10 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {auth.signup.isPending ? 'Creating account...' : 'Create account'}
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
