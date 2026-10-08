import { PageHeader } from '@/components/layout/PageHeader'

export function HelpdeskResourceHubPage() {
  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Helpdesk & Resource Hub"
        description="Resolve student doubt tickets, publish study materials, reference links, and lab guides."
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Resource Hub' },
        ]}
      />
    </div>
  )
}

export default HelpdeskResourceHubPage
