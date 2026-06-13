import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  USER_AVATAR_ALLOWED_TYPES,
  USER_AVATAR_MAX_BYTES,
  USER_MATCHES_LIMIT,
  USER_SEARCH_LIMIT,
  USER_SEARCH_MIN_LENGTH,
  USERS_QUERY_KEYS,
} from './users.constants'
import * as usersService from './users.service'
import type {
  AvatarContentType,
  UpdateUserProfileRequest,
  UserProfile,
} from './users.types'

export function useCurrentUserProfile(enabled = true) {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.me,
    queryFn: usersService.getCurrentUserProfile,
    enabled,
  })
}

export function useUserProfile(username: string | null | undefined) {
  const normalizedUsername = username?.trim().toLowerCase() ?? ''

  return useQuery({
    queryKey: USERS_QUERY_KEYS.profile(normalizedUsername),
    queryFn: () => usersService.getUserProfile(normalizedUsername),
    enabled: normalizedUsername.length > 0,
  })
}

export function useUserMatches(username: string | null | undefined) {
  const normalizedUsername = username?.trim().toLowerCase() ?? ''

  return useQuery({
    queryKey: [
      ...USERS_QUERY_KEYS.matches(normalizedUsername),
      USER_MATCHES_LIMIT,
    ],
    queryFn: () => usersService.getUserMatches(normalizedUsername),
    enabled: normalizedUsername.length > 0,
  })
}

export function useUpdateCurrentUserProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateUserProfileRequest) =>
      usersService.updateCurrentUserProfile(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(USERS_QUERY_KEYS.me, profile)
    },
  })
}

export function useUserSearch(query: string, enabled = true) {
  const normalizedQuery = query.trim().toLowerCase()

  return useQuery({
    queryKey: USERS_QUERY_KEYS.search(normalizedQuery),
    queryFn: () =>
      usersService.searchUsers({
        query: normalizedQuery,
        limit: USER_SEARCH_LIMIT,
      }),
    enabled: enabled && normalizedQuery.length >= USER_SEARCH_MIN_LENGTH,
  })
}

export function useAvatarUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!USER_AVATAR_ALLOWED_TYPES.includes(file.type as AvatarContentType)) {
        throw new Error('Use a WebP, PNG, or JPG image.')
      }

      if (file.size > USER_AVATAR_MAX_BYTES) {
        throw new Error('Avatar image must be 10MB or smaller.')
      }

      const upload = await usersService.createAvatarUploadUrl({
        contentType: file.type as AvatarContentType,
        contentLength: file.size,
      })

      await usersService.uploadAvatarToStorage(upload.uploadUrl, file)

      return upload
    },
    onSuccess: (upload) => {
      queryClient.setQueryData<UserProfile | undefined>(
        USERS_QUERY_KEYS.me,
        (currentProfile) =>
          currentProfile
            ? {
                ...currentProfile,
                avatarUrl: upload.avatarUrl,
                updatedAt: new Date().toISOString(),
              }
            : currentProfile,
      )
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.me })
    },
  })
}
