import { FormField } from '@/components/common/FormField'
import { MultiSelect, Select } from '@/components/ui'
import { useCampaigns } from '@/features/campaigns/hooks/use-campaigns'
import { useSources, useStatuses } from '@/features/settings/hooks/use-lead-config'
import { useTags } from '@/features/settings/hooks/use-settings'
import { useDirectory } from '@/features/team/hooks/use-team'
import { ASSIGN_MODES, type AssignMode, type LeadDefaults } from '@/types'

const AUTO = '__auto'

const MODE_LABEL: Record<AssignMode, string> = {
  rules: 'Use the assignment rules',
  round_robin: 'Round-robin across sellers',
  specific_user: 'A specific person',
}

/** Source, campaign, status, tags and assignment for leads that arrive through a form or an integration. */
export function LeadDefaultsEditor({
  value,
  onChange,
  idPrefix,
  disabled,
  error,
}: {
  value: LeadDefaults
  onChange: (next: LeadDefaults) => void
  idPrefix: string
  disabled?: boolean
  error?: string
}) {
  const sources = useSources()
  const statuses = useStatuses()
  const tags = useTags()
  const campaigns = useCampaigns({ pageSize: 100 })
  const directory = useDirectory()
  const set = (patch: Partial<LeadDefaults>) => onChange({ ...value, ...patch })
  const orAuto = (label: string, options: Array<{ value: string; label: string }>) => [{ value: AUTO, label }, ...options]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField id={`${idPrefix}-source`} label="Lead source" hint="Leave on automatic to file by provider.">
        {(control) => (
          <Select
            {...control}
            disabled={disabled}
            value={value.sourceId ?? AUTO}
            onValueChange={(next) => set({ sourceId: next === AUTO ? null : next })}
            options={orAuto('Automatic', (sources.data ?? []).filter((s) => s.isActive).map((s) => ({ value: s.id, label: s.name })))}
          />
        )}
      </FormField>
      <FormField id={`${idPrefix}-campaign`} label="Campaign" hint="A matching utm_campaign overrides this.">
        {(control) => (
          <Select
            {...control}
            disabled={disabled}
            value={value.campaignId ?? AUTO}
            onValueChange={(next) => set({ campaignId: next === AUTO ? null : next })}
            options={orAuto('None', (campaigns.data?.items ?? []).filter((c) => !c.archivedAt).map((c) => ({ value: c.id, label: c.name })))}
          />
        )}
      </FormField>
      <FormField id={`${idPrefix}-status`} label="Starting status">
        {(control) => (
          <Select
            {...control}
            disabled={disabled}
            value={value.statusId ?? AUTO}
            onValueChange={(next) => set({ statusId: next === AUTO ? null : next })}
            options={orAuto('Workspace default', (statuses.data ?? []).filter((s) => s.type === 'open').map((s) => ({ value: s.id, label: s.name })))}
          />
        )}
      </FormField>
      <FormField id={`${idPrefix}-tags`} label="Tags">
        {(control) => (
          <MultiSelect
            id={control.id}
            aria-label="Tags"
            disabled={disabled}
            value={value.tags}
            onValueChange={(next) => set({ tags: next })}
            options={(tags.data ?? []).map((tag) => ({ value: tag.name, label: tag.name }))}
            placeholder="Add tags"
          />
        )}
      </FormField>
      <FormField id={`${idPrefix}-assign`} label="Assign to">
        {(control) => (
          <Select
            {...control}
            disabled={disabled}
            value={value.assignMode}
            onValueChange={(next) => set({ assignMode: next as AssignMode, assignUserId: next === 'specific_user' ? value.assignUserId : null })}
            options={ASSIGN_MODES.map((mode) => ({ value: mode, label: MODE_LABEL[mode] }))}
          />
        )}
      </FormField>
      {value.assignMode === 'specific_user' ? (
        <FormField id={`${idPrefix}-assignee`} label="Person" error={error} required>
          {(control) => (
            <Select
              {...control}
              disabled={disabled}
              value={value.assignUserId ?? undefined}
              placeholder="Choose a person"
              onValueChange={(next) => set({ assignUserId: next })}
              options={(directory.data ?? []).filter((user) => user.status === 'active').map((user) => ({ value: user.id, label: user.name }))}
            />
          )}
        </FormField>
      ) : null}
    </div>
  )
}
