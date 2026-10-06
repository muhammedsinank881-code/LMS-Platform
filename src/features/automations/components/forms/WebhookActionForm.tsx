import { Link } from 'react-router-dom'
import { useWebhookOptions } from '@/features/developer/hooks/use-webhooks'
import { PickOne } from './controls'
import type { ActionFormProps } from './types'

/** Picks one of the workspace's webhook endpoints. The call goes through the same signed, retried dispatcher. */
export function WebhookActionForm({ action, onChange, errors }: ActionFormProps<'call_webhook'>) {
  const endpoints = useWebhookOptions()
  const options = endpoints.data ?? []
  return (
    <div className="space-y-2">
      <PickOne
        label="Webhook endpoint"
        value={action.endpointId || null}
        placeholder={endpoints.isLoading ? 'Loading…' : options.length === 0 ? 'No endpoints available' : 'Choose an endpoint'}
        options={options.map((endpoint) => ({ value: endpoint.id, label: endpoint.label }))}
        error={errors[0]}
        onChange={(endpointId) => onChange({ ...action, endpointId })}
      />
      <p className="text-sm text-muted-foreground">
        Sends the lead as JSON, signed like any other delivery.{' '}
        <Link className="text-primary underline-offset-4 hover:underline" to="/settings/api-keys?tab=webhooks">Manage endpoints</Link>
      </p>
    </div>
  )
}
