import type { MockAuthDb, MockMembership, MockUserRecord } from './auth-db'

export const DEMO_PASSWORD = 'password123'
export const DEMO_INVITE_TOKEN = 'demo-invite'

export const ACME_TENANT_ID = 'tenant-acme'
export const NORTHWIND_TENANT_ID = 'tenant-northwind'

const SEEDED_AT = '2026-01-05T09:00:00.000Z'

const demoUsers: Array<Omit<MockUserRecord, 'password'> & { role: MockMembership['role'] }> = [
  {
    id: 'user-priya',
    name: 'Priya Sharma',
    email: 'super@leadflow.test',
    role: 'super_admin',
    teamId: null,
  },
  {
    id: 'user-arjun',
    name: 'Arjun Mehta',
    email: 'admin@leadflow.test',
    role: 'admin',
    teamId: null,
  },
  {
    id: 'user-neha',
    name: 'Neha Iyer',
    email: 'manager@leadflow.test',
    role: 'manager',
    teamId: null,
  },
  {
    id: 'user-rahul',
    name: 'Rahul Verma',
    email: 'teamlead@leadflow.test',
    role: 'team_leader',
    teamId: 'team-north',
  },
  {
    id: 'user-ananya',
    name: 'Ananya Singh',
    email: 'sales@leadflow.test',
    role: 'salesperson',
    teamId: 'team-north',
  },
]

/** Two onboarded workspaces; every demo user belongs to both so the switcher is always usable. */
export function createSeedAuthDb(): MockAuthDb {
  const tenants = [
    {
      id: ACME_TENANT_ID,
      name: 'Acme Digital',
      slug: 'acme-digital',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      onboardingCompleted: true,
      createdAt: SEEDED_AT,
    },
    {
      id: NORTHWIND_TENANT_ID,
      name: 'Northwind Sales',
      slug: 'northwind-sales',
      currency: 'AED',
      timezone: 'Asia/Dubai',
      onboardingCompleted: true,
      createdAt: SEEDED_AT,
    },
  ]

  return {
    tenants,
    users: demoUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      teamId: user.teamId,
      password: DEMO_PASSWORD,
    })),
    memberships: demoUsers.flatMap((user) =>
      tenants.map((tenant) => ({ userId: user.id, tenantId: tenant.id, role: user.role })),
    ),
    invitations: [
      {
        token: DEMO_INVITE_TOKEN,
        email: 'newhire@leadflow.test',
        tenantId: ACME_TENANT_ID,
        role: 'salesperson',
        invitedByName: 'Arjun Mehta',
      },
    ],
    sessions: {},
  }
}
