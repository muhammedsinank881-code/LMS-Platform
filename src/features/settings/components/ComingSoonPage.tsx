import { Construction } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { NoAccess } from '@/components/common/NoAccess'
import { usePermission } from '@/hooks/use-permission'
import type { SettingsSection } from '@/types'
import { settingsLink } from '../sections'

export function ComingSoonPage({ section }: { section: SettingsSection }) {
  const { canSection } = usePermission()
  const link = settingsLink(section)
  if (!canSection(section)) return <NoAccess />
  return (
    <EmptyState
      icon={Construction}
      title={link.label}
      description="Coming in Phase 2. This section is in the navigation so the structure stays final."
    />
  )
}

export function IntegrationsSettingsPage() {
  return <ComingSoonPage section="integrations" />
}
export function ApiKeysSettingsPage() {
  return <ComingSoonPage section="api_keys" />
}
