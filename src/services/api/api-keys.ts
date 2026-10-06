import type { ApiKey, ApiKeyCreated, ApiKeyUsageSummary, CreateApiKeyInput } from '@/types'

/** Needs the API keys settings section. The full secret is returned once, by create and rotate. */
export interface ApiKeysApiClient {
  list(): Promise<ApiKey[]>
  summary(): Promise<ApiKeyUsageSummary>
  create(input: CreateApiKeyInput): Promise<ApiKeyCreated>
  revoke(id: string): Promise<ApiKey>
  /** Issues a replacement; the old key keeps working for `graceHours` (0 revokes it at once). */
  rotate(id: string, graceHours: number): Promise<ApiKeyCreated>
}
