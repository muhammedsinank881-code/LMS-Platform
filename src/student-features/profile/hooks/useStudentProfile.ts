import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services'
import type {
  ExternalStudentCertificateInput,
  StudentProfilePatch,
} from '@/services/api/student-profile'
import { useAuthStore } from '@/store/auth-store'
import { useWorkspace } from '@/hooks/use-workspace'

export function useStudentProfile() {
  const { ready, tenantId } = useWorkspace()
  const userId = useAuthStore((state) => state.user?.id)
  const queryClient = useQueryClient()
  const queryKey = ['student-profile', tenantId, userId]

  const profile = useQuery({
    queryKey,
    queryFn: () => api.studentProfile.get(),
    enabled: ready,
  })

  const update = useMutation({
    mutationFn: (patch: StudentProfilePatch) => api.studentProfile.update(patch),
    onSuccess: (saved) => queryClient.setQueryData(queryKey, saved),
    meta: { errorTitle: 'Could not save profile' },
  })

  const addCertificate = useMutation({
    mutationFn: (input: ExternalStudentCertificateInput) =>
      api.studentProfile.addExternalCertificate(input),
    onSuccess: (saved) => queryClient.setQueryData(queryKey, saved),
    meta: { errorTitle: 'Could not add certificate' },
  })

  const updateCertificate = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ExternalStudentCertificateInput> }) =>
      api.studentProfile.updateExternalCertificate(id, patch),
    onSuccess: (saved) => queryClient.setQueryData(queryKey, saved),
    meta: { errorTitle: 'Could not update certificate' },
  })

  const deleteCertificate = useMutation({
    mutationFn: (id: string) => api.studentProfile.deleteExternalCertificate(id),
    onSuccess: (saved) => queryClient.setQueryData(queryKey, saved),
    meta: { errorTitle: 'Could not remove certificate' },
  })

  return { profile, update, addCertificate, updateCertificate, deleteCertificate }
}
