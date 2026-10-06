import { useMemo } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { FilterRow, defaultOperator, type FilterDraft, type FilterFieldConfig } from '@/components/common/filter-builder'
import { FormField } from '@/components/common/FormField'
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Input,
  Select,
  Switch,
  toast,
} from '@/components/ui'
import { describeScoringRule } from '@/lib/scoring'
import { ENGAGEMENT_SIGNALS, type FilterCondition, type ScoringRule } from '@/types'
import { useAutomationRefs } from '@/features/automations/hooks/use-automation-refs'
import { scoringRuleSchema, type ScoringRuleValues } from '../../schemas'
import { useCreateScoringRule, useUpdateScoringRule } from '../../hooks/use-settings'

const SIGNALS = ENGAGEMENT_SIGNALS.map((signal) => ({ value: `engagement.${signal}`, label: signal.replace(/([A-Z])/g, ' $1').replace(/^\w/, (c) => c.toUpperCase()) }))

const toValues = (rule: ScoringRule | null): ScoringRuleValues => ({
  name: rule?.name ?? '',
  conditions: (rule?.conditions ?? []) as ScoringRuleValues['conditions'],
  isActive: rule?.isActive ?? true,
  points: rule?.points ?? 10,
  repeat: typeof rule?.maxApplications === 'number',
  repeatField: rule?.repeatField ?? SIGNALS[0].value,
  maxApplications: typeof rule?.maxApplications === 'number' ? rule.maxApplications : 3,
})

/** Add or edit a scoring rule: conditions (all must match), points, and whether it repeats per signal. */
export function RuleDrawer({
  rule,
  open,
  onOpenChange,
}: {
  rule: ScoringRule | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const refs = useAutomationRefs()
  const create = useCreateScoringRule()
  const update = useUpdateScoringRule()
  const fields: FilterFieldConfig[] = useMemo(
    () =>
      refs.fieldConfigs.filter(
        (f) => f.id.startsWith('custom.') || f.id.startsWith('engagement.') || (!f.id.includes('.') && f.id !== 'teamId'),
      ),
    [refs.fieldConfigs],
  )
  const form = useForm<ScoringRuleValues>({
    resolver: zodResolver(scoringRuleSchema),
    defaultValues: toValues(rule),
  })
  const conditions = useFieldArray({ control: form.control, name: 'conditions' })
  const values = useWatch({ control: form.control })
  const preview = describeScoringRule(
    {
      conditions: (values.conditions ?? []) as FilterCondition[],
      points: Number.isFinite(values.points) ? (values.points ?? 0) : 0,
      maxApplications: values.repeat ? (values.maxApplications ?? 3) : 'once',
      repeatField: values.repeat ? (values.repeatField ?? null) : null,
    },
    refs.lookups,
  )
  const saving = create.isPending || update.isPending

  const submit = form.handleSubmit((raw) => {
    const { conditions: rows, repeat, ...rest } = raw
    const payload = {
      name: rest.name.trim(),
      isActive: rest.isActive,
      points: rest.points,
      conditions: rows as FilterCondition[],
      maxApplications: repeat ? rest.maxApplications : ('once' as const),
      repeatField: repeat ? rest.repeatField : null,
    }
    const done = { onSuccess: () => { toast.success(rule ? 'Rule saved' : 'Rule added'); onOpenChange(false) } }
    if (rule) update.mutate({ id: rule.id, patch: payload }, done)
    else create.mutate(payload, done)
  })

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent size="lg">
        <DrawerHeader>
          <DrawerTitle>{rule ? 'Edit scoring rule' : 'Add scoring rule'}</DrawerTitle>
          <DrawerDescription>Leads that meet every condition get the points.</DrawerDescription>
        </DrawerHeader>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <DrawerBody className="space-y-4">
            <FormField id="rule-name" label="Name" error={form.formState.errors.name?.message} required>
              {(control) => <Input {...control} {...form.register('name')} placeholder="e.g. Budget above ₹1,00,000" />}
            </FormField>
            <section className="space-y-2" aria-label="Conditions">
              <h3 className="text-sm font-medium">Conditions</h3>
              {conditions.fields.length === 0 ? <p className="text-sm text-muted-foreground">No conditions: the rule applies to every lead.</p> : null}
              {conditions.fields.map((field, index) => (
                <Controller
                  key={field.id}
                  control={form.control}
                  name={`conditions.${index}` as 'conditions.0'}
                  render={({ field: controlled }) => (
                    <FilterRow
                      fields={fields}
                      row={controlled.value as FilterDraft}
                      onChange={controlled.onChange}
                      onRemove={() => conditions.remove(index)}
                    />
                  )}
                />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => conditions.append({ field: fields[0]?.id ?? 'sourceId', operator: defaultOperator(fields[0]?.type ?? 'select') } as never)}>
                <Plus />
                Add condition
              </Button>
            </section>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="rule-points" label="Points" hint="Negative points lower the score." error={form.formState.errors.points?.message} required>
                {(control) => <Input {...control} type="number" {...form.register('points', { valueAsNumber: true })} />}
              </FormField>
              <div className="flex items-end gap-2 pb-2">
                <Controller control={form.control} name="isActive" render={({ field }) => <Switch id="rule-active" checked={field.value} onCheckedChange={field.onChange} />} />
                <label htmlFor="rule-active" className="text-sm font-medium">
                  Rule is on
                </label>
              </div>
            </div>
            <section className="space-y-2 rounded-md border border-border p-3" aria-label="How often it applies">
              <div className="flex items-center gap-2">
                <Controller control={form.control} name="repeat" render={({ field }) => <Switch id="rule-repeat" checked={field.value} onCheckedChange={field.onChange} />} />
                <label htmlFor="rule-repeat" className="text-sm font-medium">
                  Repeat for every signal
                </label>
              </div>
              {values.repeat ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField id="rule-signal" label="Count this signal" error={form.formState.errors.repeatField?.message}>
                    {(control) => (
                      <Controller control={form.control} name="repeatField" render={({ field }) => <Select id={control.id} options={SIGNALS} value={field.value} onValueChange={field.onChange} />} />
                    )}
                  </FormField>
                  <FormField id="rule-max" label="Apply up to (times)" error={form.formState.errors.maxApplications?.message}>
                    {(control) => <Input {...control} type="number" min={1} max={20} {...form.register('maxApplications', { valueAsNumber: true })} />}
                  </FormField>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">The points apply once, however many times it happens.</p>
              )}
            </section>
            <p className="rounded-md bg-muted p-3 text-sm" aria-live="polite">
              <span className="font-medium">Preview: </span>
              {preview}
            </p>
          </DrawerBody>
          <DrawerFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {rule ? 'Save rule' : 'Add rule'}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
