import { PageHeader } from '@/components/layout/PageHeader'

export function StudentSubmissionsCodeReviewsPage() {
  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Student Submissions & Code Reviews"
        description="Review code submissions, leave feedback comments, grade assignments, and track submission queues."
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Code Reviews' },
        ]}
      />
    </div>
  )
}

export default StudentSubmissionsCodeReviewsPage
