import type { FilterFieldConfig } from '@/components/common/filter-builder'
import type { DirectoryUser } from '@/services/api/team'
import { PRIORITIES, SCORE_CATEGORIES, type DealFilterField, type PipelineWithStages } from '@/types'

export function buildDealFilterFields(
  users: DirectoryUser[],
  pipelines: PipelineWithStages[],
  sources: { id: string; name: string }[],
  tags: { name: string }[],
): FilterFieldConfig<DealFilterField>[] {
  const stages = pipelines.flatMap((pipeline) => pipeline.stages)
  return [
    { id: 'ownerId', label: 'Owner', type: 'user', options: users.map((user) => ({ value: user.id, label: user.name })) },
    { id: 'pipelineId', label: 'Pipeline', type: 'select', options: pipelines.map((pipeline) => ({ value: pipeline.id, label: pipeline.name })) },
    { id: 'stageId', label: 'Stage', type: 'select', options: stages.map((stage) => ({ value: stage.id, label: stage.name })) },
    { id: 'sourceId', label: 'Source', type: 'select', options: sources.map((source) => ({ value: source.id, label: source.name })) },
    { id: 'priority', label: 'Priority', type: 'select', options: PRIORITIES.map((value) => ({ value, label: value })) },
    { id: 'scoreCategory', label: 'Score', type: 'select', options: SCORE_CATEGORIES.map((value) => ({ value, label: value })) },
    { id: 'tags', label: 'Tags', type: 'multi-select', options: tags.map((tag) => ({ value: tag.name, label: tag.name })) },
    { id: 'value', label: 'Value', type: 'currency' },
    { id: 'product', label: 'Product', type: 'text' },
    { id: 'expectedCloseDate', label: 'Expected close', type: 'date' },
    { id: 'createdAt', label: 'Created', type: 'date' },
  ]
}
