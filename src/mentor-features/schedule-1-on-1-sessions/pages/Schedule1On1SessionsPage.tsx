import { PageHeader } from '@/components/layout/PageHeader'

export function Schedule1On1SessionsPage() {
  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="1-on-1 Sessions"
        description="Schedule, manage, and conduct 1-on-1 mentoring sessions with students."
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: '1-on-1 Sessions' },
        ]}
      />
    </div>
  )
}

export default Schedule1On1SessionsPage
