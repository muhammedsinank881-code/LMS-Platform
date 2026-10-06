import type { ApiScope } from '@/types'

const ROWS: Array<{ resource: string; label: string; scopes: Array<{ scope: ApiScope; label: string }> }> = [
  { resource: 'leads', label: 'Leads', scopes: [{ scope: 'leads:read', label: 'Read' }, { scope: 'leads:write', label: 'Write' }] },
  { resource: 'deals', label: 'Deals', scopes: [{ scope: 'deals:read', label: 'Read' }, { scope: 'deals:write', label: 'Write' }] },
  { resource: 'followups', label: 'Follow-ups', scopes: [{ scope: 'followups:read', label: 'Read' }, { scope: 'followups:write', label: 'Write' }] },
  { resource: 'webhooks', label: 'Webhooks', scopes: [{ scope: 'webhooks:manage', label: 'Manage' }] },
]

/** Resource by read/write checkboxes. Write does not imply read, so each is chosen on purpose. */
export function ScopePicker({ value, onChange, error }: { value: ApiScope[]; onChange: (next: ApiScope[]) => void; error?: string }) {
  const toggle = (scope: ApiScope, on: boolean) => onChange(on ? [...value, scope] : value.filter((item) => item !== scope))
  return (
    <fieldset className="space-y-2" aria-describedby={error ? 'scopes-error' : undefined}>
      <legend className="text-sm font-medium">Scopes</legend>
      <div className="divide-y divide-border rounded-md border border-border">
        {ROWS.map((row) => (
          <div key={row.resource} className="flex min-h-11 items-center justify-between gap-3 px-3 py-2">
            <span className="text-sm">{row.label}</span>
            <div className="flex gap-4">
              {row.scopes.map(({ scope, label }) => (
                <label key={scope} className="flex min-h-11 items-center gap-2 text-sm sm:min-h-0">
                  <input type="checkbox" aria-label={`${label} ${row.label}`} className="h-4 w-4 accent-[var(--primary)]" checked={value.includes(scope)} onChange={(event) => toggle(scope, event.target.checked)} />
                  <span aria-hidden="true">{label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error ? <p id="scopes-error" role="alert" className="text-sm text-destructive">{error}</p> : null}
    </fieldset>
  )
}
