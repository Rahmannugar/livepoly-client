export type SearchUsersInput = {
  query: string
  limit?: number
  cursor?: string
}

export type UserSearchItem = {
  id: string
  username: string
  avatarUrl: string | null
}

export type UserSearchResponse = {
  items: UserSearchItem[]
  nextCursor: string | null
}

export type UserStats = {
  gamesPlayed: number
  gamesWon: number
  averagePlacement: number | null
  rating: number
}

export type UserProfile = {
  id: string
  email: string
  username: string
  role: 'player' | 'admin'
  bio: string | null
  avatarUrl: string | null
  stats: UserStats
  createdAt: string
  updatedAt: string
}

export type PublicUserProfile = Omit<UserProfile, 'email' | 'role'>

export type UpdateUserProfileRequest = {
  username?: string
  bio?: string | null
}

export type UserMatchHistoryItem = {
  gameId: string
  roomId: string
  roomCode: string
  mode: 'ranked' | 'casual'
  placement: number
  playerCount: number
  won: boolean
  endReason: 'bankruptcy' | 'time_elapsed' | 'abandoned' | 'cancelled'
  finalCash: number
  finalNetWorth: number
  bankruptAt: string | null
  ratingBefore: number | null
  ratingAfter: number | null
  ratingDelta: number | null
  durationSeconds: number
  completedAt: string
}

export type UserMatchHistoryResponse = {
  items: UserMatchHistoryItem[]
  nextCursor: string | null
}

export type AvatarContentType = 'image/webp' | 'image/jpeg' | 'image/png'

export type CreateAvatarUploadUrlRequest = {
  contentType: AvatarContentType
  contentLength: number
}

export type AvatarUploadUrlResponse = {
  uploadId: string
  uploadUrl: string
  objectKey: string
  avatarUrl: string
  expiresInSeconds: number
}
