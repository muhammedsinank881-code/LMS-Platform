import { configure } from '@testing-library/react'
import { vi } from 'vitest'
import { ACME_TENANT_ID, actAs } from '@/services/mock/__tests__/helpers'
import { useAuthStore } from '@/store/auth-store'
import type { Role } from '@/types'

configure({ asyncUtilTimeout: 5000 })
vi.setConfig({ testTimeout: 30000 })

/** Signs in for both the mock backend and the auth store, like the real login does. */
export function signIn(userId: string, role: Role): void {
  actAs(userId)
  useAuthStore.setState({
    user: { id: userId, tenantId: ACME_TENANT_ID, name: 'Tester', email: 't@example.in', role, teamId: null, avatarUrl: null },
    tenant: { id: ACME_TENANT_ID, name: 'Acme', slug: 'acme', currency: 'INR', timezone: 'Asia/Kolkata', onboardingCompleted: true, createdAt: '2026-01-01T00:00:00.000Z' },
    tenants: [],
    token: 'test',
    intentionalSignOut: false,
  })
}

export function signOut(): void {
  useAuthStore.setState({ user: null, tenant: null, tenants: [], token: null, intentionalSignOut: false })
}

// Copying needs a clipboard. jsdom has none, so tests install a spy-able one.
export function stubClipboard(): { written: string[] } {
  const written: string[] = []
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: (text: string) => (written.push(text), Promise.resolve()) } })
  return { written }
}
