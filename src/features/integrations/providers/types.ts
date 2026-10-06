import type { IntegrationProvider } from '@/types'

export interface ConnectFlowProps {
  provider: IntegrationProvider
  /** Called after the integration is connected and the user is finished. */
  onDone: () => void
  /** Called when the user backs out before connecting. */
  onCancel: () => void
}
