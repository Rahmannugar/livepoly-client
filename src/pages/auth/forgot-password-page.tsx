import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { AuthLayout } from '#/components/auth/auth-layout'
import { useToast } from '#/components/common/toast'
import type { ForgotPasswordRequest } from '#/lib/auth/auth.types'
import { useAuth } from '#/lib/auth/useAuth'

export function ForgotPasswordPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>()

  function onSubmit(input: ForgotPasswordRequest) {
    auth.forgotPassword.mutate(input, {
      onSuccess: (response) => {
        showToast({
          kind: 'success',
          message: response.message ?? 'Password reset code sent.',
        })
        navigate({
          to: '/auth/reset-password',
          search: { email: input.email },
        })
      },
      onError: (error) => {
        showToast({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Could not start password reset.',
        })
      },
    })
  }

  return (
    <AuthLayout
      title="Reset your password."
      subtitle="Enter your email and we will send you a reset code."
      footer={
        <>
          Remembered it?{' '}
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

          <button
            type="submit"
            disabled={auth.forgotPassword.isPending}
            className="mt-1 inline-flex h-10 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(23,58,64,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {auth.forgotPassword.isPending ? 'Sending code...' : 'Send code'}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
