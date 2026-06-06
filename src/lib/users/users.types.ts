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
