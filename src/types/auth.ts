import type { Role } from './permissions'

export const TENANT_PLANS = ['free', 'pro', 'enterprise'] as const
export type TenantPlan = (typeof TENANT_PLANS)[number]

export interface Tenant {
  id: string
  name: string
  slug: string
  /** ISO 4217 code, e.g. INR. */
  currency: string
  /** IANA timezone, e.g. Asia/Kolkata. */
  timezone: string
  /** False until the owner finishes the onboarding wizard. */
  onboardingCompleted: boolean
  createdAt: string
  /** Optional so workspaces persisted before Step 4 stay valid. */
  plan?: TenantPlan
  logoUrl?: string | null
}

export const USER_STATUSES = ['active', 'invited', 'inactive'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

/**
 * Full workspace member record. The same person can belong to several workspaces, so
 * `(id, tenantId)` is the unique key and `role` is per workspace.
 */
export interface User {
  id: string
  tenantId: string
  name: string
  email: string
  role: Role
  teamId: string | null
  avatarUrl?: string | null
  /** Preferred working language, used by language-based assignment rules. */
  language: string
  location: string
  /** Open leads currently owned. Denormalized by the backend for assignment decisions. */
  workload: number
  status: UserStatus
  phone?: string | null
  /** IANA timezone for this person. Falls back to the workspace timezone. */
  timezone?: string | null
  lastActiveAt?: string | null
  createdAt: string
}

/** The identity carried by a signed-in session: the subset of `User` the auth layer knows. */
export type SessionUser = Pick<
  User,
  'id' | 'tenantId' | 'name' | 'email' | 'role' | 'teamId' | 'avatarUrl'
>

export interface AuthSession {
  user: SessionUser
  tenant: Tenant
  /** Every workspace the user belongs to (feeds the workspace switcher). */
  tenants: Tenant[]
  token: string
}
