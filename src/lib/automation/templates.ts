import type { AutomationContent, AutomationTemplate, ConditionGroup } from '@/types'

/** A template's automation content, without its gallery metadata. */
export function templateContent(template: AutomationTemplate): AutomationContent {
  return {
    name: template.name,
    description: template.description,
    trigger: template.trigger,
    conditions: template.conditions,
    actions: template.actions,
  }
}

/** Workspace ids the ready-made automations point at. Empty strings are flagged by the builder. */
export interface TemplateRefs {
  facebookSourceId: string
  teamId: string | null
  newStatusId: string
  waWelcomeId: string
  waFollowUpId: string
  emailWelcomeId: string
  negotiationStageId: string
  pipelineId: string
}

const noConditions = (): ConditionGroup => ({ logic: 'and', items: [] })

/** The three automations from the product spec plus five common patterns. */
export function buildAutomationTemplates(refs: TemplateRefs): AutomationTemplate[] {
  return [
    {
      key: 'facebook-welcome',
      category: 'Lead routing',
      name: 'New Facebook lead: welcome and assign',
      description: 'Route new Facebook leads to a team and greet them on WhatsApp.',
      trigger: { type: 'lead_created', sourceIds: [refs.facebookSourceId] },
      conditions: noConditions(),
      actions: [
        { type: 'assign', strategy: 'round_robin', userId: null, teamId: refs.teamId },
        { type: 'send_whatsapp', templateId: refs.waWelcomeId },
        { type: 'create_followup', followUpType: 'call', dueInHours: 1, priority: 'high' },
        { type: 'notify_team', target: 'manager', teamId: null, message: 'New Facebook lead {{lead.name}} was assigned.' },
      ],
    },
    {
      key: 'won-onboarding',
      category: 'Customers',
      name: 'Won deal: start onboarding',
      description: 'Create the customer, send a welcome message and schedule a kickoff task.',
      trigger: { type: 'deal_won' },
      conditions: noConditions(),
      actions: [
        { type: 'create_customer' },
        { type: 'send_whatsapp', templateId: refs.waWelcomeId },
        { type: 'send_email', templateId: refs.emailWelcomeId },
        { type: 'create_task', title: 'Kick off onboarding for {{lead.name}}', dueInHours: 24, priority: 'high' },
      ],
    },
    {
      key: 'no-contact-2h',
      category: 'Speed to lead',
      name: 'No contact in 2 hours: escalate',
      description: 'If a new lead is untouched for 2 hours, remind the owner and tell the manager.',
      trigger: { type: 'lead_not_contacted', amount: 2, unit: 'hours' },
      conditions: { logic: 'and', items: [{ field: 'statusId', operator: 'equals', value: refs.newStatusId }] },
      actions: [
        { type: 'notify_user', userId: 'assignee', message: '{{lead.name}} has not been contacted for 2 hours.' },
        { type: 'notify_team', target: 'manager', teamId: null, message: 'A new lead has been waiting for 2 hours.' },
      ],
    },
    {
      key: 'speed-to-lead',
      category: 'Speed to lead',
      name: 'Speed-to-lead alert',
      description: 'Tell the owner the moment a high-scoring lead arrives and book a quick call.',
      trigger: { type: 'lead_created', sourceIds: [] },
      conditions: { logic: 'and', items: [{ field: 'score', operator: 'gt', value: 49 }] },
      actions: [
        { type: 'notify_user', userId: 'assignee', message: 'Hot lead {{lead.name}}: call within 5 minutes.' },
        { type: 'create_followup', followUpType: 'call', dueInHours: 0.25, priority: 'urgent' },
      ],
    },
    {
      key: 'no-reply-nurture',
      category: 'Nurture',
      name: 'No-reply nurture',
      description: 'Nudge a silent lead on WhatsApp, wait two days, then ask the owner to call.',
      trigger: { type: 'lead_not_contacted', amount: 1, unit: 'days' },
      conditions: noConditions(),
      actions: [
        { type: 'send_whatsapp', templateId: refs.waFollowUpId },
        { type: 'wait', amount: 2, unit: 'days' },
        { type: 'create_task', title: 'Call {{lead.name}}: no reply to the WhatsApp nudge', dueInHours: 4, priority: 'medium' },
      ],
    },
    {
      key: 'stale-deal',
      category: 'Pipeline',
      name: 'Stale deal reminder',
      description: 'A week after a deal enters negotiation, remind the owner if it has not moved.',
      trigger: { type: 'deal_stage_changed', pipelineId: null, fromStageId: null, toStageId: refs.negotiationStageId },
      conditions: noConditions(),
      actions: [
        { type: 'wait', amount: 7, unit: 'days' },
        {
          type: 'branch',
          conditions: {
            logic: 'and',
            items: [{ field: 'deal.stageId', operator: 'equals', value: refs.negotiationStageId }],
          },
          then: [{ type: 'notify_user', userId: 'assignee', message: 'The deal for {{lead.name}} has sat in negotiation for 7 days.' }],
          else: [],
        },
      ],
    },
    {
      key: 'welcome-after-won',
      category: 'Customers',
      name: 'Welcome after won',
      description: 'A day after a deal is won, send a welcome email and ask for feedback.',
      trigger: { type: 'deal_won' },
      conditions: noConditions(),
      actions: [
        { type: 'wait', amount: 1, unit: 'days' },
        { type: 'send_email', templateId: refs.emailWelcomeId },
        { type: 'add_note', text: 'Welcome email sent after the deal was won.' },
      ],
    },
    {
      key: 'lost-reengage',
      category: 'Win-back',
      name: 'Lost deal re-engagement',
      description: 'Thirty days after a deal is lost, tag the lead and schedule a check-in call.',
      trigger: { type: 'deal_lost' },
      conditions: noConditions(),
      actions: [
        { type: 'wait', amount: 30, unit: 'days' },
        { type: 'add_tags', tags: ['Re-engage'] },
        { type: 'create_followup', followUpType: 'call', dueInHours: 1, priority: 'medium' },
      ],
    },
  ]
}
