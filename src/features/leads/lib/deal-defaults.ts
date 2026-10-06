import type { Lead, PipelineWithStages } from '@/types'
import type { ConvertDealFormValues } from './detail-schemas'

function closeDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

export function dealDefaults(lead: Lead, pipelines: PipelineWithStages[]): ConvertDealFormValues {
  const pipeline = pipelines.find((item) => item.isDefault) ?? pipelines[0]
  const stage = pipeline?.stages.find((item) => item.type === 'open') ?? pipeline?.stages[0]
  return {
    title: `${lead.name} opportunity`,
    value: lead.budget ?? 0,
    expectedCloseDate: closeDate(),
    probability: stage?.probability ?? 10,
    product: lead.productInterest ?? '',
    ownerId: lead.assignedTo ?? '',
    pipelineId: pipeline?.id ?? '',
    stageId: stage?.id ?? '',
  }
}

export function openStages(pipelines: PipelineWithStages[], pipelineId: string) {
  return (pipelines.find((item) => item.id === pipelineId)?.stages ?? []).filter((stage) => stage.type === 'open')
}
