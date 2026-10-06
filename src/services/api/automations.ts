import type {
  Automation,
  AutomationActivityStats,
  AutomationContent,
  AutomationInput,
  AutomationListParams,
  AutomationRun,
  AutomationRunListParams,
  AutomationTemplate,
  AutomationVersion,
  DryRunResult,
  EntityRef,
  Paginated,
} from '@/types'
import type { CrudClient } from './resource'

export interface TestAutomationInput {
  content: AutomationContent
  /** The sample lead or deal to play the automation against. */
  entity: EntityRef
}

export interface AutomationsApiClient extends CrudClient<
  Automation,
  AutomationInput,
  Partial<AutomationInput>,
  AutomationListParams
> {
  /** `create` and `update` save a draft. Only `publish` makes the content live. */
  publish(id: string, input?: AutomationInput): Promise<Automation>
  setEnabled(id: string, enabled: boolean): Promise<Automation>
  duplicate(id: string): Promise<Automation>
  /** Dry run: what would happen for a sample record, with nothing written. */
  test(input: TestAutomationInput): Promise<DryRunResult>
  listRuns(params?: AutomationRunListParams): Promise<Paginated<AutomationRun>>
  getRun(id: string): Promise<AutomationRun>
  retryRun(id: string): Promise<AutomationRun>
  cancelRun(id: string): Promise<AutomationRun>
  templates(): Promise<AutomationTemplate[]>
  /** Newest first. */
  versions(id: string): Promise<AutomationVersion[]>
  /** Restores a published version into the draft. Publish it to make it live. */
  restoreVersion(id: string, version: number): Promise<Automation>
  /** Runs, success rate and busiest automations over the last 30 days. */
  stats(): Promise<AutomationActivityStats>
}
