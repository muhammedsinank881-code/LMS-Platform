import { PageHeader } from '@/components/layout/PageHeader'

export function StudentCertificatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="View and download your earned certificates and course completions."
      />
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        <p className="text-sm">Earned certificates will be displayed here.</p>
      </div>
    </div>
  )
}
