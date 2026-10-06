import { useState } from 'react'
import { useAuditLogs } from '@/features/audit/hooks/use-audit-logs'
import { useCampaigns } from '@/features/campaigns/hooks/use-campaigns'
import { useCustomers } from '@/features/customers/hooks/use-customers'
import { useDeals, useDealsSummary } from '@/features/deals/hooks/use-deals'
import { useFollowUpBuckets, useFollowUps } from '@/features/followups/hooks/use-followups'
import { useConversations } from '@/features/inbox/hooks/use-conversations'
import { useTemplates } from '@/features/inbox/hooks/use-templates'
import { useAutomations } from '@/features/automations/hooks/use-automations'
import { useChangeLeadStatus } from '@/features/leads/hooks/use-change-lead-status'
import { useDuplicateGroups, useLeads } from '@/features/leads/hooks/use-leads'
import { useNotifications } from '@/features/notifications/hooks/use-notifications'
import { useUnreadNotificationCount } from '@/features/notifications/hooks/use-unread-count'
import { usePipelines } from '@/features/pipeline/hooks/use-pipelines'
import { useDashboardSummary } from '@/features/dashboard/hooks/use-dashboard'
import { useSources, useStatuses } from '@/features/settings/hooks/use-lead-config'
import { useDirectory } from '@/features/team/hooks/use-team'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { useAuthStore } from '@/store/auth-store'
import { DevQuery } from '../components/DevQuery'
import { MockControlsPanel } from '../components/MockControlsPanel'

const DAY_MS = 86_400_000

/** Hidden, dev-only page: raw output of the main data hooks, to check the backbone before any UI exists. */
export function DataCheckPage() {
  const user = useAuthStore((state) => state.user)
  const tenant = useAuthStore((state) => state.tenant)
  const [range] = useState(() => {
    const to = new Date()
    return { from: new Date(to.getTime() - 30 * DAY_MS).toISOString(), to: to.toISOString() }
  })

  const leads = useLeads({ pageSize: 5 })
  const duplicates = useDuplicateGroups()
  const followUps = useFollowUps({ pageSize: 5 })
  const buckets = useFollowUpBuckets()
  const tasks = useTasks({ pageSize: 5 })
  const deals = useDeals({ pageSize: 5 })
  const dealsSummary = useDealsSummary()
  const pipelines = usePipelines()
  const customers = useCustomers({ pageSize: 5 })
  const campaigns = useCampaigns({ pageSize: 5 })
  const conversations = useConversations({ pageSize: 5 })
  const templates = useTemplates()
  const automations = useAutomations({ pageSize: 5 })
  const notifications = useNotifications({ pageSize: 5 })
  const unread = useUnreadNotificationCount()
  const audit = useAuditLogs({ pageSize: 5 })
  const directory = useDirectory()
  const dashboard = useDashboardSummary({ range, compare: true })
  const statuses = useStatuses()
  const sources = useSources()
  const changeStatus = useChangeLeadStatus()

  const firstLead = leads.data?.items[0]
  const nextStatus = statuses.data?.find((s) => s.id !== firstLead?.statusId && s.type === 'open')

  return (
    <main>
      <h1>Data check (dev only)</h1>
      <p>
        {user ? `${user.name} (${user.role})` : 'signed out'} · workspace {tenant?.name ?? 'none'}
      </p>
      <MockControlsPanel />

      <h2>Optimistic update</h2>
      <button
        type="button"
        disabled={!firstLead || !nextStatus || changeStatus.isPending}
        onClick={() =>
          firstLead && nextStatus && changeStatus.mutate({ id: firstLead.id, statusId: nextStatus.id })
        }
      >
        Move first lead to “{nextStatus?.name ?? '…'}”
      </button>{' '}
      {firstLead && (
        <span>
          first lead: {firstLead.name} · status {firstLead.statusId}
        </span>
      )}

      <h2>Hooks</h2>
      <DevQuery label="leads" query={leads} />
      <DevQuery label="duplicate groups" query={duplicates} />
      <DevQuery label="follow-ups" query={followUps} />
      <DevQuery label="follow-up buckets" query={buckets} />
      <DevQuery label="tasks" query={tasks} />
      <DevQuery label="deals" query={deals} />
      <DevQuery label="deals summary" query={dealsSummary} />
      <DevQuery label="pipelines" query={pipelines} />
      <DevQuery label="customers" query={customers} />
      <DevQuery label="campaigns" query={campaigns} />
      <DevQuery label="conversations" query={conversations} />
      <DevQuery label="templates" query={templates} />
      <DevQuery label="automations" query={automations} />
      <DevQuery label="notifications" query={notifications} />
      <DevQuery label="unread count" query={unread} />
      <DevQuery label="audit logs" query={audit} />
      <DevQuery label="team directory" query={directory} />
      <DevQuery label="dashboard (30 days)" query={dashboard} />
      <DevQuery label="statuses" query={statuses} />
      <DevQuery label="sources" query={sources} />
    </main>
  )
}
