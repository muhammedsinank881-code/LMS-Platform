import { PageHeader } from '@/components/layout/PageHeader'

export function BatchOverviewPage() {
  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Batch Overview"
        description="View active batches, curriculum progress, schedule, and cohort analytics."
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Batch Overview' },
        ]}
      />
    </div>
  )
}

export default BatchOverviewPage
