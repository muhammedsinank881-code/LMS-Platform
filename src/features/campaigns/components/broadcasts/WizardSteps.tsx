import { Info } from 'lucide-react'
import { FormField } from '@/components/common/FormField'
import { Badge, DatePicker, Input, Select, Skeleton, TimePicker } from '@/components/ui'
import { useSavedViews } from '@/features/saved-views/hooks/use-saved-views'
import { useTags } from '@/features/settings/hooks/use-settings'
import {
  TEXT_PREFIX,
  defaultVariableMap,
  fixedText,
  isFixedText,
  validateVariableMap,
} from '@/lib/inbox/broadcast-variables'
import {
  CORE_TEMPLATE_VARIABLES,
  TEMPLATE_VARIABLE_LABEL,
  customVariable,
} from '@/lib/inbox/template-variables'
import type { AudienceCount, BroadcastAudience, BroadcastPreview, MessageTemplate } from '@/types'
import type { WizardState } from '../../lib/broadcast-wizard'

type Patch = (patch: Partial<WizardState>) => void

export function StepTemplate({
  templates,
  state,
  customKeys,
  onChange,
}: {
  templates: MessageTemplate[]
  state: WizardState
  customKeys: string[]
  onChange: Patch
}) {
  if (templates.length === 0) {
    return <p className="text-sm text-muted-foreground">No approved WhatsApp templates yet. Get one approved in Settings, then come back.</p>
  }
  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Approved WhatsApp templates</legend>
      {templates.map((template) => (
        <label
          key={template.id}
          className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 has-[:checked]:border-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
        >
          <input
            type="radio"
            name="broadcast-template"
            className="mt-1"
            checked={state.templateId === template.id}
            onChange={() =>
              onChange({ templateId: template.id, variableMap: defaultVariableMap(template.variables, customKeys) })
            }
          />
          <span className="min-w-0 space-y-1">
            <span className="flex items-center gap-2 text-sm font-medium">
              {template.name}
              <Badge size="sm" tone="neutral">{template.category}</Badge>
            </span>
            <span className="line-clamp-2 text-xs text-muted-foreground">{template.body}</span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}

const audienceKey = (audience: BroadcastAudience | null) =>
  !audience ? 'none' : audience.kind === 'tag' ? `tag:${audience.tag}` : `view:${audience.viewId}`

export function StepAudience({
  state,
  count,
  countLoading,
  onChange,
}: {
  state: WizardState
  count: AudienceCount | undefined
  countLoading: boolean
  onChange: Patch
}) {
  const tags = useTags()
  const views = useSavedViews('leads')
  const options = [
    ...(tags.data ?? []).map((tag) => ({ value: `tag:${tag.name}`, label: `Tag: ${tag.name}` })),
    ...(views.data ?? []).map((view) => ({ value: `view:${view.id}`, label: `Saved view: ${view.name}` })),
  ]
  const choose = (value: string) => {
    const [kind, ...rest] = value.split(':')
    const ref = rest.join(':')
    onChange({ audience: kind === 'tag' ? { kind: 'tag', tag: ref } : { kind: 'view', viewId: ref } })
  }
  return (
    <div className="space-y-4">
      <FormField id="bc-audience" label="Audience" required hint="A saved view of leads, or everyone with a tag.">
        {(c) => (
          <Select id={c.id} placeholder="Choose an audience" value={state.audience ? audienceKey(state.audience) : undefined} onValueChange={choose} options={options} />
        )}
      </FormField>
      {state.audience ? (
        countLoading || !count ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Audience size">
            <Stat label="In audience" value={count.total} />
            <Stat label="Opted out (excluded)" value={count.optedOut} />
            <Stat label="No phone number" value={count.missingNumber} />
            <Stat label="Will receive" value={count.eligible} strong />
          </dl>
        )
      ) : null}
    </div>
  )
}

function Stat({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="rounded-md border border-border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={strong ? 'text-xl font-semibold tabular-nums' : 'text-lg tabular-nums'}>{value}</dd>
    </div>
  )
}

export function StepVariables({
  template,
  state,
  customKeys,
  onChange,
}: {
  template: MessageTemplate | undefined
  state: WizardState
  customKeys: string[]
  onChange: Patch
}) {
  const variables = template?.variables ?? []
  const errors = validateVariableMap(variables, state.variableMap, customKeys)
  const fieldOptions = [
    ...CORE_TEMPLATE_VARIABLES.map((name) => ({ value: name, label: TEMPLATE_VARIABLE_LABEL[name] })),
    ...customKeys.map((key) => ({ value: customVariable(key), label: `Custom: ${key}` })),
    { value: TEXT_PREFIX, label: 'Fixed text' },
  ]
  if (variables.length === 0) return <p className="text-sm text-muted-foreground">This template has no variables to map.</p>
  const set = (name: string, mapping: string) => onChange({ variableMap: { ...state.variableMap, [name]: mapping } })
  return (
    <div className="space-y-4">
      {variables.map((name) => {
        const mapping = state.variableMap[name] ?? ''
        const fixed = isFixedText(mapping)
        return (
          <div key={name} className="grid gap-2 sm:grid-cols-2">
            <FormField id={`var-${name}`} label={`{{${name}}} reads from`} error={errors[name] && !fixed ? errors[name] : undefined}>
              {(c) => (
                <Select id={c.id} value={fixed ? TEXT_PREFIX : mapping || undefined} placeholder="Choose a field" onValueChange={(v) => set(name, v)} options={fieldOptions} />
              )}
            </FormField>
            {fixed ? (
              <FormField id={`text-${name}`} label="Text to send" error={errors[name]}>
                {(c) => <Input id={c.id} invalid={c.invalid} value={fixedText(mapping)} onChange={(e) => set(name, `${TEXT_PREFIX}${e.target.value}`)} />}
              </FormField>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function StepPreview({
  preview,
  isLoading,
  template,
}: {
  preview: BroadcastPreview | undefined
  isLoading: boolean
  template: MessageTemplate | undefined
}) {
  if (isLoading || !preview) return <Skeleton className="h-28 w-full" />
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Preview for <span className="font-medium text-foreground">{preview.leadName}</span>. Every lead gets their own values.
      </p>
      <div className="max-w-sm rounded-lg rounded-tl-none bg-success/10 p-3 text-sm whitespace-pre-wrap" role="note" aria-label="Message preview">
        {template?.header ? <p className="mb-1 font-semibold">{template.header}</p> : null}
        {preview.text}
        {template?.footer ? <p className="mt-2 text-xs text-muted-foreground">{template.footer}</p> : null}
      </div>
    </div>
  )
}

export function StepSchedule({ state, onChange }: { state: WizardState; onChange: Patch }) {
  return (
    <div className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">When should it go out?</legend>
        {(['now', 'later'] as const).map((mode) => (
          <label key={mode} className="flex items-center gap-2 text-sm">
            <input type="radio" name="bc-when" checked={state.mode === mode} onChange={() => onChange({ mode })} />
            {mode === 'now' ? 'Send now' : 'Schedule for later'}
          </label>
        ))}
      </fieldset>
      {state.mode === 'later' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="bc-date" label="Date" required>
            {(c) => <DatePicker id={c.id} value={state.date} onValueChange={(date) => onChange({ date })} />}
          </FormField>
          <FormField id="bc-time" label="Time" required>
            {(c) => <TimePicker id={c.id} value={state.time} onValueChange={(time) => onChange({ time })} />}
          </FormField>
        </div>
      ) : null}
    </div>
  )
}

export function StepConfirm({
  state,
  template,
  count,
  onChange,
}: {
  state: WizardState
  template: MessageTemplate | undefined
  count: AudienceCount | undefined
  onChange: Patch
}) {
  return (
    <div className="space-y-4">
      <FormField id="bc-name" label="Broadcast name" required>
        {(c) => <Input id={c.id} value={state.name} onChange={(e) => onChange({ name: e.target.value })} />}
      </FormField>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <Row label="Template" value={template?.name ?? ''} />
        <Row label="Recipients" value={String(count?.eligible ?? 0)} />
        <Row label="Excluded (opted out)" value={String(count?.optedOut ?? 0)} />
        <Row label="Sends" value={state.mode === 'now' ? 'Right away' : `${state.date} at ${state.time}`} />
      </dl>
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Sending is simulated in this version. Nothing is sent to WhatsApp, but conversations and timeline activities are created for each lead.
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
