import { useMemo } from 'react'
import type { FilterFieldConfig, FilterFieldOption } from '@/components/common/filter-builder'
import {
  allowedActionTypes,
  AUTOMATION_FIELDS,
  lookupsFromMaps,
  type FieldOptions,
  type Lookups,
  type ValidationRefs,
} from '@/lib/automation'
import { useCampaigns } from '@/features/campaigns/hooks/use-campaigns'
import { usePipelines } from '@/features/pipeline/hooks/use-pipelines'
import { useStatuses, useSources } from '@/features/settings/hooks/use-lead-config'
import { useCustomFields, useTags } from '@/features/settings/hooks/use-settings'
import { useTemplates } from '@/features/inbox/hooks/use-templates'
import { useDirectory, useTeams } from '@/features/team/hooks/use-team'
import { usePermission } from '@/hooks/use-permission'
import { CAMPAIGN_PLATFORMS, PRIORITIES, QUALIFICATION_STATUSES, ROLES, SCORE_CATEGORIES, LEAD_TYPES } from '@/types'

const label = (value: string) => value.replaceAll('_', ' ').replace(/^\w/, (c) => c.toUpperCase())
const fromList = (list: readonly string[]): FilterFieldOption[] => list.map((v) => ({ value: v, label: label(v) }))

export interface AutomationOptions {
  users: FilterFieldOption[]
  teams: FilterFieldOption[]
  statuses: FilterFieldOption[]
  sources: FilterFieldOption[]
  whatsappTemplates: FilterFieldOption[]
  emailTemplates: FilterFieldOption[]
  pipelines: FilterFieldOption[]
  stages: FilterFieldOption[]
  /** Which pipeline each stage belongs to. */
  stagePipeline: Record<string, string>
  tags: FilterFieldOption[]
  /** `custom.<key>` ids with their labels, for the "set a field" action. */
  customFields: FilterFieldOption[]
}

export interface AutomationRefs {
  ready: boolean
  lookups: Lookups
  refs: ValidationRefs
  options: AutomationOptions
  /** Field configs for condition rows, including this workspace's custom fields. */
  fieldConfigs: FilterFieldConfig[]
}

/** Everything the builder needs from the workspace: pickers, names for summaries, valid ids. */
export function useAutomationRefs(): AutomationRefs {
  const statuses = useStatuses()
  const sources = useSources()
  const directory = useDirectory()
  const teams = useTeams()
  const templates = useTemplates()
  const pipelines = usePipelines()
  const tags = useTags()
  const customFields = useCustomFields()
  const campaigns = useCampaigns({ pageSize: 100 })
  const { can } = usePermission()

  return useMemo(() => {
    const users = directory.data ?? []
    const teamRows = teams.data ?? []
    const statusRows = statuses.data ?? []
    const sourceRows = sources.data ?? []
    const templateRows = (templates.data ?? []).filter((t) => t.status === 'approved')
    const pipelineRows = pipelines.data ?? []
    const stageRows = pipelineRows.flatMap((p) => p.stages.map((s) => ({ ...s, pipelineName: p.name })))
    const custom = (customFields.data ?? []).filter((f) => f.entity === 'lead' && !f.archived)

    const opt = <T extends { id: string; name: string }>(rows: T[]): FilterFieldOption[] =>
      rows.map((r) => ({ value: r.id, label: r.name }))
    const options: AutomationOptions = {
      users: opt(users),
      teams: opt(teamRows),
      statuses: opt([...statusRows].sort((a, b) => a.order - b.order)),
      sources: opt(sourceRows),
      whatsappTemplates: opt(templateRows.filter((t) => t.channel === 'whatsapp')),
      emailTemplates: opt(templateRows.filter((t) => t.channel === 'email')),
      pipelines: opt(pipelineRows),
      stages: stageRows.map((s) => ({ value: s.id, label: `${s.pipelineName} · ${s.name}` })),
      stagePipeline: Object.fromEntries(stageRows.map((s) => [s.id, s.pipelineId])),
      tags: (tags.data ?? []).map((t) => ({ value: t.name, label: t.name })),
      customFields: custom.map((f) => ({ value: `custom.${f.key}`, label: f.label })),
    }

    const byKey: Record<FieldOptions, FilterFieldOption[]> = {
      sources: options.sources,
      statuses: options.statuses,
      users: options.users,
      teams: options.teams,
      campaigns: opt(campaigns.data?.items ?? []),
      pipelines: options.pipelines,
      stages: options.stages,
      priorities: fromList(PRIORITIES),
      scoreCategories: fromList(SCORE_CATEGORIES),
      qualification: fromList(QUALIFICATION_STATUSES),
      leadTypes: fromList(LEAD_TYPES),
      roles: fromList(ROLES),
      platforms: fromList(CAMPAIGN_PLATFORMS),
      tags: options.tags,
    }
    const fieldConfigs: FilterFieldConfig[] = [
      ...AUTOMATION_FIELDS.map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        options: f.options ? byKey[f.options] : undefined,
      })),
      ...custom.map((f): FilterFieldConfig => ({
        id: `custom.${f.key}`,
        label: `${f.label} (custom)`,
        type:
          f.type === 'number' || f.type === 'currency'
            ? 'number'
            : f.type === 'boolean'
              ? 'boolean'
              : f.type === 'dropdown'
                ? 'select'
                : f.type === 'multiselect'
                  ? 'multi-select'
                  : f.type === 'date'
                    ? 'date'
                    : 'text',
        options: f.options?.map((o) => ({ value: o, label: o })),
      })),
    ]

    const names = <T extends { id: string; name: string }>(rows: T[]) => new Map(rows.map((r) => [r.id, r.name]))
    const ids = <T extends { id: string }>(rows: T[]) => new Set(rows.map((r) => r.id))
    return {
      ready: [statuses, sources, directory, teams, templates, pipelines].every((q) => q.isSuccess),
      lookups: lookupsFromMaps({
        source: names(sourceRows),
        status: names(statusRows),
        user: names(users),
        team: names(teamRows),
        template: names(templates.data ?? []),
        campaign: names(campaigns.data?.items ?? []),
        pipeline: names(pipelineRows),
        stage: new Map(stageRows.map((s) => [s.id, s.name])),
      }),
      refs: {
        users: ids(users),
        teams: ids(teamRows),
        templates: ids(templates.data ?? []),
        statuses: ids(statusRows),
        sources: ids(sourceRows),
        pipelines: ids(pipelineRows),
        stages: ids(stageRows),
        customFieldKeys: custom.map((f) => f.key),
        allowedActions: allowedActionTypes(can),
      },
      options,
      fieldConfigs,
    }
  }, [statuses, sources, directory, teams, templates, pipelines, tags, customFields, campaigns, can])
}
