import { Suspense } from 'react'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, Skeleton } from '@/components/ui'
import { INTEGRATION_PROVIDER_LABEL, type IntegrationProvider } from '@/types'
import { useBeginConnect, useDisconnect, useIntegrations } from '../hooks/use-integrations'
import { PROVIDER_META } from '../lib/provider-meta'
import { PROVIDER_REGISTRY } from '../registry'

/**
 * Hosts a provider's connection flow. It marks the provider "connecting" while open and releases it
 * if the person leaves before finishing. A full-screen sheet on phones.
 */
export function ConnectDrawer({ provider, onClose }: { provider: IntegrationProvider | null; onClose: () => void }) {
  const begin = useBeginConnect()
  const cancel = useDisconnect()
  const integrations = useIntegrations()
  const Flow = provider ? PROVIDER_REGISTRY[provider].Flow : null

  // Only a connection that never finished is released: a connected one must survive closing the drawer.
  function close() {
    const status = integrations.data?.find((row) => row.provider === provider)?.status
    if (provider && status === 'connecting') cancel.mutate(provider)
    onClose()
  }

  return (
    <Drawer open={provider !== null} onOpenChange={(open) => { if (!open) close() }}>
      <DrawerContent size="lg" onOpenAutoFocus={() => { if (provider) begin.mutate(provider) }}>
        <DrawerHeader>
          <DrawerTitle>Connect {provider ? INTEGRATION_PROVIDER_LABEL[provider] : ''}</DrawerTitle>
          <DrawerDescription>{provider ? PROVIDER_META[provider].description : ''}</DrawerDescription>
        </DrawerHeader>
        {provider && Flow ? (
          <Suspense fallback={<div role="status" aria-busy="true" className="p-6"><Skeleton className="h-48 w-full" /></div>}>
            <Flow key={provider} provider={provider} onDone={onClose} onCancel={close} />
          </Suspense>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
