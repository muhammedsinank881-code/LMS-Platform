import type { RouteObject } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '../guards/ProtectedRoute'
import { lazyPage } from '../lazy-route'
import { RouteErrorBoundary } from '../RouteErrorBoundary'

import { mentorRoutes } from '@/routes/mentorRoutes'

/** Pages inside the AppShell. Each is a placeholder until its module is built. */
const shellPages: RouteObject[] = [
  {
    path: 'dashboard',
    lazy: lazyPage(() => import('@/features/dashboard/pages/DashboardPage'), 'DashboardPage'),
  },
  {
    path: 'follow-ups',
    lazy: lazyPage(() => import('@/features/followups/pages/FollowUpsPage'), 'FollowUpsPage'),
  },
  {
    path: 'leads',
    children: [
      { index: true, lazy: lazyPage(() => import('@/features/leads/pages/LeadsPage'), 'LeadsPage') },
      {
        path: ':id',
        lazy: lazyPage(() => import('@/features/leads/pages/LeadDetailPage'), 'LeadDetailPage'),
      },
    ],
  },
  {
    path: 'pipeline',
    lazy: lazyPage(() => import('@/features/pipeline/pages/PipelinePage'), 'PipelinePage'),
  },
  {
    path: 'deals',
    children: [
      { index: true, lazy: lazyPage(() => import('@/features/deals/pages/DealsPage'), 'DealsPage') },
      {
        path: ':id',
        lazy: lazyPage(() => import('@/features/deals/pages/DealDetailPage'), 'DealDetailPage'),
      },
    ],
  },
  {
    path: 'customers',
    children: [
      {
        index: true,
        lazy: lazyPage(() => import('@/features/customers/pages/CustomersPage'), 'CustomersPage'),
      },
      {
        path: ':id',
        lazy: lazyPage(
          () => import('@/features/customers/pages/CustomerPlaceholderPage'),
          'CustomerPlaceholderPage',
        ),
      },
    ],
  },
  {
    path: 'inbox',
    children: [
      { index: true, lazy: lazyPage(() => import('@/features/inbox/pages/InboxPage'), 'InboxPage') },
      {
        path: ':conversationId',
        lazy: lazyPage(() => import('@/features/inbox/pages/InboxPage'), 'InboxPage'),
      },
    ],
  },
  { path: 'tasks', lazy: lazyPage(() => import('@/features/tasks/pages/TasksPage'), 'TasksPage') },
  {
    path: 'campaigns',
    children: [
      { index: true, lazy: lazyPage(() => import('@/features/campaigns/pages/CampaignsPage'), 'CampaignsPage') },
      {
        path: ':id',
        lazy: lazyPage(() => import('@/features/campaigns/pages/CampaignDetailPage'), 'CampaignDetailPage'),
      },
    ],
  },
  {
    path: 'automations',
    children: [
      { index: true, lazy: lazyPage(() => import('@/features/automations/pages/AutomationsPage'), 'AutomationsPage') },
      { path: 'new', lazy: lazyPage(() => import('@/features/automations/pages/AutomationBuilderPage'), 'AutomationBuilderPage') },
      { path: ':id', lazy: lazyPage(() => import('@/features/automations/pages/AutomationBuilderPage'), 'AutomationBuilderPage') },
    ],
  },
  {
    path: 'reports',
    children: [
      { index: true, lazy: lazyPage(() => import('@/features/reports/pages/ReportsPage'), 'ReportsPage') },
      {
        path: 'performance',
        lazy: lazyPage(() => import('@/features/reports/pages/PerformancePage'), 'PerformancePage'),
      },
      {
        path: 'performance/:userId',
        lazy: lazyPage(() => import('@/features/reports/pages/RepDetailPage'), 'RepDetailPage'),
      },
    ],
  },
  {
    path: 'notifications',
    lazy: lazyPage(() => import('@/features/notifications/pages/NotificationsPage'), 'NotificationsPage'),
  },
  { path: 'team', lazy: lazyPage(() => import('@/features/team/pages/TeamPage'), 'TeamPage') },
  {
    path: 'audit-logs',
    lazy: lazyPage(() => import('@/features/audit/pages/AuditLogsPage'), 'AuditLogsPage'),
  },
  {
    path: 'settings',
    lazy: lazyPage(() => import('@/features/settings/components/SettingsLayout'), 'SettingsLayout'),
    children: [
      { index: true, lazy: lazyPage(() => import('@/features/settings/components/SettingsLayout'), 'SettingsIndex') },
      { path: 'profile', lazy: lazyPage(() => import('@/features/settings/pages/ProfileSettingsPage'), 'ProfileSettingsPage') },
      { path: 'workspace', lazy: lazyPage(() => import('@/features/settings/pages/WorkspaceSettingsPage'), 'WorkspaceSettingsPage') },
      { path: 'statuses', lazy: lazyPage(() => import('@/features/settings/pages/StatusesSettingsPage'), 'StatusesSettingsPage') },
      { path: 'pipelines', lazy: lazyPage(() => import('@/features/settings/pages/PipelinesSettingsPage'), 'PipelinesSettingsPage') },
      { path: 'sources', lazy: lazyPage(() => import('@/features/settings/pages/SourcesSettingsPage'), 'SourcesSettingsPage') },
      { path: 'tags', lazy: lazyPage(() => import('@/features/settings/pages/TagsSettingsPage'), 'TagsSettingsPage') },
      { path: 'custom-fields', lazy: lazyPage(() => import('@/features/settings/pages/CustomFieldsSettingsPage'), 'CustomFieldsSettingsPage') },
      { path: 'qualification', lazy: lazyPage(() => import('@/features/settings/pages/QualificationSettingsPage'), 'QualificationSettingsPage') },
      { path: 'assignment', lazy: lazyPage(() => import('@/features/settings/pages/AssignmentSettingsPage'), 'AssignmentSettingsPage') },
      { path: 'lost-reasons', lazy: lazyPage(() => import('@/features/settings/pages/SimpleListsPage'), 'LostReasonsSettingsPage') },
      { path: 'billing', lazy: lazyPage(() => import('@/features/settings/pages/BillingSettingsPage'), 'BillingSettingsPage') },
      { path: 'scoring', lazy: lazyPage(() => import('@/features/settings/pages/ScoringSettingsPage'), 'ScoringSettingsPage') },
      { path: 'templates', lazy: lazyPage(() => import('@/features/settings/pages/TemplatesSettingsPage'), 'TemplatesSettingsPage') },
      { path: 'integrations', lazy: lazyPage(() => import('@/features/integrations/pages/IntegrationsPage'), 'IntegrationsPage') },
      { path: 'lead-capture', lazy: lazyPage(() => import('@/features/lead-capture/pages/LeadCapturePage'), 'LeadCapturePage') },
      { path: 'api-keys', lazy: lazyPage(() => import('@/features/developer/pages/ApiKeysWebhooksPage'), 'ApiKeysWebhooksPage') },
    ],
  },
]

/** Hidden developer tools, absent from production builds. Outside the AppShell on purpose. */
const devPages: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: 'dev/data-check',
        lazy: lazyPage(() => import('@/features/dev/pages/DataCheckPage'), 'DataCheckPage'),
      },
    ]
  : []

export const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      ...devPages,
      {
        // Outside the AppShell: no sidebar until setup is finished.
        path: 'onboarding',
        lazy: lazyPage(
          () => import('@/features/onboarding/pages/OnboardingPage'),
          'OnboardingPage',
        ),
      },
      ...mentorRoutes,
      {
        element: <AppShell />,
        children: [
          // A pathless child boundary keeps the shell on screen when a page crashes.
          { errorElement: <RouteErrorBoundary />, children: shellPages },
        ],
      },
    ],
  },
]
