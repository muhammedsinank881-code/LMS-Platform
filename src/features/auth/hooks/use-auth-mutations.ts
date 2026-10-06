import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/services'
import type {
  AcceptInviteInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
} from '@/services/api'
import { useAuthStore } from '@/store/auth-store'

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: setSession,
  })
}

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession)
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: setSession,
  })
}

export function useAcceptInvite() {
  const setSession = useAuthStore((state) => state.setSession)
  return useMutation({
    mutationFn: (input: AcceptInviteInput) => authApi.acceptInvite(input),
    onSuccess: setSession,
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authApi.requestPasswordReset(input),
  })
}

/** Clears the local session immediately; the server-side revoke is best effort. */
export function useLogout() {
  const queryClient = useQueryClient()
  const signOut = useAuthStore((state) => state.signOut)

  return () => {
    const token = useAuthStore.getState().token
    signOut({ intentional: true })
    queryClient.clear()
    if (token) void authApi.logout(token).catch(() => undefined)
  }
}
