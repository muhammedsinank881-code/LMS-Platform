import { PageHeader } from '@/components/layout/PageHeader'

export function StudentAttendancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Monitor your class attendance records and session participation."
      />
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        <p className="text-sm">Attendance records will be displayed here.</p>
      </div>
    </div>
  )
}
