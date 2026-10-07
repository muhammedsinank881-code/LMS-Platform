import type {
  AcceptInviteInput,
  AuthApiClient,
  CompleteOnboardingInput,
  InvitationDetails,
  LoginInput,
  RegisterInput,
} from '@/services/api/auth'
import { ApiError } from '@/services/api/errors'
import type { AuthSession, Tenant } from '@/types'
import { delay } from '../latency'
import { newId, normalizeEmail, readDb, writeDb, type MockAuthDb } from './auth-db'

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'workspace'
}

function buildSession(
  db: MockAuthDb,
  userId: string,
  tenantId: string,
  token: string,
): AuthSession {
  const user = db.users.find((u) => u.id === userId)
  const membership = db.memberships.find((m) => m.userId === userId && m.tenantId === tenantId)
  const tenant = db.tenants.find((t) => t.id === tenantId)
  if (!user || !membership || !tenant)
    throw new ApiError('unauthorized', 'Your session has expired.')

  const tenants = db.memberships
    .filter((m) => m.userId === userId)
    .map((m) => db.tenants.find((t) => t.id === m.tenantId))
    .filter((t): t is Tenant => t !== undefined)

  return {
    token,
    tenant,
    tenants,
    user: {
      id: user.id,
      tenantId,
      name: user.name,
      email: user.email,
      role: membership.role,
      teamId: user.teamId,
    },
  }
}

function startSession(db: MockAuthDb, userId: string, tenantId: string): AuthSession {
  const token = `mock-${crypto.randomUUID()}`
  db.sessions[token] = { userId, tenantId }
  writeDb(db)
  return buildSession(db, userId, tenantId, token)
}

function requireSession(db: MockAuthDb, token: string) {
  const record = db.sessions[token]
  if (!record) throw new ApiError('unauthorized', 'Your session has expired. Sign in again.')
  return record
}

function createUserWithMembership(
  db: MockAuthDb,
  input: { name: string; email: string; password: string },
  tenantId: string,
  role: AuthSession['user']['role'],
): string {
  const id = newId('user')
  db.users.push({ id, ...input, email: normalizeEmail(input.email), teamId: null })
  db.memberships.push({ userId: id, tenantId, role })
  return id
}

function assertEmailFree(db: MockAuthDb, email: string): void {
  if (db.users.some((u) => u.email === normalizeEmail(email))) {
    throw new ApiError('email_taken', 'An account with this email already exists. Try signing in.')
  }
}

export const mockAuthApi: AuthApiClient = {
  async login({ email, password }: LoginInput) {
    await delay()
    const db = readDb()
    const user = db.users.find((u) => normalizeEmail(u.email) === normalizeEmail(email))
    // Same message for unknown email and wrong password: no account enumeration.
    if (!user || user.password !== password) {
      throw new ApiError('invalid_credentials', 'Incorrect email or password.')
    }
    const membership = db.memberships.find((m) => m.userId === user.id)
    if (!membership)
      throw new ApiError('forbidden', 'This account does not belong to any workspace.')
    return startSession(db, user.id, membership.tenantId)
  },

  async register({ name, email, password, workspaceName }: RegisterInput) {
    await delay()
    const db = readDb()
    assertEmailFree(db, email)
    const tenant: Tenant = {
      id: newId('tenant'),
      name: workspaceName.trim(),
      slug: `${slugify(workspaceName)}-${crypto.randomUUID().slice(0, 4)}`,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    }
    db.tenants.push(tenant)
    const userId = createUserWithMembership(
      db,
      { name: name.trim(), email, password },
      tenant.id,
      'admin',
    )
    return startSession(db, userId, tenant.id)
  },

  async requestPasswordReset() {
    await delay()
  },

  async getInvitation(token: string): Promise<InvitationDetails> {
    await delay()
    const db = readDb()
    const invitation = db.invitations.find((i) => i.token === token)
    const tenant = invitation && db.tenants.find((t) => t.id === invitation.tenantId)
    if (!invitation || !tenant) {
      throw new ApiError('invalid_invitation', 'This invitation link is invalid or has expired.')
    }
    return {
      token,
      email: invitation.email,
      tenantName: tenant.name,
      role: invitation.role,
      invitedByName: invitation.invitedByName,
    }
  },

  async acceptInvite({ token, name, password }: AcceptInviteInput) {
    await delay()
    const db = readDb()
    const invitation = db.invitations.find((i) => i.token === token)
    if (!invitation) {
      throw new ApiError('invalid_invitation', 'This invitation link is invalid or has expired.')
    }
    assertEmailFree(db, invitation.email)
    const userId = createUserWithMembership(
      db,
      { name: name.trim(), email: invitation.email, password },
      invitation.tenantId,
      invitation.role,
    )
    db.invitations = db.invitations.filter((i) => i.token !== token)
    const { getMockState } = await import('../core/state')
    const state = getMockState()
    const member = state.tables.users.find(
      (user) => user.tenantId === invitation.tenantId && user.email.toLowerCase() === invitation.email,
    )
    if (member) {
      member.status = 'active'
      member.name = name.trim() || member.name
    }
    state.tables.invitations = state.tables.invitations.filter((item) => item.token !== token)
    return startSession(db, userId, invitation.tenantId)
  },

  async switchTenant(token: string, tenantId: string) {
    await delay()
    const db = readDb()
    const { userId } = requireSession(db, token)
    if (!db.memberships.some((m) => m.userId === userId && m.tenantId === tenantId)) {
      throw new ApiError('forbidden', 'You do not have access to that workspace.')
    }
    db.sessions[token] = { userId, tenantId }
    writeDb(db)
    return buildSession(db, userId, tenantId, token)
  },

  async completeOnboarding(token: string, input: CompleteOnboardingInput) {
    await delay()
    const db = readDb()
    const { userId, tenantId } = requireSession(db, token)
    const tenant = db.tenants.find((t) => t.id === tenantId)
    const inviter = db.users.find((u) => u.id === userId)
    if (!tenant || !inviter) throw new ApiError('not_found', 'Workspace not found.')

    tenant.name = input.workspaceName.trim()
    tenant.currency = input.currency
    tenant.timezone = input.timezone
    tenant.onboardingCompleted = true

    for (const raw of input.inviteEmails) {
      const email = normalizeEmail(raw)
      const alreadyKnown =
        db.users.some((u) => u.email === email) || db.invitations.some((i) => i.email === email)
      if (alreadyKnown) continue
      db.invitations.push({
        token: newId('invite'),
        email,
        tenantId,
        role: 'salesperson',
        invitedByName: inviter.name,
      })
    }
    writeDb(db)
    return tenant
  },

  async logout(token: string) {
    await delay()
    const db = readDb()
    delete db.sessions[token]
    writeDb(db)
  },
}
