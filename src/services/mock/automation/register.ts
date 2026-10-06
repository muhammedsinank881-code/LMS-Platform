import { setRequestHook } from '../core/context'
import { saveWithRescore } from '../resources/leads/changes'
import { handleEvent } from './engine'
import { subscribe } from './event-bus'
import { tickAutomations } from './scheduler'

let registered = false

/**
 * Wires the engines to the event bus: the automation engine runs matching automations, scoring
 * re-scores a lead when an engagement signal arrives, and the scheduler ticks before each request.
 */
export function registerAutomationEngine(): void {
  if (registered) return
  registered = true
  subscribe((ctx, event) => {
    if (event.type !== 'engagement' || event.entity.kind !== 'lead') return
    const lead = ctx.db.find('leads', event.entity.id)
    if (lead) saveWithRescore(ctx, lead, lead)
  })
  subscribe(handleEvent)
  setRequestHook((ctx) => tickAutomations(ctx))
}
