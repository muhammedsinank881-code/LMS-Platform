import { PageHeader } from '@/components/layout/PageHeader'

export function PerformanceReportsPage() {
  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Performance Reports"
        description="View detailed analytics on student progress, attendance trends, quiz scores, and batch metrics."
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Performance Reports' },
        ]}
      />
    </div>
  )
}

export default PerformanceReportsPage
