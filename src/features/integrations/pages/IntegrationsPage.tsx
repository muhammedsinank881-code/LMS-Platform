import { useState } from 'react'
import { Plug } from 'lucide-react'
import { NoAccess } from '@/components/common/NoAccess'
import { QueryState } from '@/components/common/QueryState'
import { Skeleton } from '@/components/ui'
import { SectionIntro } from '@/features/settings/components/SettingsLayout'
import { usePermission } from '@/hooks/use-permission'
import type { IntegrationProvider } from '@/types'
import { ConnectDrawer } from '../components/ConnectDrawer'
import { IntegrationCard } from '../components/IntegrationCard'
import { IntegrationErrorBanner } from '../components/IntegrationErrorBanner'
import { ManageDrawer } from '../components/ManageDrawer'
import { useIntegrations } from '../hooks/use-integrations'

export function IntegrationsPage() {
  const { canSection } = usePermission()
  const integrations = useIntegrations()
  const [connecting, setConnecting] = useState<IntegrationProvider | null>(null)
  const [managing, setManaging] = useState<IntegrationProvider | null>(null)
  if (!canSection('integrations')) return <NoAccess />
  const rows = integrations.data ?? []
  const managed = rows.find((row) => row.provider === managing) ?? null

  return (
    <div className="space-y-4">
      <SectionIntro title="Integrations" description="Connect the channels leads arrive through and the tools you reach them with." />
      <IntegrationErrorBanner integrations={rows} onFix={setManaging} />
      <QueryState
        isLoading={integrations.isLoading}
        isError={integrations.isError}
        onRetry={() => void integrations.refetch()}
        isEmpty={rows.length === 0}
        emptyIcon={Plug}
        emptyTitle="No integrations available"
        loading={<ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <li key={i}><Skeleton className="h-44 w-full" /></li>)}</ul>}
      >
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <IntegrationCard key={row.id} integration={row} canManage onConnect={() => setConnecting(row.provider)} onManage={() => setManaging(row.provider)} />
          ))}
        </ul>
      </QueryState>
      <ConnectDrawer provider={connecting} onClose={() => setConnecting(null)} />
      <ManageDrawer integration={managed} onClose={() => setManaging(null)} />
    </div>
  )
}
