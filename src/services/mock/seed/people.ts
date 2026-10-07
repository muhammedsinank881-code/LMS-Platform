import { ACME_TENANT_ID, NORTHWIND_TENANT_ID } from '../auth/auth-seed'
import type { Role, Team, User } from '@/types'
import { seedId, type SeedEnv } from './rng'

interface PersonSpec {
  id: string
  name: string
  email: string
  role: Role
  /** Slug of the team within the workspace, or null. */
  team: 'north' | 'south' | null
  language: string
  location: string
}

const ACME_PEOPLE: PersonSpec[] = [
  {
    id: 'user-priya',
    name: 'Priya Sharma',
    email: 'super@leadflow.test',
    role: 'super_admin',
    team: null,
    language: 'English',
    location: 'Mumbai',
  },
  {
    id: 'user-arjun',
    name: 'Arjun Mehta',
    email: 'admin@leadflow.test',
    role: 'admin',
    team: null,
    language: 'English',
    location: 'Mumbai',
  },
  {
    id: 'user-neha',
    name: 'Neha Iyer',
    email: 'manager@leadflow.test',
    role: 'manager',
    team: null,
    language: 'Tamil',
    location: 'Bengaluru',
  },
  {
    id: 'user-rahul',
    name: 'Rahul Verma',
    email: 'teamlead@leadflow.test',
    role: 'team_leader',
    team: 'north',
    language: 'Hindi',
    location: 'Delhi',
  },
  {
    id: 'user-ananya',
    name: 'Ananya Singh',
    email: 'sales@leadflow.test',
    role: 'salesperson',
    team: 'north',
    language: 'Hindi',
    location: 'Delhi',
  },
  {
    id: 'user-vikram',
    name: 'Vikram Joshi',
    email: 'vikram@leadflow.test',
    role: 'salesperson',
    team: 'north',
    language: 'Marathi',
    location: 'Pune',
  },
  {
    id: 'user-sneha',
    name: 'Sneha Reddy',
    email: 'sneha@leadflow.test',
    role: 'salesperson',
    team: 'south',
    language: 'Telugu',
    location: 'Hyderabad',
  },
  {
    id: 'user-karan',
    name: 'Karan Nair',
    email: 'karan@leadflow.test',
    role: 'team_leader',
    team: 'south',
    language: 'Malayalam',
    location: 'Kochi',
  },

  {
    id: 'user-mentor',
    name: 'Hasna PK',
    email: 'mentor@leadflow.test',
    role: 'mentor',
    team: null,
    language: 'English',
    location: 'Kochi',
  },
  {
    id: 'user-student',
    name: 'Sinan',
    email: 'student@leadflow.test',
    role: 'student',
    team: null,
    language: 'English',
    location: 'Kochi',
  },

]

// Northwind: the five demo accounts (they belong to both workspaces) in a single team.
const NORTHWIND_PEOPLE: PersonSpec[] = ACME_PEOPLE.slice(0, 5).map((person) => ({
  ...person,
  team: person.role === 'team_leader' || person.role === 'salesperson' ? 'north' : null,
  location:
    person.role === 'salesperson' || person.role === 'team_leader' ? 'Dubai' : person.location,
}))

export const SEED_TENANTS = [
  {
    tenantId: ACME_TENANT_ID,
    name: 'Acme Digital',
    key: 'acme',
    scale: 1,
    leadCounterBase: 10000,
    people: ACME_PEOPLE,
  },
  {
    tenantId: NORTHWIND_TENANT_ID,
    name: 'Northwind Sales',
    key: 'nw',
    scale: 0.2,
    leadCounterBase: 50000,
    people: NORTHWIND_PEOPLE,
  },
] as const

const TEAM_NAMES = { north: 'North Sales', south: 'South Sales' } as const
const TEAM_COLORS = { north: '#6366f1', south: '#14b8a6' } as const

export function teamIdFor(env: SeedEnv, slug: 'north' | 'south'): string {
  return seedId(env, 'team', slug)
}

export function buildPeople(
  env: SeedEnv,
  people: readonly PersonSpec[],
): { users: User[]; teams: Team[] } {
  const createdAt = new Date(env.now.getTime() - 200 * 86_400_000).toISOString()
  const users: User[] = people.map((person) => ({
    id: person.id,
    tenantId: env.tenantId,
    name: person.name,
    email: person.email,
    role: person.role,
    teamId: person.team ? teamIdFor(env, person.team) : null,
    language: person.language,
    location: person.location,
    workload: 0,
    status: 'active',
    phone: null,
    avatarUrl: null,
    timezone: 'Asia/Kolkata',
    lastActiveAt: env.now.toISOString(),
    createdAt,
  }))

  const slugs = [
    ...new Set(people.map((p) => p.team).filter((t): t is 'north' | 'south' => t !== null)),
  ]
  const teams: Team[] = slugs.map((slug) => ({
    id: teamIdFor(env, slug),
    tenantId: env.tenantId,
    name: TEAM_NAMES[slug],
    leaderId: people.find((p) => p.team === slug && p.role === 'team_leader')?.id ?? null,
    color: TEAM_COLORS[slug],
    createdAt,
  }))
  return { users, teams }
}

export type { PersonSpec }
