import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AUTH_QUERY_KEYS } from './auth.constants'
import * as authService from './auth.service'
import type { AuthSession } from './auth.types'

export function useAuth() {
  const queryClient = useQueryClient()

  function setAuthSession(session: AuthSession) {
    queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, session.user)
  }

  function clearAuthSession() {
    authService.clearAccessToken()
    queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.currentUser })
  }

  const login = useMutation({
    mutationFn: authService.login,
    onSuccess: setAuthSession,
  })

  const signup = useMutation({
    mutationFn: authService.signup,
  })

  const verifyEmail = useMutation({
    mutationFn: authService.verifyEmail,
  })

  const resendEmailVerification = useMutation({
    mutationFn: authService.resendEmailVerification,
  })

  const refreshSession = useMutation({
    mutationFn: authService.refreshSession,
    onSuccess: setAuthSession,
    onError: clearAuthSession,
  })

  const logout = useMutation({
    mutationFn: authService.logout,
    onSettled: clearAuthSession,
  })

  const forgotPassword = useMutation({
    mutationFn: authService.forgotPassword,
  })

  const resetPassword = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: clearAuthSession,
  })

  return {
    login,
    signup,
    verifyEmail,
    resendEmailVerification,
    refreshSession,
    logout,
    forgotPassword,
    resetPassword,
    startGoogleOAuth: authService.startGoogleOAuth,
    startDiscordOAuth: authService.startDiscordOAuth,
    clearAuthSession,
  }
}
