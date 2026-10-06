import type { SessionUser, User } from '@/types'
import { createCounters, type MockState, type MockTables } from '../core/store'
import { buildActivities } from './activities'
import { buildAuditLogs } from './audit'
import { buildAutomations } from './automations'
import { buildBroadcasts, buildTargets } from './broadcasts'
import { buildCampaigns } from './campaigns'
import { buildCaptureData } from './capture'
import { buildTenantConfig, type TenantConfig } from './config'
import { counterBasesFor, type SeedContext } from './context'
import { buildConversations } from './conversations'
import { buildSales } from './deals'
import { buildWork } from './followups'
import { buildLeads } from './leads'
import { buildNotifications } from './notifications'
import { buildPeople, SEED_TENANTS } from './people'
import { scaled, type SeedEnv } from './rng'

export type TenantSpec = (typeof SEED_TENANTS)[number]

export function emptyTables(): MockTables {
  return {
    users: [],
    teams: [],
    leads: [],
    leadStatuses: [],
    leadSources: [],
    activities: [],
    followUps: [],
    tasks: [],
    pipelines: [],
    stages: [],
    deals: [],
    customers: [],
    companies: [],
    campaigns: [],
    adSets: [],
    ads: [],
    spendEntries: [],
    broadcasts: [],
    savedReports: [],
    conversations: [],
    messages: [],
    templates: [],
    quickReplies: [],
    callLogs: [],
    automations: [],
    automationRuns: [],
    automationVersions: [],
    notifications: [],
    notificationPreferences: [],
    auditLogs: [],
    savedViews: [],
    customFields: [],
    scoringRules: [],
    qualificationQuestions: [],
    lostReasons: [],
    assignmentRules: [],
    tags: [],
    tenantSettings: [],
    invitations: [],
    duplicateDismissals: [],
    integrations: [],
    integrationEvents: [],
    leadForms: [],
    formSubmissions: [],
    apiKeys: [],
    webhooks: [],
    webhookDeliveries: [],
  }
}

function addConfig(tables: MockTables, config: TenantConfig): void {
  tables.leadStatuses.push(...config.statuses)
  tables.leadSources.push(...config.sources)
  tables.pipelines.push(...config.pipelines)
  tables.stages.push(...config.stages)
  tables.lostReasons.push(...config.lostReasons)
  tables.scoringRules.push(...config.scoringRules)
  tables.tenantSettings.push(config.settings)
  tables.qualificationQuestions.push(...config.questions)
  tables.customFields.push(...config.customFields)
  tables.tags.push(...config.tags)
  tables.templates.push(...config.templates)
  tables.quickReplies.push(...config.quickReplies)
  tables.assignmentRules.push(...config.assignmentRules)
  tables.savedViews.push(...config.savedViews)
}

/** Seeds one demo workspace in full: people, configuration, leads and everything hanging off them. */
export function seedTenant(state: MockState, env: SeedEnv, spec: TenantSpec): void {
  const { tables } = state
  const { users, teams } = buildPeople(env, spec.people)
  const config = buildTenantConfig(env, users, spec.name)
  const hierarchy = buildCampaigns(env, users)
  const { campaigns, ads } = hierarchy
  const bases = counterBasesFor(spec.leadCounterBase)
  const leads = buildLeads(env, { config, users, campaigns, ads }, bases.lead)
  for (const user of users) {
    user.workload = leads.filter((l) => l.assignedTo === user.id && !l.archivedAt).length
  }

  const ctx: SeedContext = { config, users, campaigns, ads, leads, bases }
  const sales = buildSales(env, ctx)
  const work = buildWork(env, ctx, sales.deals)
  const activities = buildActivities(env, ctx, work.followUps)
  const chats = buildConversations(env, ctx)
  const automation = buildAutomations(env, ctx, scaled(env, 5, 2))

  tables.users.push(...users)
  tables.teams.push(...teams)
  addConfig(tables, config)
  tables.campaigns.push(...campaigns)
  tables.adSets.push(...hierarchy.adSets)
  tables.ads.push(...ads)
  tables.spendEntries.push(...hierarchy.spendEntries)
  tables.leads.push(...leads)
  tables.broadcasts.push(...buildBroadcasts(env, ctx))
  config.settings.targets = buildTargets(env, users)
  tables.deals.push(...sales.deals)
  tables.customers.push(...sales.customers)
  tables.companies.push(...sales.companies)
  tables.followUps.push(...work.followUps)
  tables.tasks.push(...work.tasks)
  tables.activities.push(...activities)
  tables.conversations.push(...chats.conversations)
  tables.messages.push(...chats.messages)
  tables.callLogs.push(...chats.callLogs)
  tables.automations.push(...automation.automations)
  tables.automationRuns.push(...automation.runs)
  tables.automationVersions.push(...automation.versions)
  tables.auditLogs.push(...buildAuditLogs(env, ctx, sales))
  tables.notifications.push(...buildNotifications(env, ctx, sales, work, chats.conversations))

  const capture = buildCaptureData(env, users, config.sources, leads, campaigns)
  tables.integrations.push(...capture.integrations)
  tables.integrationEvents.push(...capture.integrationEvents)
  tables.leadForms.push(...capture.leadForms)
  tables.formSubmissions.push(...capture.formSubmissions)
  tables.apiKeys.push(...capture.apiKeys)
  tables.webhooks.push(...capture.webhooks)
  tables.webhookDeliveries.push(...capture.webhookDeliveries)
  state.vault = { ...state.vault, ...capture.vault }

  state.counters[env.tenantId] = {
    lead: bases.lead + leads.length,
    deal: bases.deal + sales.deals.length,
    customer: bases.customer + sales.customers.length,
    task: bases.task + work.tasks.length,
  }
}

/**
 * A workspace the seed has never heard of (e.g. a newly registered one) still needs statuses,
 * sources and a pipeline to be usable. It gets the default configuration and no records.
 */
export function seedEmptyTenant(state: MockState, env: SeedEnv, actor: SessionUser): void {
  const user: User = {
    id: actor.id,
    tenantId: env.tenantId,
    name: actor.name,
    email: actor.email,
    role: actor.role,
    teamId: actor.teamId,
    avatarUrl: actor.avatarUrl ?? null,
    language: 'English',
    location: '',
    workload: 0,
    status: 'active',
    phone: null,
    createdAt: env.now.toISOString(),
  }
  state.tables.users.push(user)
  addConfig(state.tables, buildTenantConfig(env, [user]))
  state.counters[env.tenantId] = createCounters()
}
