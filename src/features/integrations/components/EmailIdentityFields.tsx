import { FormField } from '@/components/common/FormField'
import { Input, Switch, Textarea } from '@/components/ui'
import { EMAIL_PATTERN, type EmailIdentity } from '../lib/email-identity'


/** Sender name and address, signature and tracking. Used by the connect flow and the manage drawer. */
export function EmailIdentityFields({ value, onChange }: { value: EmailIdentity; onChange: (next: EmailIdentity) => void }) {
  const set = (patch: Partial<EmailIdentity>) => onChange({ ...value, ...patch })
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="email-from-name" label="Sender name" required error={value.fromName.trim() ? undefined : 'Enter a sender name'}>
          {(control) => <Input {...control} value={value.fromName} onChange={(event) => set({ fromName: event.target.value })} />}
        </FormField>
        <FormField id="email-from" label="Sending address" required error={value.fromEmail && !EMAIL_PATTERN.test(value.fromEmail) ? 'Enter a valid email address' : undefined}>
          {(control) => <Input {...control} type="email" value={value.fromEmail} onChange={(event) => set({ fromEmail: event.target.value })} />}
        </FormField>
      </div>
      <FormField id="email-signature" label="Signature" hint="Added to the end of every email you send from the CRM.">
        {(control) => <Textarea {...control} rows={3} value={value.signature} onChange={(event) => set({ signature: event.target.value })} />}
      </FormField>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3"><label htmlFor="track-opens" className="text-sm">Track opens</label><Switch id="track-opens" checked={value.trackOpens} onCheckedChange={(trackOpens) => set({ trackOpens })} /></div>
        <div className="flex items-center justify-between gap-3"><label htmlFor="track-clicks" className="text-sm">Track link clicks</label><Switch id="track-clicks" checked={value.trackClicks} onCheckedChange={(trackClicks) => set({ trackClicks })} /></div>
      </div>
    </div>
  )
}
