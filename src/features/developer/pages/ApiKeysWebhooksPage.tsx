import { useSearchParams } from 'react-router-dom'
import { NoAccess } from '@/components/common/NoAccess'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { SectionIntro } from '@/features/settings/components/SettingsLayout'
import { usePermission } from '@/hooks/use-permission'
import { ApiKeysTab } from '../components/ApiKeysTab'
import { DeveloperDocs } from '../components/DeveloperDocs'
import { WebhooksTab } from '../components/WebhooksTab'

const TABS = ['keys', 'webhooks', 'docs'] as const
type Tab = (typeof TABS)[number]

export function ApiKeysWebhooksPage() {
  const { canSection } = usePermission()
  const [params, setParams] = useSearchParams()
  if (!canSection('api_keys')) return <NoAccess />
  const requested = params.get('tab')
  const tab: Tab = TABS.find((item) => item === requested) ?? 'keys'
  return (
    <div className="space-y-4">
      <SectionIntro title="API keys & webhooks" description="Connect your own systems: call the API with a key, or receive events as they happen." />
      <Tabs value={tab} onValueChange={(value) => setParams({ tab: value }, { replace: true })}>
        <TabsList>
          <TabsTrigger value="keys">API keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="docs">Developer docs</TabsTrigger>
        </TabsList>
        <TabsContent value="keys"><ApiKeysTab /></TabsContent>
        <TabsContent value="webhooks"><WebhooksTab /></TabsContent>
        <TabsContent value="docs"><DeveloperDocs /></TabsContent>
      </Tabs>
    </div>
  )
}
