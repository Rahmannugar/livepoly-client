import { apiClient } from '#/lib/client/apiClient'
import { USER_MATCHES_LIMIT, USER_SEARCH_LIMIT } from './users.constants'
import type {
  CreateAvatarUploadUrlRequest,
  AvatarUploadUrlResponse,
  SearchUsersInput,
  UpdateUserProfileRequest,
  UserMatchHistoryResponse,
  UserProfile,
  UserSearchResponse,
} from './users.types'

export function getCurrentUserProfile() {
  return apiClient<UserProfile>('/users/me')
}

export function getUserProfile(username: string) {
  return apiClient<UserProfile>(`/users/${encodeURIComponent(username)}`)
}

export function updateCurrentUserProfile(input: UpdateUserProfileRequest) {
  return apiClient<UserProfile>('/users/me', {
    method: 'PATCH',
    body: input,
  })
}

export function searchUsers(input: SearchUsersInput) {
  const params = new URLSearchParams({
    query: input.query,
    limit: String(input.limit ?? USER_SEARCH_LIMIT),
  })

  if (input.cursor) {
    params.set('cursor', input.cursor)
  }

  return apiClient<UserSearchResponse>(`/users/search?${params.toString()}`)
}

export function getUserMatches(username: string) {
  const params = new URLSearchParams({
    limit: String(USER_MATCHES_LIMIT),
  })

  return apiClient<UserMatchHistoryResponse>(
    `/users/${encodeURIComponent(username)}/matches?${params.toString()}`,
  )
}

export function createAvatarUploadUrl(input: CreateAvatarUploadUrlRequest) {
  return apiClient<AvatarUploadUrlResponse>('/users/me/avatar/upload-url', {
    method: 'POST',
    body: input,
  })
}

export async function uploadAvatarToStorage(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!response.ok) {
    throw new Error('Could not upload avatar.')
  }
}
