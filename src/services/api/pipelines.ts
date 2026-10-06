import type { ConfigInput, Pipeline, PipelineStage, PipelineWithStages } from '@/types'

export type PipelineInput = Pick<Pipeline, 'name' | 'isDefault'>
export type StageInput = ConfigInput<PipelineStage>

export interface PipelinesApiClient {
  /** Pipelines with their stages in order. */
  listAll(): Promise<PipelineWithStages[]>
  get(id: string): Promise<PipelineWithStages>
  create(input: PipelineInput): Promise<PipelineWithStages>
  update(id: string, patch: Partial<PipelineInput>): Promise<PipelineWithStages>
  /** Moves deals onto `replacementId` (a stage in another pipeline) when the pipeline is in use. */
  delete(id: string, options?: { replacementId?: string }): Promise<void>
  createStage(input: StageInput): Promise<PipelineStage>
  updateStage(id: string, patch: Partial<Omit<StageInput, 'pipelineId'>>): Promise<PipelineStage>
  /** Deleting a stage that still holds deals fails with CONFLICT unless a replacement stage is given. */
  deleteStage(id: string, options?: { replacementId?: string }): Promise<void>
  reorderStages(pipelineId: string, orderedIds: string[]): Promise<PipelineWithStages>
}
