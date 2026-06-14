export type UserRole = 'player' | 'admin'

export type UserStatus = 'active' | 'suspended'

export type AuthUser = {
  id: string
  email: string
  username: string
  avatarUrl?: string | null
  role?: UserRole
  status?: UserStatus
}

export type AuthSession = {
  accessToken: string
  user: AuthUser
}

export type SignupRequest = {
  email: string
  username: string
  password: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type VerifyEmailRequest = {
  email: string
  otpCode: string
}

export type ResendEmailVerificationRequest = {
  email: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  email: string
  otpCode: string
  password: string
}

export type AuthMessageResponse = {
  message?: string
}
