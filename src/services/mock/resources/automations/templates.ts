import { buildAutomationTemplates, type TemplateRefs } from '@/lib/automation'
import type { MessageTemplate } from '@/types'
import type { RequestContext } from '../../core/context'

const includes = (text: string, part: string) => text.toLowerCase().includes(part)

function templateId(rows: MessageTemplate[], channel: 'whatsapp' | 'email', hint: string): string {
  const approved = rows.filter((t) => t.channel === channel && t.status === 'approved')
  return (approved.find((t) => includes(t.name, hint)) ?? approved[0])?.id ?? ''
}

/** Points the ready-made automations at this workspace's own sources, teams and templates. */
export function templateRefs(ctx: RequestContext): TemplateRefs {
  const templates = ctx.db.all('templates')
  const statuses = ctx.db.all('leadStatuses').filter((s) => s.type === 'open').sort((a, b) => a.order - b.order)
  const stages = ctx.db.all('stages').filter((s) => s.type === 'open').sort((a, b) => a.order - b.order)
  const negotiation = stages.find((s) => includes(s.name, 'negotiation')) ?? stages[stages.length - 1]
  return {
    facebookSourceId: ctx.db.all('leadSources').find((s) => s.key === 'facebook')?.id ?? '',
    teamId: ctx.db.all('teams')[0]?.id ?? null,
    newStatusId: statuses[0]?.id ?? '',
    waWelcomeId: templateId(templates, 'whatsapp', 'welcome'),
    waFollowUpId: templateId(templates, 'whatsapp', 'follow'),
    emailWelcomeId: templateId(templates, 'email', 'onboarding'),
    negotiationStageId: negotiation?.id ?? '',
    pipelineId: negotiation?.pipelineId ?? '',
  }
}

export const listTemplates = (ctx: RequestContext) => {
  ctx.require('automations', 'view')
  return buildAutomationTemplates(templateRefs(ctx))
}
