import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/auth-store'

export function useStudentJobs() {
  const userId = useAuthStore((state) => state.user?.id)
  const queryKey = ['student-jobs', userId]
  const queryClient = useQueryClient()
  const overview = useQuery({
    queryKey,
    queryFn: () => api.studentJobs.getOverview(),
    enabled: Boolean(userId),
  })
  const apply = useMutation({
    mutationFn: (jobId: string) => api.studentJobs.apply(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { overview, apply }
}
