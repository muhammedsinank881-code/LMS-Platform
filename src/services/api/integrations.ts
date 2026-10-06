import type {
  ConnectIntegrationInput,
  Integration,
  IntegrationEvent,
  IntegrationProvider,
  SendTestLeadResult,
  UpdateIntegrationInput,
} from '@/types'

/** Needs the Integrations settings section. Every provider call is simulated by the mock backend. */
export interface IntegrationsApiClient {
  /** One entry per provider, connected or not. */
  list(): Promise<Integration[]>
  /** The last 50 events, newest first. */
  events(provider: IntegrationProvider): Promise<IntegrationEvent[]>
  /** Marks the provider as connecting while the OAuth or credentials step is open. */
  begin(provider: IntegrationProvider): Promise<Integration>
  connect(input: ConnectIntegrationInput): Promise<Integration>
  update(provider: IntegrationProvider, input: UpdateIntegrationInput): Promise<Integration>
  /** Clears an error or expired state after the user re-authorises. */
  reconnect(provider: IntegrationProvider): Promise<Integration>
  /** Also cancels a connection that never finished. */
  disconnect(provider: IntegrationProvider): Promise<Integration>
  verifyWebhook(): Promise<Integration>
  syncTemplates(): Promise<{ count: number }>
  sendTestEmail(to: string): Promise<{ sentTo: string }>
  /** Creates a lead through the real ingestion pipeline. */
  sendTestLead(provider: IntegrationProvider, formId?: string): Promise<SendTestLeadResult>
  testCall(): Promise<{ callLogId: string }>
  syncSpend(): Promise<{ created: number }>
}
