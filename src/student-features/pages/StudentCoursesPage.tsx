import { PageHeader } from '@/components/layout/PageHeader'

export function StudentCoursesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description="Access all your enrolled courses, syllabus, and learning modules."
      />
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        <p className="text-sm">Enrolled courses will be listed here.</p>
      </div>
    </div>
  )
}
