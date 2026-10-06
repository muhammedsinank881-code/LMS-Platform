import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/services'
import type { CompleteOnboardingInput } from '@/services/api'
import { useAuthStore } from '@/store/auth-store'

/** Saves the workspace settings and flips `onboardingCompleted` on the tenant in the store. */
export function useCompleteOnboarding() {
  const updateTenant = useAuthStore((state) => state.updateTenant)

  return useMutation({
    mutationFn: (input: CompleteOnboardingInput) => {
      const token = useAuthStore.getState().token
      if (!token) return Promise.reject(new Error('You are signed out.'))
      return authApi.completeOnboarding(token, input)
    },
    onSuccess: updateTenant,
  })
}
