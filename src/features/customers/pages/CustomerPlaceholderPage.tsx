import { Link, useParams } from 'react-router-dom'
import { RoleGate } from '@/components/common/RoleGate'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, EmptyState } from '@/components/ui'
import { ShieldOff } from 'lucide-react'

/** Stand-in until the customers module is built. The convert flow links here. */
export function CustomerPlaceholderPage() {
  const { id } = useParams()
  return (
    <RoleGate
      resource="customers"
      fallback={
        <EmptyState
          icon={ShieldOff}
          title="You don't have access to customers"
          description="Ask a workspace admin if you need access."
        />
      }
    >
      <PageHeader
        title="Customer"
        description={id}
        actions={
          <Button asChild variant="outline">
            <Link to="/customers">All customers</Link>
          </Button>
        }
      />
      <div className="rounded-md border border-dashed border-border bg-surface">
        <EmptyState
          title="Customer page arrives later"
          description="This customer was created from a lead. The full customer page is built in a later step."
        />
      </div>
    </RoleGate>
  )
}
