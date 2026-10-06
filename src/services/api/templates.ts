import type { MessageTemplate, TemplateInput, TemplatePatch } from '@/types'
import type { ConfigClient } from './resource'

export interface TemplatesApiClient extends ConfigClient<
  MessageTemplate,
  TemplateInput,
  TemplatePatch
> {
  submitForApproval(id: string): Promise<MessageTemplate>
  clone(id: string): Promise<MessageTemplate>
}
