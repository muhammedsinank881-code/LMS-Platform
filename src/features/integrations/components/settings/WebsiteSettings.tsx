import { CopyField } from '@/components/common/CopyField'
import { useWorkspace } from '@/hooks/use-workspace'
import type { SettingsPanelProps } from './types'

export function WebsiteSettings({ integration }: SettingsPanelProps) {
  const { tenantId } = useWorkspace()
  const config = integration.config
  if (config?.provider !== 'website') return null
  const snippet = `<script async src="https://cdn.leadflow.example/track.js" data-workspace="${tenantId ?? 'workspace'}"></script>`
  return (
    <div className="space-y-4">
      <p className="text-sm">Tracking <strong>{config.domain}</strong>. {integration.leadsReceived} leads attributed so far.</p>
      <CopyField label="Tracking snippet" value={snippet} multiline />
    </div>
  )
}
