import type {
  AssignmentRule,
  Deal,
  FollowUp,
  Lead,
  PipelineStage,
  ScoringRule,
  User,
} from '@/types'

const BASE_TIME = '2026-09-01T10:00:00.000Z'

export function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'L-10001',
    tenantId: 'tenant-test',
    name: 'Test Lead',
    phone: null,
    whatsapp: null,
    email: null,
    company: null,
    location: null,
    sourceId: 'source-website',
    campaignId: null,
    productInterest: null,
    budget: null,
    requirement: null,
    leadType: 'b2c',
    priority: 'medium',
    language: null,
    tags: [],
    statusId: 'status-new',
    pipelineId: 'pipeline-1',
    stageId: 'stage-1',
    position: 1,
    stageEnteredAt: BASE_TIME,
    assignedTo: null,
    assignedAt: null,
    score: 0,
    scoreCategory: 'cold',
    scoreBreakdown: [],
    qualificationStatus: 'needs_info',
    qualificationAnswers: {},
    customFields: {},
    createdBy: null,
    createdAt: BASE_TIME,
    updatedAt: BASE_TIME,
    lastContactedAt: null,
    nextFollowUpAt: null,
    firstResponseTimeMins: null,
    archivedAt: null,
    ...overrides,
  }
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    tenantId: 'tenant-test',
    name: 'Test User',
    email: 'user@example.test',
    role: 'salesperson',
    teamId: null,
    language: 'English',
    location: 'Mumbai',
    workload: 0,
    status: 'active',
    createdAt: BASE_TIME,
    ...overrides,
  }
}

export function makeScoringRule(overrides: Partial<ScoringRule> = {}): ScoringRule {
  return {
    id: 'rule-1',
    tenantId: 'tenant-test',
    name: 'Rule',
    conditions: [],
    points: 10,
    isActive: true,
    order: 1,
    ...overrides,
  }
}

export function makeAssignmentRule(overrides: Partial<AssignmentRule> = {}): AssignmentRule {
  return {
    id: 'assign-1',
    tenantId: 'tenant-test',
    name: 'Default',
    priority: 1,
    isActive: true,
    conditions: [],
    pool: { teamId: null, userIds: [], matchLanguage: false, matchLocation: false },
    distribution: 'round_robin',
    ...overrides,
  }
}

export function makeFollowUp(overrides: Partial<FollowUp> = {}): FollowUp {
  return {
    id: 'fu-1',
    tenantId: 'tenant-test',
    leadId: 'L-10001',
    type: 'call',
    dueAt: BASE_TIME,
    assigneeId: 'user-1',
    priority: 'medium',
    status: 'pending',
    notes: '',
    reminderOffsetMinutes: 15,
    completedAt: null,
    createdBy: null,
    createdAt: BASE_TIME,
    ...overrides,
  }
}

export function makeStage(overrides: Partial<PipelineStage> = {}): PipelineStage {
  return {
    id: 'stage-1',
    tenantId: 'tenant-test',
    pipelineId: 'pipeline-1',
    name: 'Stage',
    color: '#6366f1',
    order: 1,
    probability: 50,
    type: 'open',
    ...overrides,
  }
}

export function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: 'D-1001',
    tenantId: 'tenant-test',
    title: 'Deal',
    leadId: 'L-10001',
    customerId: null,
    value: 100_000,
    expectedCloseDate: BASE_TIME,
    probability: 50,
    product: 'SEO',
    ownerId: 'user-1',
    pipelineId: 'pipeline-1',
    stageId: 'stage-1',
    position: 1,
    stageEnteredAt: BASE_TIME,
    expectedRevenue: 50_000,
    customFields: {},
    closedAt: null,
    createdAt: BASE_TIME,
    updatedAt: BASE_TIME,
    ...overrides,
  }
}
