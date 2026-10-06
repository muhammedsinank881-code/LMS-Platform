import type { AutomationId, ChainInfo, DomainEvent } from '@/types'

export const MAX_CHAIN_DEPTH = 5
export const RATE_LIMIT_PER_HOUR = 5
export const AUTO_DISABLE_AFTER = 5
const HOUR_MS = 3_600_000

export const idempotencyKey = (automationId: AutomationId, entityId: string, eventId: string) =>
  `${automationId}:${entityId}:${eventId}`

/** Why this event must not run the automation, or null when it may. */
export function chainBlock(event: DomainEvent, automationId: AutomationId): string | null {
  if (event.chain.depth > MAX_CHAIN_DEPTH) {
    return `Stopped: the chain reached the maximum depth of ${MAX_CHAIN_DEPTH}.`
  }
  if (event.chain.causedBy.includes(automationId)) {
    return 'Stopped: this automation caused the event itself (loop prevention).'
  }
  return null
}

/** The chain an automation's own writes carry. */
export function childChain(chain: ChainInfo, automationId: AutomationId): ChainInfo {
  return {
    chainId: chain.chainId,
    depth: chain.depth + 1,
    causedBy: [...chain.causedBy, automationId],
  }
}

/** True when the entity already had the maximum number of runs of this automation in the last hour. */
export function isRateLimited(
  recent: ReadonlyArray<{ startedAt: string }>,
  now: Date,
  limit: number = RATE_LIMIT_PER_HOUR,
): boolean {
  const since = now.getTime() - HOUR_MS
  return recent.filter((run) => Date.parse(run.startedAt) > since).length >= limit
}

export const shouldAutoDisable = (consecutiveFailures: number) =>
  consecutiveFailures >= AUTO_DISABLE_AFTER
