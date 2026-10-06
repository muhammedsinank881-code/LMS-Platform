import { Suspense, useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Badge, Button, Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@/components/ui'
import { formatDateTime } from '@/lib/format/date'
import { INTEGRATION_PROVIDER_LABEL, type Integration } from '@/types'
import { useDisconnect, useReconnect } from '../hooks/use-integrations'
import { PROVIDER_META, STATUS_LABEL, STATUS_TONE } from '../lib/provider-meta'
import { PROVIDER_REGISTRY } from '../registry'
import { ActivityLog } from './ActivityLog'
import { FakeOAuth } from './FakeOAuth'

function Overview({ integration, onReconnect, onDisconnect }: { integration: Integration; onReconnect: () => void; onDisconnect: () => void }) {
  const { health, error } = integration
  return (
    <div className="space-y-5">
      {error ? (
        <div role="alert" className="space-y-1 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
          <p className="font-medium">{error.message}</p>
          <p><span className="font-medium">Suggested fix:</span> {error.suggestedFix}</p>
          <Button size="sm" className="mt-2" onClick={onReconnect}>Reconnect</Button>
        </div>
      ) : null}
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-muted-foreground">Account</dt><dd className="break-words font-medium">{integration.accountLabel ?? '–'}</dd></div>
        <div><dt className="text-muted-foreground">Connected</dt><dd>{integration.connectedAt ? formatDateTime(integration.connectedAt) : '–'}</dd></div>
        <div><dt className="text-muted-foreground">Last sync</dt><dd>{integration.lastSyncAt ? formatDateTime(integration.lastSyncAt) : 'Never'}</dd></div>
        <div><dt className="text-muted-foreground">Leads received</dt><dd>{integration.leadsReceived}</dd></div>
      </dl>
      <section aria-labelledby="health-heading" className="space-y-2">
        <h3 id="health-heading" className="text-sm font-medium">Health</h3>
        <Badge tone={health.ok ? 'success' : 'destructive'} dot>{health.ok ? 'Healthy' : 'Needs attention'}</Badge>
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
          {health.details.map((line) => <li key={line}>{line}</li>)}
        </ul>
        {health.checkedAt ? <p className="text-xs text-muted-foreground">Checked {formatDateTime(health.checkedAt)}{health.latencyMs ? ` · ${health.latencyMs} ms` : ''}</p> : null}
      </section>
      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        {integration.status !== 'connected' && !error ? null : <Button variant="outline" onClick={onReconnect}>Reconnect</Button>}
        <Button variant="destructive" onClick={onDisconnect}>Disconnect</Button>
      </div>
    </div>
  )
}

/** Details, health, settings (field mapping and options), recent activity, reconnect and disconnect. */
export function ManageDrawer({ integration, onClose }: { integration: Integration | null; onClose: () => void }) {
  const reconnect = useReconnect()
  const disconnect = useDisconnect()
  const [reauthorizing, setReauthorizing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const provider = integration?.provider
  const Settings = provider ? PROVIDER_REGISTRY[provider].Settings : null
  const label = provider ? INTEGRATION_PROVIDER_LABEL[provider] : ''

  return (
    <Drawer open={integration !== null} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent size="lg">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">{label}{integration ? <Badge tone={STATUS_TONE[integration.status]} dot>{STATUS_LABEL[integration.status]}</Badge> : null}</DrawerTitle>
          <DrawerDescription>{provider ? PROVIDER_META[provider].description : ''}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          {integration && provider && Settings ? (
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="overview"><Overview integration={integration} onReconnect={() => setReauthorizing(true)} onDisconnect={() => setConfirming(true)} /></TabsContent>
              <TabsContent value="settings">
                <Suspense fallback={<div role="status" aria-busy="true"><Skeleton className="h-40 w-full" /></div>}>
                  <Settings integration={integration} />
                </Suspense>
              </TabsContent>
              <TabsContent value="activity"><ActivityLog provider={provider} /></TabsContent>
            </Tabs>
          ) : null}
        </DrawerBody>
      </DrawerContent>
      <Modal open={reauthorizing} onOpenChange={setReauthorizing}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Reconnect {label}</ModalTitle>
            <ModalDescription>Sign in again to renew access. Your settings are kept.</ModalDescription>
          </ModalHeader>
          <div className="p-6 pt-2">
            {provider ? <FakeOAuth provider={provider} onCancel={() => setReauthorizing(false)} onAuthorized={() => reconnect.mutate(provider, { onSuccess: () => { setReauthorizing(false); toast.success(`${label} reconnected`) }, onError: () => setReauthorizing(false) })} /> : null}
          </div>
        </ModalContent>
      </Modal>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Disconnect ${label}?`}
        description={provider ? `${PROVIDER_META[provider].stops} You can connect it again at any time.` : ''}
        confirmLabel="Disconnect"
        destructive
        loading={disconnect.isPending}
        onConfirm={() => provider && disconnect.mutate(provider, { onSuccess: () => { setConfirming(false); onClose(); toast.success(`${label} disconnected`) } })}
      />
    </Drawer>
  )
}
