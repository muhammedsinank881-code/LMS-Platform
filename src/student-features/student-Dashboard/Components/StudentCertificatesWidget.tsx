import { Award, ExternalLink, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui'
import { MOCK_STUDENT_DATA } from '../../mock/student-data'

export function StudentCertificatesWidget() {
  const { certificates } = MOCK_STUDENT_DATA

  return (
    <Card className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-semibold text-foreground">Certificates</h3>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">{certificates.length} Total</span>
      </div>

      <div className="mt-3 space-y-2.5 flex-1 overflow-y-auto">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface-hover p-2.5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${cert.badgeColor} text-white shadow-sm`}>
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{cert.title}</p>
                <p className="truncate text-[10px] text-muted-foreground">{cert.issuer} • {cert.issueDate}</p>
              </div>
            </div>

            <button
              type="button"
              className="text-muted-foreground hover:text-primary transition-colors p-1"
              title="View Certificate"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}
