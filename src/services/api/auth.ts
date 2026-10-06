import type { AuthSession, Role, Tenant } from '@/types'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  workspaceName: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface InvitationDetails {
  token: string
  email: string
  tenantName: string
  role: Role
  invitedByName: string
}

export interface AcceptInviteInput {
  token: string
  name: string
  password: string
}

export interface CompleteOnboardingInput {
  workspaceName: string
  currency: string
  timezone: string
  /** Emails to invite as salespeople. May be empty. */
  inviteEmails: string[]
}

/**
 * Contract for authentication and workspace membership. The mock lives in `services/mock`;
 * a real REST client only needs to implement this interface (see `services/index.ts`).
 */
export interface AuthApiClient {
  login(input: LoginInput): Promise<AuthSession>
  /** Creates the user and a new workspace they own (role: admin). */
  register(input: RegisterInput): Promise<AuthSession>
  /** Always resolves, whether or not the email exists, so accounts cannot be enumerated. */
  requestPasswordReset(input: ForgotPasswordInput): Promise<void>
  getInvitation(token: string): Promise<InvitationDetails>
  acceptInvite(input: AcceptInviteInput): Promise<AuthSession>
  switchTenant(token: string, tenantId: string): Promise<AuthSession>
  /** Saves workspace settings, sends invites and marks the tenant as onboarded. */
  completeOnboarding(token: string, input: CompleteOnboardingInput): Promise<Tenant>
  logout(token: string): Promise<void>
}
