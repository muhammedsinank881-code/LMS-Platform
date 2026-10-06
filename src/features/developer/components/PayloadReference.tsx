import { CopyButton } from '@/components/common/CopyButton'
import { samplePayload } from '@/lib/webhooks/payload'
import { WEBHOOK_EVENTS } from '@/types'

/** An example body for every event, each with a copy button. Collapsed until opened. */
export function PayloadReference() {
  return (
    <section aria-labelledby="payload-reference" className="space-y-2">
      <h3 id="payload-reference" className="text-sm font-semibold">Payload reference</h3>
      <p className="text-sm text-muted-foreground">Every delivery is a JSON object with an id, a type, a timestamp and the event data.</p>
      <div className="divide-y divide-border rounded-md border border-border">
        {WEBHOOK_EVENTS.map((event) => {
          const json = JSON.stringify(samplePayload(event), null, 2)
          return (
            <details key={event} className="group p-3">
              <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="font-mono">{event}</span>
                <span aria-hidden="true" className="text-muted-foreground group-open:rotate-90">›</span>
              </summary>
              <div className="mt-2 space-y-2">
                <div className="flex justify-end"><CopyButton value={json} label={`Copy ${event} payload`} /></div>
                <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs">{json}</pre>
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}
