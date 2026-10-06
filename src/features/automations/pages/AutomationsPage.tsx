import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LayoutTemplate, Plus } from 'lucide-react'
import { NoAccess } from '@/components/common/NoAccess'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { AutomationsTab } from '../components/list/AutomationsTab'
import { RunsTab } from '../components/runs/RunsTab'

/** /automations: the list and the run history. Needs `automations` view; creating needs create. */
export function AutomationsPage() {
  const { can } = usePermission()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [gallery, setGallery] = useState(false)
  const tab = params.get('tab') === 'runs' || params.get('run') ? 'runs' : 'automations'

  if (!can('automations', 'view')) return <NoAccess title="You don't have access to automations" />

  return (
    <div>
      <PageHeader
        title="Automations"
        description="Rules that run your sales process: when something happens, if it matches, do these steps."
        actions={
          can('automations', 'create') ? (
            <>
              <Button variant="outline" onClick={() => setGallery(true)}>
                <LayoutTemplate />
                Start from a template
              </Button>
              <Button onClick={() => navigate('/automations/new')}>
                <Plus />
                Create automation
              </Button>
            </>
          ) : null
        }
      />
      <Tabs
        value={tab}
        onValueChange={(next) =>
          setParams(next === 'runs' ? { tab: 'runs' } : {}, { replace: true })
        }
      >
        <TabsList aria-label="Automations sections">
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
        </TabsList>
        <TabsContent value="automations">
          <AutomationsTab galleryOpen={gallery} onGalleryChange={setGallery} />
        </TabsContent>
        <TabsContent value="runs">
          <RunsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
