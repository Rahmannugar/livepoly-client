import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { AuthLayout } from '#/components/auth/auth-layout'
import { useToast } from '#/components/common/toast'
import type { VerifyEmailRequest } from '#/lib/auth/auth.types'
import { useAuth } from '#/lib/auth/useAuth'

export function VerifyEmailPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { email?: string }
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<VerifyEmailRequest>({
    defaultValues: {
      email: search.email ?? '',
    },
  })

  function onSubmit(input: VerifyEmailRequest) {
    auth.verifyEmail.mutate(input, {
      onSuccess: (response) => {
        showToast({
          kind: 'success',
          message: response.message ?? 'Email verified. You can sign in now.',
        })
        navigate({ to: '/auth/login' })
      },
      onError: (error) => {
        showToast({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Could not verify your email.',
        })
      },
    })
  }

  function resendCode() {
    const email = getValues('email')

    if (!email) {
      showToast({
        kind: 'error',
        message: 'Enter your email before requesting a new code.',
      })
      return
    }

    auth.resendEmailVerification.mutate(
      { email },
      {
        onSuccess: (response) => {
          showToast({
            kind: 'success',
            message: response.message ?? 'A new verification code was sent.',
          })
        },
        onError: (error) => {
          showToast({
            kind: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Could not resend verification code.',
          })
        },
      },
    )
  }

  return (
    <AuthLayout
      title="Verify your email."
      subtitle="Enter the code we sent so your account can join the table."
      footer={
        <>
          Already verified?{' '}
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
              Verification code
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="h-10 rounded-2xl border border-[var(--line)] bg-[var(--bg-base)] px-4 text-center text-lg font-bold tracking-[0.28em] text-[var(--sea-ink)] outline-none transition focus:border-[var(--primary)]"
              {...register('otpCode', {
                required: 'Verification code is required',
              })}
            />
            {errors.otpCode ? (
              <span className="text-xs font-semibold text-red-500">
                {errors.otpCode.message}
              </span>
            ) : null}
          </label>

          <button
            type="submit"
            disabled={auth.verifyEmail.isPending}
            className="mt-1 inline-flex h-10 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {auth.verifyEmail.isPending ? 'Verifying...' : 'Verify email'}
          </button>
        </form>

        <button
          type="button"
          disabled={auth.resendEmailVerification.isPending}
          className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg-base)] px-4 text-sm font-bold text-[var(--sea-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={resendCode}
        >
          {auth.resendEmailVerification.isPending
            ? 'Sending code...'
            : 'Resend code'}
        </button>
      </div>
    </AuthLayout>
  )
}
