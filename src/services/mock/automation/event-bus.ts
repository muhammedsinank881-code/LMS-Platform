import { childChain } from '@/lib/automation'
import type { AutomationTriggerType, ChainInfo, DomainEvent, EntityRef, EventData } from '@/types'
import type { RequestContext } from '../core/context'
import { newId } from '../core/util'

/**
 * In-memory domain event bus. Mutations `emit` after their write; the automation engine and the
 * scoring engine subscribe. A real backend would write the event to an outbox in the same
 * transaction and let workers consume it; the contract (event in, handlers out) is the same.
 */
export type EventHandler = (ctx: RequestContext, event: DomainEvent) => void

const handlers: EventHandler[] = []

export function subscribe(handler: EventHandler): () => void {
  handlers.push(handler)
  return () => {
    const index = handlers.indexOf(handler)
    if (index >= 0) handlers.splice(index, 1)
  }
}

export interface EmitInput {
  type: AutomationTriggerType | 'engagement' | 'lead_converted'
  entity: EntityRef
  data?: EventData
  /** Stable id for time-based events, so a repeat is recognised as a duplicate. */
  id?: string
  /** Start a fresh chain even inside an automation (the scheduler does this). */
  chain?: ChainInfo
}

/** The chain an event emitted from `ctx` belongs to. Writes by an automation extend its chain. */
export function chainFor(ctx: RequestContext): ChainInfo {
  return ctx.automation
    ? childChain(ctx.automation.chain, ctx.automation.id)
    : { chainId: newId('chain'), depth: 0, causedBy: [] }
}

/** Publishes an event. Dry runs emit nothing, so a test run can never trigger real work. */
export function emit(ctx: RequestContext, input: EmitInput): DomainEvent | null {
  if (ctx.dryRun) return null
  const event: DomainEvent = {
    id: input.id ?? newId('evt'),
    tenantId: ctx.tenantId,
    type: input.type,
    entity: input.entity,
    occurredAt: ctx.timestamp,
    data: input.data ?? {},
    chain: input.chain ?? chainFor(ctx),
  }
  for (const handler of [...handlers]) handler(ctx, event)
  return event
}
