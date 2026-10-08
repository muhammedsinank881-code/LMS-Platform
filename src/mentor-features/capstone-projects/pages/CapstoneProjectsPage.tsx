import { PageHeader } from '@/components/layout/PageHeader'

export function CapstoneProjectsPage() {
  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Capstone Projects"
        description="Track student teams, milestone deliverables, project repositories, and final evaluation scores."
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Capstone Projects' },
        ]}
      />
    </div>
  )
}

export default CapstoneProjectsPage
