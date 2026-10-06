import { useQuery } from '@tanstack/react-query'
import { authKeys } from '@/lib/queryKeys'
import { authApi } from '@/services'

export function useInvitation(token: string | null) {
  return useQuery({
    queryKey: authKeys.invitation(token ?? ''),
    queryFn: () => authApi.getInvitation(token ?? ''),
    enabled: Boolean(token),
    retry: false,
    // An invitation can be accepted only once; never serve a stale cached copy.
    staleTime: 0,
  })
}
