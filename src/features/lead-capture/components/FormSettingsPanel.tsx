import { ColorPicker } from '@/components/common/ColorPicker'
import { FormField } from '@/components/common/FormField'
import { Input, MultiSelect, Select, Switch, Textarea } from '@/components/ui'
import { useDirectory } from '@/features/team/hooks/use-team'
import type { LeadFormInput } from '@/types'
import { LeadDefaultsEditor } from './LeadDefaultsEditor'

export type FormErrors = Record<string, string>

/** Everything about a form except its fields: wording, after-submit behaviour, routing and style. */
export function FormSettingsPanel({ draft, errors, onChange }: { draft: LeadFormInput; errors: FormErrors; onChange: (next: LeadFormInput) => void }) {
  const directory = useDirectory()
  const set = (patch: Partial<LeadFormInput>) => onChange({ ...draft, ...patch })

  return (
    <div className="space-y-8">
      <section className="space-y-4" aria-labelledby="form-basics">
        <h3 id="form-basics" className="text-sm font-semibold">Form</h3>
        <FormField id="form-name" label="Form name" required error={errors.name}>
          {(control) => <Input {...control} value={draft.name} onChange={(event) => set({ name: event.target.value })} />}
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="form-submit" label="Button text" required error={errors.submitLabel}>
            {(control) => <Input {...control} value={draft.submitLabel} onChange={(event) => set({ submitLabel: event.target.value })} />}
          </FormField>
          <FormField id="form-redirect" label="Redirect after submit" hint="Optional. Leave empty to show the message." error={errors.redirectUrl}>
            {(control) => <Input {...control} type="url" placeholder="https://" value={draft.redirectUrl ?? ''} onChange={(event) => set({ redirectUrl: event.target.value || null })} />}
          </FormField>
        </div>
        <FormField id="form-success" label="Thank-you message" required error={errors.successMessage}>
          {(control) => <Textarea {...control} rows={2} value={draft.successMessage} onChange={(event) => set({ successMessage: event.target.value })} />}
        </FormField>
        <FormField id="form-consent" label="Consent checkbox text" hint="Leave empty for no checkbox.">
          {(control) => <Input {...control} value={draft.consentText ?? ''} onChange={(event) => set({ consentText: event.target.value || null })} />}
        </FormField>
        <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
          <div>
            <label htmlFor="form-spam" className="text-sm font-medium">Spam protection</label>
            <p className="text-sm text-muted-foreground">A hidden honeypot field catches bots. Simulated here.</p>
          </div>
          <Switch id="form-spam" checked={draft.spamProtection} onCheckedChange={(spamProtection) => set({ spamProtection })} />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="form-routing">
        <h3 id="form-routing" className="text-sm font-semibold">Where new leads go</h3>
        <LeadDefaultsEditor idPrefix="form" value={draft.defaults} onChange={(defaults) => set({ defaults })} error={errors.defaults} />
        <FormField id="form-notify" label="Notify on submission">
          {(control) => (
            <MultiSelect
              id={control.id}
              aria-label="People to notify"
              value={draft.notifyUserIds}
              onValueChange={(notifyUserIds) => set({ notifyUserIds })}
              options={(directory.data ?? []).filter((user) => user.status === 'active').map((user) => ({ value: user.id, label: user.name }))}
              placeholder="Choose people"
            />
          )}
        </FormField>
      </section>

      <section className="space-y-4" aria-labelledby="form-style">
        <h3 id="form-style" className="text-sm font-semibold">Style</h3>
        <ColorPicker label="Accent color" value={draft.style.accent} onChange={(accent) => set({ style: { ...draft.style, accent } })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="form-theme" label="Theme">
            {(control) => (
              <Select {...control} value={draft.style.theme} onValueChange={(theme) => set({ style: { ...draft.style, theme: theme as 'light' | 'dark' } })} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
            )}
          </FormField>
          <div className="flex items-end justify-between gap-3 pb-2">
            <label htmlFor="form-rounded" className="text-sm font-medium">Rounded corners</label>
            <Switch id="form-rounded" checked={draft.style.rounded} onCheckedChange={(rounded) => set({ style: { ...draft.style, rounded } })} />
          </div>
        </div>
      </section>
    </div>
  )
}
