import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FRIENDS_QUERY_KEYS } from './friends.constants'
import * as friendsService from './friends.service'

function useInvalidateFriends() {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.list }),
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.requests }),
    ])
}

export function useFriends() {
  return useQuery({
    queryKey: FRIENDS_QUERY_KEYS.list,
    queryFn: friendsService.listFriends,
  })
}

export function useFriendRequests() {
  return useQuery({
    queryKey: FRIENDS_QUERY_KEYS.requests,
    queryFn: friendsService.listFriendRequests,
  })
}

export function useFriendMutations() {
  const invalidateFriends = useInvalidateFriends()

  return {
    sendRequest: useMutation({
      mutationFn: friendsService.sendFriendRequest,
      onSuccess: invalidateFriends,
    }),
    acceptRequest: useMutation({
      mutationFn: friendsService.acceptFriendRequest,
      onSuccess: invalidateFriends,
    }),
    rejectRequest: useMutation({
      mutationFn: friendsService.rejectFriendRequest,
      onSuccess: invalidateFriends,
    }),
    cancelRequest: useMutation({
      mutationFn: friendsService.cancelFriendRequest,
      onSuccess: invalidateFriends,
    }),
    removeFriend: useMutation({
      mutationFn: friendsService.removeFriend,
      onSuccess: invalidateFriends,
    }),
  }
}
