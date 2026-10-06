import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession, SessionUser, Tenant } from '@/types'

interface AuthState {
  user: SessionUser | null
  /** Current workspace. */
  tenant: Tenant | null
  /** Every workspace the user belongs to. */
  tenants: Tenant[]
  token: string | null
  /** True after an explicit sign-out, so guards skip the "return here after login" redirect. */
  intentionalSignOut: boolean
  setSession: (session: AuthSession) => void
  /** Replace one tenant's data (e.g. after onboarding) in both `tenant` and `tenants`. */
  updateTenant: (tenant: Tenant) => void
  signOut: (options?: { intentional?: boolean }) => void
}

export const AUTH_STORAGE_KEY = 'leadflow-auth'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      tenants: [],
      token: null,
      intentionalSignOut: false,
      setSession: ({ user, tenant, tenants, token }) =>
        set({ user, tenant, tenants, token, intentionalSignOut: false }),
      updateTenant: (updated) =>
        set((state) => ({
          tenant: state.tenant?.id === updated.id ? updated : state.tenant,
          tenants: state.tenants.map((t) => (t.id === updated.id ? updated : t)),
        })),
      signOut: ({ intentional = false } = {}) =>
        set({
          user: null,
          tenant: null,
          tenants: [],
          token: null,
          intentionalSignOut: intentional,
        }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      version: 1,
      partialize: ({ user, tenant, tenants, token }) => ({ user, tenant, tenants, token }),
    },
  ),
)

export const selectIsAuthenticated = (state: AuthState) =>
  state.token !== null && state.user !== null && state.tenant !== null
