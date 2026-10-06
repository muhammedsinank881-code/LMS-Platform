import { Link, useParams } from 'react-router-dom'
import { RoleGate } from '@/components/common/RoleGate'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, EmptyState } from '@/components/ui'
import { ShieldOff } from 'lucide-react'

/** Stand-in until the deal page is built. The lead's deal card links here. */
export function DealPlaceholderPage() {
  const { id } = useParams()
  return (
    <RoleGate
      resource="deals"
      fallback={
        <EmptyState
          icon={ShieldOff}
          title="You don't have access to deals"
          description="Ask a workspace admin if you need access."
        />
      }
    >
      <PageHeader
        title="Deal"
        description={id}
        actions={
          <Button asChild variant="outline">
            <Link to="/deals">All deals</Link>
          </Button>
        }
      />
      <div className="rounded-md border border-dashed border-border bg-surface">
        <EmptyState
          title="Deal page arrives in Step 9"
          description="The opportunity was created and linked to the lead. The full deal page comes with the pipeline."
        />
      </div>
    </RoleGate>
  )
}
