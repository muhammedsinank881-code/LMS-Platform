import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui'
import { INTEGRATION_PROVIDER_LABEL, type Integration, type IntegrationProvider } from '@/types'

/** Lists every integration that is broken or expired, with its suggested fix and a way in. */
export function IntegrationErrorBanner({ integrations, onFix }: { integrations: Integration[]; onFix: (provider: IntegrationProvider) => void }) {
  const broken = integrations.filter((row) => row.status === 'error' || row.status === 'expired')
  if (broken.length === 0) return null
  return (
    <div role="alert" className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
      <p className="flex items-center gap-2 font-medium"><TriangleAlert aria-hidden="true" className="h-4 w-4" />{broken.length === 1 ? 'An integration needs attention' : `${broken.length} integrations need attention`}</p>
      <ul className="space-y-2">
        {broken.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span><strong>{INTEGRATION_PROVIDER_LABEL[row.provider]}:</strong> {row.error?.message} {row.error?.suggestedFix}</span>
            <Button size="sm" variant="outline" onClick={() => onFix(row.provider)}>{row.status === 'expired' ? 'Reconnect' : 'Fix'}</Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
