import { PageHeader } from '@/components/layout/PageHeader'

export function StudentAssignmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments & Quizzes"
        description="Track your pending tasks, upcoming quizzes, and submitted assignments."
      />
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        <p className="text-sm">Assignments and quizzes will be listed here.</p>
      </div>
    </div>
  )
}
