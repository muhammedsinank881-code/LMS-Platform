import type {
  AssignmentRule,
  CustomFieldDefinition,
  LeadSource,
  LeadStatus,
  LostReason,
  MessageTemplate,
  Pipeline,
  QuickReply,
  PipelineStage,
  QualificationQuestion,
  SavedView,
  ScoringRule,
  Tag,
  User,
} from '@/types'
import { DEFAULT_PERMISSION_MATRIX, defaultSectionGrants } from '@/lib/permissions'
import type { TenantSettings } from '../core/store'
import {
  CUSTOM_FIELD_DEFS,
  LOST_REASONS,
  QUESTION_DEFS,
  SOURCE_DEFS,
  STAGE_DEFS,
  STATUS_DEFS,
  TAG_DEFS,
} from './config-data'
import { buildAssignmentRules, buildSavedViews, scoringDefs } from './config-rules'
import { buildQuickReplies, buildTemplates } from './config-templates'
import { seedId, type SeedEnv } from './rng'

export interface TenantConfig {
  statuses: LeadStatus[]
  sources: LeadSource[]
  pipelines: Pipeline[]
  stages: PipelineStage[]
  lostReasons: LostReason[]
  scoringRules: ScoringRule[]
  settings: TenantSettings
  questions: QualificationQuestion[]
  customFields: CustomFieldDefinition[]
  tags: Tag[]
  templates: MessageTemplate[]
  quickReplies: QuickReply[]
  assignmentRules: AssignmentRule[]
  savedViews: SavedView[]
}

/** Workspace configuration: the same shape for every tenant, ids prefixed by the tenant key. */
export function buildTenantConfig(
  env: SeedEnv,
  users: readonly User[],
  workspaceName = 'My Workspace',
): TenantConfig {
  const owner = { tenantId: env.tenantId }
  const createdAt = new Date(env.now.getTime() - 200 * 86_400_000).toISOString()
  const id = (kind: string, slug: string | number) => seedId(env, kind, slug)

  const pipeline: Pipeline = {
    ...owner,
    id: id('pipeline', 'sales'),
    name: 'Sales Pipeline',
    isDefault: true,
    createdAt,
  }
  const enterprise: Pipeline = {
    ...owner,
    id: id('pipeline', 'enterprise'),
    name: 'Enterprise',
    isDefault: false,
    createdAt,
  }
  const enterpriseStages = [
    ['ent-discovery', 'Discovery', '#6366f1', 20, 'open'],
    ['ent-proposal', 'Proposal', '#f97316', 50, 'open'],
    ['ent-legal', 'Legal', '#8b5cf6', 70, 'open'],
    ['ent-won', 'Won', '#22c55e', 100, 'won'],
    ['ent-lost', 'Lost', '#ef4444', 0, 'lost'],
    ['ent-disqualified', 'Disqualified', '#6b7280', 0, 'invalid'],
  ] as const

  return {
    statuses: STATUS_DEFS.map(([slug, name, color, type], index) => ({
      ...owner,
      id: id('status', slug),
      name,
      color,
      type,
      order: index + 1,
    })),
    sources: SOURCE_DEFS.map(([key, name, icon]) => ({
      ...owner,
      id: id('source', key),
      key,
      name,
      icon,
      isActive: true,
      builtIn: true,
    })),
    pipelines: [pipeline, enterprise],
    stages: [
      ...STAGE_DEFS.map(([slug, name, color, probability, type], index) => ({
        ...owner,
        id: id('stage', slug),
        pipelineId: pipeline.id,
        name,
        color,
        probability,
        type,
        order: index + 1,
      })),
      ...enterpriseStages.map(([slug, name, color, probability, type], index) => ({
        ...owner,
        id: id('stage', slug),
        pipelineId: enterprise.id,
        name,
        color,
        probability,
        type,
        order: index + 1,
      })),
    ],
    lostReasons: LOST_REASONS.map((name, index) => ({
      ...owner,
      id: id('lost', index + 1),
      name,
      isActive: true,
      order: index + 1,
    })),
    scoringRules: scoringDefs(env).map((def, index) => ({
      ...owner,
      ...def,
      id: id('score', index + 1),
      isActive: true,
      order: index + 1,
    })),
    settings: {
      id: env.tenantId,
      tenantId: env.tenantId,
      scoringThresholds: { hot: 70, warm: 40 },
      scoringDecay: { enabled: false, afterDays: 14, points: 10 },
      plan: 'pro',
      permissions: DEFAULT_PERMISSION_MATRIX,
      sectionGrants: defaultSectionGrants(),
      workspace: {
        name: workspaceName,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        logoUrl: null,
        dateFormat: 'dd MMM yyyy',
        businessHours: { days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00' },
        fiscalYearStart: 4,
        defaultStatusId: id('status', 'new'),
        assignmentFallback: { userId: null },
      },
    },
    questions: QUESTION_DEFS.map((def, index) => ({
      ...owner,
      ...def,
      id: id('qq', index + 1),
      order: index + 1,
    })),
    customFields: CUSTOM_FIELD_DEFS.map((def, index) => ({
      ...owner,
      ...def,
      id: id('cf', index + 1),
      order: index + 1,
    })),
    tags: TAG_DEFS.map(([name, color], index) => ({
      ...owner,
      id: id('tag', index + 1),
      name,
      color,
    })),
    templates: buildTemplates(env, users[0]?.id ?? 'user-system'),
    quickReplies: buildQuickReplies(env, users[0]?.id ?? 'user-system'),
    assignmentRules: buildAssignmentRules(env, users),
    savedViews: buildSavedViews(env, users, createdAt),
  }
}
