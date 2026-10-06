import type {
  WebhookDelivery,
  WebhookEndpoint,
  WebhookEndpointCreated,
  WebhookEndpointView,
  WebhookEvent,
  WebhookInput,
  WebhookOutcome,
} from '@/types'

/** Needs the API keys & webhooks settings section. The signing secret is returned once. */
export interface WebhooksApiClient {
  list(): Promise<WebhookEndpointView[]>
  /** Endpoint choices for the automation builder. Needs automations edit, not the settings section. */
  options(): Promise<Array<{ id: string; label: string }>>
  create(input: WebhookInput): Promise<WebhookEndpointCreated>
  update(id: string, input: WebhookInput): Promise<WebhookEndpoint>
  remove(id: string): Promise<void>
  rotateSecret(id: string): Promise<WebhookEndpointCreated>
  /** Latest first. Secrets are already redacted. */
  deliveries(endpointId: string): Promise<WebhookDelivery[]>
  redeliver(deliveryId: string): Promise<WebhookDelivery>
  sendTest(endpointId: string, event: WebhookEvent, outcome?: WebhookOutcome): Promise<WebhookDelivery>
}
