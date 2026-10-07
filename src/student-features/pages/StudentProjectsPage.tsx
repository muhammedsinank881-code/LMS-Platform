import { PageHeader } from '@/components/layout/PageHeader'

export function StudentProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your ongoing projects, submissions, and mentor feedback."
      />
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        <p className="text-sm">Student projects will be listed here.</p>
      </div>
    </div>
  )
}
