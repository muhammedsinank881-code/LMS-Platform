import type { AssignmentRule, SavedView, User } from '@/types'
import { teamIdFor } from './people'
export { scoringDefs } from './config-scoring'
import { seedId, type SeedEnv } from './rng'

export function buildAssignmentRules(env: SeedEnv, users: readonly User[]): AssignmentRule[] {
  const base = { tenantId: env.tenantId, isActive: true }
  const hasUser = (userId: string) => users.some((u) => u.id === userId)
  const leaders = ['user-rahul', 'user-karan'].filter(hasUser)
  const north = teamIdFor(env, 'north')
  const northTeam = users.some((u) => u.teamId === north) ? north : null
  const noMatching = { matchLanguage: false, matchLocation: false }

  return [
    {
      ...base,
      id: seedId(env, 'assign', 'high-value'),
      name: 'High-score leads to team leaders',
      priority: 1,
      conditions: [{ field: 'score', operator: 'gt', value: 69 }],
      pool: { teamId: null, userIds: leaders, ...noMatching },
      distribution: 'workload',
    },
    {
      ...base,
      id: seedId(env, 'assign', 'social'),
      name: 'Facebook and Instagram to North team',
      priority: 2,
      conditions: [
        {
          field: 'sourceId',
          operator: 'in',
          value: [seedId(env, 'source', 'facebook'), seedId(env, 'source', 'instagram')],
        },
      ],
      pool: { teamId: northTeam, userIds: [], ...noMatching },
      distribution: 'round_robin',
    },
    {
      ...base,
      id: seedId(env, 'assign', 'hindi'),
      name: 'Hindi-speaking leads to Hindi speakers',
      priority: 3,
      conditions: [{ field: 'language', operator: 'equals', value: 'Hindi' }],
      pool: { teamId: null, userIds: [], matchLanguage: true, matchLocation: false },
      distribution: 'workload',
    },
    {
      ...base,
      id: seedId(env, 'assign', 'default'),
      name: 'Everyone else, round robin',
      priority: 4,
      conditions: [],
      pool: { teamId: null, userIds: [], ...noMatching },
      distribution: 'round_robin',
    },
  ]
}

export function buildSavedViews(
  env: SeedEnv,
  users: readonly User[],
  createdAt: string,
): SavedView[] {
  const preset = {
    tenantId: env.tenantId,
    entity: 'leads' as const,
    isPreset: true,
    userId: null,
    createdAt,
  }
  const views: SavedView[] = [
    {
      ...preset,
      id: seedId(env, 'view', 'hot'),
      name: 'Hot Leads',
      icon: '🔥',
      conditions: [{ field: 'scoreCategory', operator: 'equals', value: 'hot' }],
      sort: [{ field: 'score', direction: 'desc' }],
    },
    {
      ...preset,
      id: seedId(env, 'view', 'calls'),
      name: "Today's Calls",
      icon: '📞',
      conditions: [{ field: 'nextFollowUpAt', operator: 'date_preset', value: 'today' }],
      sort: [{ field: 'nextFollowUpAt', direction: 'asc' }],
    },
    {
      ...preset,
      id: seedId(env, 'view', 'overdue'),
      name: 'Overdue Leads',
      icon: '⚠️',
      conditions: [{ field: 'followUpBucket', operator: 'equals', value: 'overdue' }],
      sort: [{ field: 'nextFollowUpAt', direction: 'asc' }],
    },
    {
      ...preset,
      id: seedId(env, 'view', 'high-value'),
      name: 'High Value Leads',
      icon: '💰',
      conditions: [{ field: 'budget', operator: 'gt', value: 500_000 }],
      sort: [{ field: 'budget', direction: 'desc' }],
    },
  ]
  views.push(
    {
      ...preset,
      entity: 'tasks',
      id: seedId(env, 'view', 'my-tasks'),
      name: 'My tasks',
      icon: '✅',
      conditions: [{ field: 'assigneeId', operator: 'equals', value: 'me' }],
      sort: [{ field: 'dueAt', direction: 'asc' }],
    },
    {
      ...preset,
      entity: 'tasks',
      id: seedId(env, 'view', 'tasks-overdue'),
      name: 'Overdue',
      icon: '⚠️',
      conditions: [{ field: 'status', operator: 'equals', value: 'overdue' }],
      sort: [{ field: 'dueAt', direction: 'asc' }],
    },
    {
      ...preset,
      entity: 'tasks',
      id: seedId(env, 'view', 'tasks-high'),
      name: 'High priority',
      icon: '🔴',
      conditions: [{ field: 'priority', operator: 'equals', value: 'high' }],
      sort: [{ field: 'dueAt', direction: 'asc' }],
    },
    {
      ...preset,
      entity: 'deals',
      id: seedId(env, 'view', 'my-open-deals'),
      name: 'My open deals',
      icon: '📂',
      conditions: [
        { field: 'ownerId', operator: 'equals', value: 'me' },
        {
          field: 'stageId',
          operator: 'in',
          value: ['new', 'qualified', 'proposal', 'negotiation'].map((slug) => seedId(env, 'stage', slug)),
        },
      ],
      sort: [{ field: 'expectedCloseDate', direction: 'asc' }],
    },
    {
      ...preset,
      entity: 'deals',
      id: seedId(env, 'view', 'closing-month'),
      name: 'Closing this month',
      icon: '📅',
      conditions: [{ field: 'expectedCloseDate', operator: 'date_preset', value: 'this_month' }],
      sort: [{ field: 'expectedCloseDate', direction: 'asc' }],
    },
    {
      ...preset,
      entity: 'deals',
      id: seedId(env, 'view', 'high-value-deals'),
      name: 'High value',
      icon: '💰',
      conditions: [{ field: 'value', operator: 'gt', value: 500_000 }],
      sort: [{ field: 'value', direction: 'desc' }],
    },
    {
      ...preset,
      entity: 'deals',
      id: seedId(env, 'view', 'won-deals'),
      name: 'Won',
      icon: '🏆',
      conditions: [{ field: 'stageId', operator: 'equals', value: seedId(env, 'stage', 'won') }],
      sort: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      ...preset,
      entity: 'deals',
      id: seedId(env, 'view', 'lost-deals'),
      name: 'Lost',
      icon: '📉',
      conditions: [{ field: 'stageId', operator: 'equals', value: seedId(env, 'stage', 'lost') }],
      sort: [{ field: 'createdAt', direction: 'desc' }],
    },
  )
  if (users.some((u) => u.id === 'user-ananya')) {
    views.push({
      ...preset,
      id: seedId(env, 'view', 'mine-fb'),
      isPreset: false,
      userId: 'user-ananya',
      name: 'My Facebook leads',
      icon: '📘',
      conditions: [
        { field: 'sourceId', operator: 'equals', value: seedId(env, 'source', 'facebook') },
      ],
      sort: [{ field: 'createdAt', direction: 'desc' }],
    })
  }
  return views
}
