import { env } from '#/config/env'
import {
  apiClient,
  clearClientAccessToken,
  getClientAccessToken,
  setClientAccessToken,
} from '#/lib/client/apiClient'
import type {
  AuthMessageResponse,
  AuthSession,
  ForgotPasswordRequest,
  LoginRequest,
  ResendEmailVerificationRequest,
  ResetPasswordRequest,
  SignupRequest,
  VerifyEmailRequest,
} from './auth.types'

export function getAccessToken() {
  return getClientAccessToken()
}

export function setAccessToken(accessToken: string) {
  setClientAccessToken(accessToken)
}

export function clearAccessToken() {
  clearClientAccessToken()
}

function rememberSession(session: AuthSession) {
  setAccessToken(session.accessToken)
  return session
}

export async function signup(input: SignupRequest) {
  return apiClient<AuthMessageResponse>('/auth/signup', {
    method: 'POST',
    body: input,
  })
}

export async function verifyEmail(input: VerifyEmailRequest) {
  return apiClient<AuthMessageResponse>('/auth/verify-email', {
    method: 'POST',
    body: input,
  })
}

export async function resendEmailVerification(
  input: ResendEmailVerificationRequest,
) {
  return apiClient<AuthMessageResponse>('/auth/verify-email/resend', {
    method: 'POST',
    body: input,
  })
}

export async function login(input: LoginRequest) {
  const session = await apiClient<AuthSession>('/auth/login', {
    method: 'POST',
    body: input,
  })

  return rememberSession(session)
}

export async function refreshSession() {
  const session = await apiClient<AuthSession>('/auth/refresh', {
    method: 'POST',
  })

  return rememberSession(session)
}

export async function logout() {
  const result = await apiClient<AuthMessageResponse>('/auth/logout', {
    method: 'POST',
  })

  clearAccessToken()

  return result
}

export async function forgotPassword(input: ForgotPasswordRequest) {
  return apiClient<AuthMessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: input,
  })
}

export async function resetPassword(input: ResetPasswordRequest) {
  const result = await apiClient<AuthMessageResponse>('/auth/reset-password', {
    method: 'POST',
    body: input,
  })

  clearAccessToken()

  return result
}

export function startGoogleOAuth() {
  window.location.href = `${env.apiBaseUrl}/auth/oauth/google`
}

export function startDiscordOAuth() {
  window.location.href = `${env.apiBaseUrl}/auth/oauth/discord`
}
